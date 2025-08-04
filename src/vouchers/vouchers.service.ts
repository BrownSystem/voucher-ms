import { CreateVoucherDto } from "./dto/create-voucher.dto";
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { PrismaClient, VoucherType } from "@prisma/client";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { ConditionPayment } from "src/enum";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { NATS_SERVICE } from "src/config";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { GenerateNumberVoucherDto } from "./dto/generate-number.dto";
import { DeleteVoucherDto } from "./dto/delete-voucher.dto";
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

  private async handleStockChanges(
    type: "REMITO" | "FACTURA" | string,
    enrichedProducts: {
      productId: string;
      branchId: string | undefined;
      isReserved: boolean;
      description: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[],
    emissionBranchId: string,
    destinationBranchId: string
  ): Promise<void> {
    const tasks: Promise<any>[] = [];

    for (const product of enrichedProducts) {
      const { productId, branchId, quantity } = product;

      switch (type) {
        case "REMITO":
          if (emissionBranchId === destinationBranchId) {
            // Aumentar stock en la misma sucursal
            tasks.push(
              firstValueFrom(
                this.client.send(
                  { cmd: "increase_branch_product_stock" },
                  {
                    branchId,
                    productId,
                    stock: quantity,
                  }
                )
              )
            );
          } else {
            // Transferencia entre sucursales
            tasks.push(
              firstValueFrom(
                this.client.send(
                  { cmd: "descrease_branch_product_stock" },
                  {
                    branchId,
                    productId,
                    stock: quantity,
                  }
                )
              )
            );
            tasks.push(
              firstValueFrom(
                this.client.send(
                  { cmd: "increase_branch_product_stock" },
                  {
                    branchId: destinationBranchId,
                    productId,
                    stock: quantity,
                  }
                )
              )
            );
          }
          break;

        case "FACTURA":
          tasks.push(
            firstValueFrom(
              this.client.send(
                { cmd: "increase_branch_product_stock" },
                {
                  branchId: emissionBranchId,
                  productId,
                  stock: quantity,
                }
              )
            )
          );
          break;

        case "NOTA_CREDITO_CLIENTE":
          tasks.push(
            firstValueFrom(
              this.client.send(
                { cmd: "increase_branch_product_stock" },
                {
                  branchId: emissionBranchId,
                  productId,
                  stock: quantity,
                }
              )
            )
          );
          break;

        case "NOTA_CREDITO_PROVEEDOR":
          tasks.push(
            firstValueFrom(
              this.client.send(
                { cmd: "descrease_branch_product_stock" },
                {
                  branchId: emissionBranchId,
                  productId,
                  stock: quantity,
                }
              )
            )
          );
          break;

        default:
          // Otros comprobantes: disminuir stock
          tasks.push(
            firstValueFrom(
              this.client.send(
                { cmd: "descrease_branch_product_stock" },
                {
                  branchId,
                  productId,
                  stock: quantity,
                }
              )
            )
          );
          break;
      }
    }

    await Promise.all(tasks);
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
        destinationBranchId,
        destinationBranchName,
        ...voucherData
      } = createVoucherDto;

      // 1. Validar productos
      if (products.some((p) => p.quantity <= 0)) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "[CREATE_VOUCHER] Cada producto debe tener cantidad",
        };
      }

      // 2. Enriquecer productos
      const enrichedProducts = products.map((p) => ({
        productId: p.productId,
        branchId: p.branchId,
        isReserved: p.isReserved,
        description: p.description,
        quantity: p.quantity,
        price: p.price,
        subtotal: p.quantity * p.price,
      }));

      // 3. Manejo de stock
      await this.handleStockChanges(
        createVoucherDto.type,
        enrichedProducts,
        createVoucherDto.emissionBranchId,
        destinationBranchId
      );

      // 4. Calcular totales
      const totalAmount = enrichedProducts.reduce(
        (sum, p) => sum + p.subtotal,
        0
      );

      const initialPaidTotal = Array.isArray(initialPayment)
        ? initialPayment.reduce((sum, p) => sum + (p.amount ?? 0), 0)
        : 0;

      const remainingAmount = totalAmount - initialPaidTotal;

      // 5. Generar número para remito
      let resolvedNumber = createVoucherDto.number;
      if (createVoucherDto.type === "REMITO") {
        const lastRemito = await this.eVoucher.findFirst({
          where: { type: "REMITO" },
          orderBy: { emissionDate: "desc" },
          select: { number: true },
        });

        const lastNumber = parseInt(
          lastRemito?.number?.split("-")[1] || "0",
          10
        );
        resolvedNumber = `R-${(lastNumber + 1).toString().padStart(5, "0")}`;
      }

      const resolvedStatus = remainingAmount <= 0 ? "PAGADO" : "PENDIENTE";

      // 6. Transacción atómica
      const result = await this.$transaction(async (tx) => {
        const voucher = await tx.eVoucher.create({
          data: {
            ...voucherData,
            destinationBranchId,
            destinationBranchName,
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

        await tx.eVoucherProduct.createMany({
          data: enrichedProducts.map((p) => ({ ...p, voucherId: voucher.id })),
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
              data: { ...payment, voucherId: voucher.id },
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
      const { limit, offset, conditionPayment, search, type } = pagination;
      const whereClause: any = {
        type,
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

  async buildHtml(voucher: any): Promise<string> {
    const formatDate = (d: Date) => new Date(d).toLocaleDateString("es-AR");

    const headerFields: string[] = [];

    const pushIfExists = (label: string, value: any) => {
      if (value !== null && value !== undefined && value !== "") {
        headerFields.push(`<p><strong>${label}:</strong> ${value}</p>`);
      }
    };

    // Datos comunes
    pushIfExists("N°", voucher.number);
    pushIfExists("Fecha", formatDate(voucher.emissionDate));
    pushIfExists("Cliente", voucher.contactName);

    // Según tipo de comprobante
    switch (voucher.type) {
      case "P":
        pushIfExists("Sucursal Emisión", voucher.emissionBranchName);
        break;
      case "REMITO":
        pushIfExists("Sucursal Emisión", voucher.emissionBranchName);
        pushIfExists("Sucursal Destino", voucher.destinationBranchName);
        break;
      case "FACTURA":
      case "NOTA_CREDITO_PROVEEDOR":
        pushIfExists("Sucursal Emisión", voucher.emissionBranchName);
        pushIfExists("ID Sucursal Emisión", voucher.emissionBranchId);
        pushIfExists("Condición de Pago", voucher.conditionPayment);
        pushIfExists("Moneda", voucher.currency);
        if (voucher.type === "NOTA_CREDITO_PROVEEDOR") {
          pushIfExists("Observación", voucher.observation);
        }
        break;
    }

    const headerHtml = headerFields.join("\n");

    const productsHtml = voucher.products
      .map(
        (p) => `
        <tr>
          <td>${p.description}</td>
          <td>${p.quantity}</td>
          <td>$${p.price.toFixed(2)}</td>
          <td>$${(p.price * p.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    const paymentsHtml = voucher.payments
      .map(
        (p) => `
        <li>${p.method} | $${p.amount.toFixed(2)} | ${formatDate(
          p.receivedAt
        )}</li>
      `
      )
      .join("");

    const subtotal = voucher.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const total = voucher.totalAmount ?? subtotal;
    const paid = voucher.paidAmount ?? 0;
    const remaining = voucher.remainingAmount ?? total - paid;

    return `
  <html>
    <head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
      <style>
        * {
          font-family: 'Outfit', sans-serif;
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          padding: 40px;
          color: #333;
          background-color: #fff;
          font-size: 14px;
        }
        h1 {
          text-align: center;
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
        }
        .header {
          margin-bottom: 20px;
        }
        .header p {
          margin: 5px 0;
          font-weight: 400;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          margin-top: 16px;
          border: 1px solid #e5e7eb;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 10px;
          text-align: left;
        }
        th {
          background-color: #f9fafb;
          font-weight: 500;
        }
        .totals {
          width: 280px;
          float: right;
          margin-top: 20px;
          font-size: 13px;
          border: 1px solid #e5e7eb;
        }
        .totals tr {
          border-bottom: 1px solid #eee;
        }
        .totals td {
          padding: 8px 10px;
        }
        .totals td:last-child {
          text-align: right;
        }
        .payments {
          margin-top: 30px;
          font-size: 13px;
        }
        .payments ul {
          padding-left: 18px;
          margin-top: 6px;
        }
        .footer {
          font-size: 11px;
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          color: #6b7280;
          border-top: 1px solid #d1d5db;
          padding-top: 16px;
        }
      </style>
    </head>
    <body>
      <h1>${voucher.type || "Comprobante"}</h1>

      <div class="header">
        ${headerHtml}
      </div>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>

      <table class="totals">
        <tr><td><strong>Subtotal:</strong></td><td>$${subtotal.toFixed(2)}</td></tr>
        <tr><td><strong>Total:</strong></td><td>$${total.toFixed(2)}</td></tr>
        <tr><td><strong>Pagado:</strong></td><td>$${paid.toFixed(2)}</td></tr>
        <tr><td><strong>Saldo:</strong></td><td style="color:#dc2626;"><strong>$${remaining.toFixed(2)}</strong></td></tr>
      </table>

      ${
        voucher.payments.length > 0
          ? `<div class="payments">
              <strong>Pagos recibidos:</strong>
              <ul>${paymentsHtml}</ul>
            </div>`
          : ""
      }

      
    </body>
  </html>
  `;
  }

  async generateVoucherHtml(voucherId: string): Promise<string> {
    const voucher = await this.eVoucher.findUnique({
      where: { id: voucherId },
      include: { products: true, payments: true },
    });

    if (!voucher) throw new Error("No se encontró el comprobante");

    return await this.buildHtml(voucher);
  }

  async generateNextNumber(dto: GenerateNumberVoucherDto) {
    const { type, emissionBranchId } = dto;

    const lastVoucher = await this.eVoucher.findFirst({
      where: { type, emissionBranchId },
      orderBy: { number: "desc" },
      select: { number: true },
    });

    // Prefijo según tipo
    const prefixMap = {
      FACTURA: "F",
      REMITO: "R",
      NOTA_CREDITO: "NC",
      P: "P",
    };

    const prefix = prefixMap[type] || type;

    let nextNumericPart = 1;

    if (lastVoucher?.number) {
      const match = lastVoucher.number.match(/(\d+)$/);
      if (match) {
        nextNumericPart = parseInt(match[1], 10) + 1;
      }
    }

    const paddedNumber = String(nextNumericPart).padStart(4, "0");
    return {
      number: `${prefix}-${paddedNumber}`,
    };
  }

  async deleteVoucher(deleteVoucherDto: DeleteVoucherDto) {
    const { id, typeOfDelete } = deleteVoucherDto;
    const voucher = await this.eVoucher.findUnique({
      where: { id },
      select: {
        type: true,
        emissionBranchId: true,
        destinationBranchId: true,
        products: true,
        payments: true,
      },
    });

    if (typeOfDelete === "SOFT") {
      await this.eVoucher.delete({
        where: { id },
      });
      return {
        message: "Voucher deleted successfully",
      };
    } else {
      if (voucher?.type === VoucherType.REMITO) {
        voucher?.products.map(async (product) => {
          const increaseBranchProducts = await firstValueFrom(
            this.client.send(
              { cmd: "increase_branch_product_stock" },
              {
                branchId: product.branchId,
                productId: product.productId,
                stock: product.quantity,
              }
            )
          );
          const decreaseBranchProducts = await firstValueFrom(
            this.client.send(
              { cmd: "descrease_branch_product_stock" },
              {
                branchId: voucher.destinationBranchId,
                productId: product.productId,
                stock: product.quantity,
              }
            )
          );
        });
        await this.eVoucher.delete({
          where: { id },
        });
        return {
          message: "Voucher deleted successfully",
        };
      }
    }
  }

  async deleteVoucherAll() {
    const voucher = await this.eVoucher.deleteMany();
    return "Succefully";
  }
}
