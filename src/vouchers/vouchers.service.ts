import { CreateVoucherDto } from "./dto/create-voucher.dto";
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { ConditionPayment } from "src/enum";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { NATS_SERVICE } from "src/config";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";

@Injectable()
export class VouchersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(VouchersService.name);
  private _normalizeText(text: string) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  onModuleInit() {
    this.$connect();
    this.logger.log("Database connected successfully");
  }

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  async create(createVoucherDto: CreateVoucherDto) {
    try {
      const {
        products,
        paidAmount = 0,
        available = true,
        createdBy,
        emittedBy,
        deliveredBy,
        initialPayment,
        ...voucherData
      } = createVoucherDto;

      // 1. Validación de productos
      if (products.some((p) => p.quantity <= 0 || p.price <= 0)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            "[CREATE_VOUCHER] Cada producto debe tener cantidad y precio válidos.",
        };
      }

      // 2. Calcular subtotales y total
      const enrichedProducts = products.map((p) => ({
        productId: p.productId,
        branchId: p.branchId,
        isReserved: p.isReserved,
        description: p.description,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.quantity * p.price,
      }));

      if (createVoucherDto.type === "P") {
        enrichedProducts.map(async (p) => {
          const discountBranchProducts = await firstValueFrom(
            this.client.send(
              { cmd: "descrease_branch_product_stock" },
              {
                branchId: p.branchId,
                productId: p.productId,
                stock: p.quantity,
              }
            )
          ); // For type P, all products are reserved
        });
      }

      const totalAmount = enrichedProducts.reduce(
        (sum, p) => sum + p.subtotal,
        0
      );

      if (totalAmount <= 0) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "[CREATE_VOUCHER] El total debe ser mayor a cero.",
        };
      }

      // 3. Calcular pagos iniciales
      const initialPaidTotal = Array.isArray(initialPayment)
        ? initialPayment.reduce((sum, p) => sum + (p.amount ?? 0), 0)
        : 0;

      const remainingAmount = totalAmount - initialPaidTotal;

      // 4. Generar número si es REMITO
      let resolvedNumber = createVoucherDto.number;

      if (createVoucherDto.type === "REMITO") {
        const lastRemito = await this.eVoucher.findMany({
          where: { type: "REMITO" },
          orderBy: { emissionDate: "desc" },
          take: 1,
          select: { number: true },
        });

        const lastRaw = lastRemito[0]?.number ?? "R-00000";
        const lastNumeric = parseInt(lastRaw.split("-")[1] || "0", 10);
        const next = lastNumeric + 1;
        resolvedNumber = `R-${next.toString().padStart(5, "0")}`;
      }

      const resolvedStatus = remainingAmount <= 0 ? "PAGADO" : "PENDIENTE";

      const exists = await this.eVoucher.findUnique({
        where: { number: resolvedNumber },
      });

      if (exists) {
        return {
          status: HttpStatus.CONFLICT,
          message: `[CREATE_VOUCHER] Ya existe un comprobante con número ${resolvedNumber}`,
        };
      }

      // 5. Transacción atómica: comprobante, productos y pagos
      const result = await this.$transaction(async (tx) => {
        const voucher = await tx.eVoucher.create({
          data: {
            ...voucherData,
            number: resolvedNumber,
            status: resolvedStatus,
            totalAmount,
            paidAmount,
            remainingAmount,
            available,
            createdBy,
            emittedBy,
            deliveredBy,
          },
        });

        const productsWithVoucherId = enrichedProducts.map((p) => ({
          ...p,
          voucherId: voucher.id,
        }));

        await tx.eVoucherProduct.createMany({
          data: productsWithVoucherId,
        });

        if (Array.isArray(initialPayment)) {
          for (const payment of initialPayment) {
            if (payment.bankId) {
              const bank = await tx.eBank.findUnique({
                where: { id: payment.bankId },
              });

              if (!bank) {
                throw new Error(
                  `[CREATE_PAYMENT] El banco ${payment.bankId} no existe.`
                );
              }
            }

            await tx.ePayment.create({
              data: {
                ...payment,
                voucherId: voucher.id,
              },
            });
          }
        }

        return voucher;
      });

      return {
        success: true,
        data: result,
        message: initialPayment?.length
          ? `Comprobante registrado con ${initialPayment.length} pago(s) inicial(es).`
          : "Comprobante registrado correctamente.",
      };
    } catch (error) {
      if (
        error.code === "P2003" &&
        error.meta?.target?.includes("EPayment_bankId_fkey")
      ) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message:
            "[CREATE_VOUCHER] El banco indicado en el pago no existe o está deshabilitado.",
        };
      }

      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[CREATE_VOUCHER] No se pudo crear el comprobante: ${error.message}`,
      };
    }
  }

  async findAllConditionPayment(pagination: PaginationDto) {
    try {
      const { limit, offset, conditionPayment, search, emissionBranchId } =
        pagination;
      const whereClause: any = {
        emissionBranchId,
        conditionPayment,
        available: true,
      };

      if (search) {
        const normalizedSearch = this._normalizeText(search);

        whereClause.OR = [
          {
            number: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          {
            contactName: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          {
            emissionBranchName: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
        ];
      }

      const vouchers = await this.eVoucher.findMany({
        where: whereClause,
        take: limit,
        skip: (offset - 1) * limit,
        include: {
          products: true,
          payments: true,
        },
      });

      const total = await this.eVoucher.count({
        where: whereClause,
      });

      return {
        data: vouchers,
        meta: {
          total,
          page: offset,
          lastPage: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_ALL_CREDIT_VOUCHERS] Error al obtener los comprobantes de crédito: ${error.message}`,
      };
    }
  }

  async registerPayment(dto: CreatePaymentDto) {
    try {
      // Validar existencia del comprobante
      const voucher = await this.eVoucher.findUnique({
        where: { id: dto.voucherId, available: true },
      });
      if (!voucher) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: `[REGISTER_PAYMENT] El comprobante ${dto.voucherId} no existe.`,
        };
      }

      // Validar existencia del banco (si aplica)
      if (dto.bankId) {
        const bank = await this.eBank.findUnique({ where: { id: dto.bankId } });
        if (!bank) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: `[REGISTER_PAYMENT] El banco indicado no existe.`,
          };
        }
      }

      // Crear el pago
      const payment = await this.ePayment.create({
        data: { ...dto },
      });

      // Actualizar el estado del comprobante (si corresponde)
      const pagosAnteriores = await this.ePayment.findMany({
        where: { voucherId: dto.voucherId },
      });

      const totalPagado = pagosAnteriores.reduce(
        (sum, p) => sum + (p.amount ?? 0),
        0
      );

      const remaining = (voucher.totalAmount ?? 0) - totalPagado;

      await this.eVoucher.update({
        where: { id: dto.voucherId },
        data: {
          paidAmount: totalPagado,
          remainingAmount: remaining,
          status: remaining <= 0 ? "PAGADO" : "PENDIENTE",
          conditionPayment:
            remaining <= 0 ? ConditionPayment.CASH : ConditionPayment.CREDIT,
        },
      });

      return {
        success: true,
        data: payment,
        message: "Pago registrado correctamente.",
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[REGISTER_PAYMENT] No se pudo registrar el pago: ${error.message}`,
      };
    }
  }

  async findAllReservedProductsByBranchId(pagination: PaginationDto) {
    const { emissionBranchId, limit, offset, search } = pagination;

    const whereClause: any = {
      isReserved: true,
      voucher: {
        emissionBranchId,
      },
    };

    if (search) {
      whereClause.OR = [
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          voucher: {
            contactName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.eVoucherProduct.findMany({
        where: whereClause,
        skip: (offset - 1) * limit,
        take: limit,
        include: {
          voucher: {
            select: {
              products: true, // si tenés relación con products
              id: true,
              number: true,
              contactId: true,
              contactName: true,
              conditionPayment: true,
              emissionBranchId: true,
              status: true,
              totalAmount: true,
              paidAmount: true,
              remainingAmount: true,
              emissionDate: true,
            },
          },
        },
      }),
      this.eVoucherProduct.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page: offset,
      lastPage: Math.ceil(total / limit),
    };
  }

  async updateReservedProduct(id: string, data: UpdateVoucherProductItemDto) {
    try {
      const { isReserved } = data;
      const voucherProductsExists = await this.eVoucherProduct.update({
        where: {
          id,
        },
        data: {
          isReserved,
        },
      });

      if (!voucherProductsExists) {
        return {
          status: HttpStatus.NOT_FOUND,
          message: `[UPDATE_RESERVED_PRODUCT] Producto reservado con ID ${id} no encontrado.`,
        };
      }

      return {
        status: HttpStatus.OK,
        message: `[UPDATE_RESERVED_PRODUCT] Producto reservado actualizado correctamente.`,
        data: voucherProductsExists,
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[UPDATE_RESERVED_PRODUCT] Error al actualizar el producto reservado: ${error.message}`,
      };
    }
  }
}
