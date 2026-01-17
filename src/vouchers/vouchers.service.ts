import { CreateVoucherDto } from "./dto/create-voucher.dto";
import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from "@nestjs/common";
import { EPayment, PrismaClient, VoucherType } from "@prisma/client";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { ConditionPayment } from "src/enum";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { NATS_SERVICE } from "src/config";
import { ClientProxy, RpcException } from "@nestjs/microservices";
import { firstValueFrom, first } from "rxjs";
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

  private async updateProductsStock(
    products: any[],
    action: (p: any) => Promise<any>,
  ) {
    for (const product of products) {
      await firstValueFrom(await action(product));
    }
  }

  private async _loadTransaction({
    boxId,
    type,
    amount,
    paymentMethod,
    description,
    currency,
    contactId,
    contactName,
    branchId,
    branchName,
    cancelledInvoiceNumber,
    voucherId,
    voucherNumber,
    paymentId,
  }) {
    const transaction = await firstValueFrom(
      this.client.send(
        { cmd: "load_transaction_type_voucher" },
        {
          boxId,
          type,
          amount,
          paymentMethod,
          description,
          currency,
          contactId,
          contactName,
          branchId,
          branchName,
          voucherId,
          voucherNumber,
          cancelledInvoiceNumber,
          paymentId,
        },
      ),
    );

    // Si por algún motivo devuelve objeto en lugar de throw
    if (transaction?.status && transaction.status !== HttpStatus.OK) {
      throw new RpcException(transaction.message);
    }
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
    destinationBranchId: string,
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
                  },
                ),
              ),
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
                  },
                ),
              ),
            );
            tasks.push(
              firstValueFrom(
                this.client.send(
                  { cmd: "increase_branch_product_stock" },
                  {
                    branchId: destinationBranchId,
                    productId,
                    stock: quantity,
                  },
                ),
              ),
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
                },
              ),
            ),
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
                },
              ),
            ),
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
                },
              ),
            ),
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
                },
              ),
            ),
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
        type,
        boxId,
        emissionBranchId,
        paidAmount = 0,
        available = true,
        createdBy,
        emittedBy,
        deliveredBy,
        initialPayment,
        destinationBranchId,
        destinationBranchName,
        cancelledInvoiceNumber,
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

      const nextNumber = await firstValueFrom(
        this.client.send(
          { cmd: "generate_number_voucher" },
          { type, emissionBranchId },
        ),
      );

      // 3. Manejo de stock
      await this.handleStockChanges(
        createVoucherDto.type,
        enrichedProducts,
        createVoucherDto.emissionBranchId,
        destinationBranchId,
      );

      // 4. Calcular totales
      const totalAmount = enrichedProducts.reduce(
        (sum, p) => sum + p.subtotal,
        0,
      );

      const initialPaidTotal = Array.isArray(initialPayment)
        ? initialPayment.reduce((sum, p) => sum + (p.amount ?? 0), 0)
        : 0;

      const remainingAmount = totalAmount - initialPaidTotal;

      const resolvedStatus = remainingAmount <= 0 ? "PAGADO" : "PENDIENTE";

      // 6. Transacción atómica
      const result = await this.$transaction(async (tx) => {
        const voucher = await tx.eVoucher.create({
          data: {
            ...voucherData,
            destinationBranchId,
            destinationBranchName,
            number: nextNumber?.number,
            emissionBranchId,
            status: resolvedStatus,
            totalAmount,
            paidAmount,
            type,
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
                  `[CREATE_PAYMENT] El banco ${payment.bankId} no existe.`,
                );
              }
            }

            if (payment.cardId) {
              const card = await tx.eCard.findUnique({
                where: { id: payment.cardId },
              });
              if (!card) {
                throw new Error(
                  `[CREATE_PAYMENT] La tarjeta ${payment.cardId} no existe.`,
                );
              }
            }

            const createPayment = await tx.ePayment.create({
              data: { ...payment, voucherId: voucher.id },
            });

            if (!createPayment) {
              return {
                message: `[CREATE_PAYMENT_IN_VOUCHER_CREATE] No se pudo generarar el pago.`,
                status: HttpStatus.INTERNAL_SERVER_ERROR,
              };
            } else {
              if (
                createPayment.method === "CHEQUE_TERCERO" &&
                voucher?.type === "P"
              ) {
                //Agregar a la billetera
                const checkBook = await this.eCheckBook.create({
                  data: {
                    branchId: voucher?.emissionBranchId,
                    chequeNumber: createPayment.chequeNumber,
                    chequeDueDate: createPayment.chequeDueDate,
                    chequeReceived: createPayment.chequeReceived,
                    chequeBank: createPayment.chequeBank,
                    amount: createPayment?.amount,
                  },
                });
              }
              // Registrar transacción en caja
              if (boxId) {
                await this._loadTransaction({
                  boxId,
                  type,
                  amount: payment?.amount,
                  paymentMethod: payment?.method,
                  description: payment?.observation,
                  currency: payment?.currency,
                  contactId: createVoucherDto?.contactId,
                  contactName: createVoucherDto?.contactName,
                  branchId: emissionBranchId,
                  branchName: createVoucherDto?.emissionBranchName,
                  cancelledInvoiceNumber,
                  voucherId: voucher?.id,
                  voucherNumber: voucher?.number,
                  paymentId: createPayment?.id,
                });
              }
            }
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
      const {
        limit,
        offset,
        conditionPayment,
        search,
        type,
        emissionBranchId,
        contactId,
        branch,
        dateFrom,
        dateUntil,
        productId,
      } = pagination;

      const whereClause: any = {
        available: true,
        ...(productId && {
          products: {
            some: { productId },
          },
        }),
      };

      if (type) whereClause.type = type;
      if (conditionPayment) whereClause.conditionPayment = conditionPayment;
      if (emissionBranchId) whereClause.emissionBranchId = emissionBranchId;
      if (contactId) whereClause.contactId = contactId;
      if (branch) {
        whereClause.emissionBranchName = {
          contains: branch,
          mode: "insensitive",
        };
      }

      if (dateFrom || dateUntil) {
        whereClause.emissionDate = {};
        if (dateFrom) whereClause.emissionDate.gte = dateFrom;
        if (dateUntil) whereClause.emissionDate.lte = dateUntil;
      }

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

      // Obtener todos los vouchers que cumplen con los filtros
      const allVouchers = await this.eVoucher.findMany({
        where: whereClause,
        include: {
          products: true,
          payments: true,
        },
        orderBy: [{ createdAt: "desc" }, { number: "desc" }],
      });

      // Filtrar por productQuantity si hay productId
      const filteredVouchers = productId
        ? allVouchers
            .map((voucher) => {
              const productQuantity = voucher.products
                .filter((p) => p.productId === productId)
                .reduce((acc, p) => acc + p.quantity, 0);

              return {
                ...voucher,
                productQuantity,
              };
            })
            .filter((voucher) => voucher.productQuantity > 0)
        : allVouchers;

      // Paginar manualmente
      const paginatedVouchers = filteredVouchers.slice(
        (offset - 1) * limit,
        offset * limit,
      );

      return {
        data: paginatedVouchers,
        meta: {
          total: filteredVouchers.length,
          page: offset,
          lastPage: Math.ceil(filteredVouchers.length / limit),
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_ALL_CREDIT_VOUCHERS] Error fetching vouchers: ${error.message}`,
      };
    }
  }

  // METRICAS
  // DEUDAS DE CONTACTOS
  async findAllByContact(pagination: PaginationDto) {
    try {
      const {
        conditionPayment,
        search,
        type,
        emissionBranchId,
        contactId,
        branch,
        dateFrom,
        dateUntil,
      } = pagination;

      const whereClause: any = {
        available: true,
        remainingAmount: { gt: 0 },
      };

      if (type) whereClause.type = type;
      if (conditionPayment) whereClause.conditionPayment = conditionPayment;
      if (emissionBranchId) whereClause.emissionBranchId = emissionBranchId;
      if (contactId) whereClause.contactId = contactId;
      if (branch)
        whereClause.emissionBranchName = {
          contains: branch,
          mode: "insensitive",
        };

      if (dateFrom || dateUntil) {
        whereClause.emissionDate = {};
        if (dateFrom) whereClause.emissionDate.gte = dateFrom;
        if (dateUntil) whereClause.emissionDate.lte = dateUntil;
      }

      if (search) {
        const normalizedSearch = this._normalizeText(search);

        whereClause.OR = [
          { contactName: { contains: normalizedSearch, mode: "insensitive" } },
          {
            emissionBranchName: {
              contains: normalizedSearch,
              mode: "insensitive",
            },
          },
          { number: { contains: normalizedSearch, mode: "insensitive" } },
        ];
      }

      // 📊 Agrupación y suma total de deuda por contacto
      const groupedDebts = await this.eVoucher.groupBy({
        by: ["contactId", "contactName", "type"],
        where: whereClause,
        _sum: { remainingAmount: true },
        _count: { _all: true },
        orderBy: { _sum: { remainingAmount: "desc" } },
      });

      // 🔍 Buscamos los vouchers con include
      const vouchers = await this.eVoucher.findMany({
        where: whereClause,
        select: {
          id: true,
          number: true,
          contactId: true,
          contactName: true,
          payments: true,
          products: true,
        },
      });

      // 📦 Agrupamos los vouchers por contacto
      // 📦 Agrupamos los vouchers por contacto
      const vouchersByContact = vouchers.reduce(
        (acc, v) => {
          const contactKey = v.contactId ?? "no-contact"; // 👈 evitamos null

          if (!acc[contactKey]) acc[contactKey] = [];

          acc[contactKey].push({
            id: v.id,
            number: v.number,
            payments: v.payments,
            products: v.products,
          });

          return acc;
        },
        {} as Record<string, any[]>,
      );

      // 🧩 Combinamos la información de deuda + lista de vouchers
      const result = groupedDebts.map((g) => ({
        contactId: g.contactId,
        contactName: g.contactName,
        voucherType: g.type,
        voucherCount: g._count._all,
        totalDeuda: g._sum.remainingAmount ?? 0,
        vouchers: vouchersByContact[g.contactId ?? "no-contact"] ?? [],
      }));

      return {
        data: result,
        meta: {
          totalContactos: result.length,
          totalDeudaGeneral: result.reduce((acc, c) => acc + c.totalDeuda, 0),
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_ALL_CONTACT_DEBT] Error fetching debts: ${error.message}`,
      };
    }
  }

  // VENTAS MENSUALES
  // POR SUCURSAL
  async findMonthlySalesByBranch(month: number, year: number) {
    try {
      // 📅 Calculamos el rango de fechas del mes
      const dateFrom = new Date(year, month - 1, 1);
      const dateUntil = new Date(year, month, 0, 23, 59, 59, 999);

      // 🧠 Agrupamos por sucursal, filtrando opcionalmente por branchId
      const groupedSales = await this.eVoucher.groupBy({
        by: ["emissionBranchName"],
        where: {
          available: true,
          emissionDate: {
            gte: dateFrom,
            lte: dateUntil,
          },
          totalAmount: { gt: 0 },
        },
        _sum: {
          totalAmount: true,
          remainingAmount: true,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _sum: { totalAmount: "desc" },
        },
      });

      // 🧩 Armamos la respuesta clara
      const result = groupedSales.map((g) => ({
        branchName: g.emissionBranchName ?? "Sin sucursal",
        ventas: g._sum.totalAmount ?? 0,
        cobranzas: g._sum.remainingAmount ?? 0,
        cantidadComprobantes: g._count._all,
      }));

      return {
        data: result,
        meta: {
          totalSucursales: result.length,
          totalGeneral: result.reduce((acc, s) => acc + s.ventas, 0),
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_MONTHLY_SALES_BY_BRANCH] Error fetching sales by branch: ${error.message}`,
      };
    }
  }

  async findSalesByBranch(branchId?: string) {
    try {
      // 📅 1️⃣ Última fecha registrada
      const lastVoucher = await this.eVoucher.findFirst({
        where: {
          available: true,
          totalAmount: { gt: 0 },
          ...(branchId && { emissionBranchId: branchId }),
        },
        orderBy: {
          emissionDate: "desc",
        },
        select: {
          emissionDate: true,
        },
      });

      if (!lastVoucher) {
        return {
          data: [],
          meta: {
            totalSucursales: 0,
            totalGeneral: 0,
            salesEvolution: [],
          },
        };
      }

      const lastDate = new Date(lastVoucher.emissionDate);
      const lastYear = lastDate.getFullYear();
      const lastMonth = lastDate.getMonth(); // 0 = enero

      // 🧠 2️⃣ Totales generales
      const groupedSales = await this.eVoucher.groupBy({
        by: ["emissionBranchName"],
        where: {
          available: true,
          totalAmount: { gt: 0 },
          ...(branchId && { emissionBranchId: branchId }),
        },
        _sum: {
          remainingAmount: true,
          paidAmount: true,
        },
        _count: {
          _all: true,
        },
        orderBy: {
          _sum: { totalAmount: "desc" },
        },
      });

      const result = groupedSales.map((g) => ({
        branchName: g.emissionBranchName ?? "Sin sucursal",
        saldoPendiente: g._sum.remainingAmount ?? 0,
        ingresos: g._sum.paidAmount ?? 0,
        cantidadComprobantes: g._count._all,
      }));

      // 📊 3️⃣ Evolución mensual
      const monthNames = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Agos",
        "Sept",
        "Oct",
        "Nov",
        "Dic",
      ];

      type MonthlySales = {
        mes: string;
        saldoPendiente: number;
        ingresos: number;
      };

      const salesEvolution: MonthlySales[] = [];

      for (let m = 0; m <= lastMonth; m++) {
        const startDate = new Date(lastYear, m, 1);
        const endDate = new Date(lastYear, m + 1, 0, 23, 59, 59, 999);

        const monthlyTotals = await this.eVoucher.aggregate({
          _sum: {
            remainingAmount: true,
            paidAmount: true,
          },
          where: {
            available: true,
            emissionDate: {
              gte: startDate,
              lte: endDate,
            },
            totalAmount: { gt: 0 },
            ...(branchId && { emissionBranchId: branchId }),
          },
        });

        salesEvolution.push({
          mes: monthNames[m],
          saldoPendiente: monthlyTotals._sum.remainingAmount ?? 0,
          ingresos: monthlyTotals._sum.paidAmount ?? 0,
        });
      }

      return {
        data: salesEvolution,
        meta: {
          totalSucursales: result.length,
          totalGeneral: result.reduce((acc, s) => acc + s.saldoPendiente, 0),
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[FIND_SALES_BY_BRANCH] Error al traer la información: ${error.message}`,
      };
    }
  }

  async registerPayment(dto: CreatePaymentDto) {
    try {
      const { boxId, ...data } = dto;
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

      // Validar existencia del card (si aplica)
      if (dto.cardId) {
        const card = await this.eCard.findUnique({ where: { id: dto.cardId } });
        if (!card) {
          return {
            status: HttpStatus.BAD_REQUEST,
            message: `[REGISTER_PAYMENT] La tarjeta indicada no existe.`,
          };
        }
      }

      // Crear el pago
      const payment = await this.ePayment.create({
        data: { ...data },
      });

      if (!payment) {
        return {
          message: `[CREATE_PAYMENT] No se pudo generarar el pago.`,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        };
      } else {
        if (payment.method === "CHEQUE_TERCERO" && voucher?.type === "P") {
          //Agregar a la billetera
          const checkBook = await this.eCheckBook.create({
            data: {
              branchId: voucher?.emissionBranchId,
              chequeNumber: payment.chequeNumber,
              chequeDueDate: payment.chequeDueDate,
              chequeReceived: payment.chequeReceived,
              chequeBank: payment.chequeBank,
              amount: payment?.amount,
            },
          });
        }

        // Actualizar el estado del comprobante (si corresponde)
        const pagosAnteriores = await this.ePayment.findMany({
          where: { voucherId: dto.voucherId },
        });

        await this._loadTransaction({
          boxId,
          type: voucher?.type,
          amount: payment?.amount,
          paymentMethod: payment?.method,
          description: payment?.observation,
          currency: payment?.currency,
          contactId: voucher?.contactId,
          contactName: voucher?.contactName,
          branchId: voucher?.emissionBranchId,
          branchName: voucher?.emissionBranchName,
          voucherId: voucher?.id,
          voucherNumber: voucher?.number,
          cancelledInvoiceNumber: null,
          paymentId: payment?.id,
        });

        const totalPagado = pagosAnteriores.reduce(
          (sum, p) => sum + (p.amount ?? 0),
          0,
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
      }

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

  async findOneVoucher(id: string) {
    const voucher = await this.eVoucher.findFirst({
      where: {
        id,
        available: true,
      },
      include: { products: true, payments: true },
    });

    return voucher;
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
        pushIfExists("Observación", voucher.observation);

        break;
      case "REMITO":
        pushIfExists("Sucursal Emisión", voucher.emissionBranchName);
        pushIfExists("Sucursal Destino", voucher.destinationBranchName);
        pushIfExists("Observación", voucher.observation);

        break;
      case "FACTURA":
      case "NOTA_CREDITO_PROVEEDOR":
        pushIfExists("Sucursal Emisión", voucher.emissionBranchName);
        pushIfExists("ID Sucursal Emisión", voucher.emissionBranchId);
        pushIfExists("Condición de Pago", voucher.conditionPayment);
        pushIfExists("Moneda", voucher.currency);
        pushIfExists("Observación", voucher.observation);

        break;
    }

    const headerHtml = headerFields.join("\n");

    const productsRows = await Promise.all(
      voucher.products.map(async (p) => {
        const response = await firstValueFrom(
          this.client.send({ cmd: "search_products" }, { search: p.productId }),
        );

        const product = response.data?.[0];

        if (!product) {
          return "";
        }

        return `
      <tr>
        <td>${product.code}</td>
        <td>${product.description}</td>
        <td>${p.quantity}</td>
        <td>$${product.price?.toFixed(2) ?? "0.00"}</td>
        <td>$${((product.price ?? 0) * p.quantity).toFixed(2)}</td>
      </tr>
    `;
      }),
    );

    const productsHtml = productsRows.join("");

    const paymentsHtml = voucher.payments
      .map(
        (p) => `
        <li>${p.method} | $${p.amount.toFixed(2)} | ${formatDate(
          p.receivedAt,
        )}</li>
      `,
      )
      .join("");

    const subtotal = voucher.products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
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
            <th>Código</th>
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
        available: true,
      },
    });

    if (!voucher) {
      throw new Error("Voucher not found");
    }

    if (typeOfDelete === "SOFT") {
      await this.eVoucher.update({
        where: { id },
        data: { available: false },
      });
      return { message: "Voucher soft deleted successfully" };
    }

    // Manejo de tipos de voucher
    switch (voucher.type) {
      case VoucherType.P:
        await this.updateProductsStock(voucher.products, async (p) => {
          return this.client.send(
            { cmd: "increase_branch_product_stock" },
            {
              branchId: voucher.emissionBranchId,
              productId: p.productId,
              stock: p.quantity,
            },
          );
        });
        break;

      case VoucherType.REMITO:
        if (voucher.emissionBranchId === voucher.destinationBranchId) {
          await this.updateProductsStock(voucher.products, async (p) => {
            return this.client.send(
              { cmd: "descrease_branch_product_stock" },
              {
                branchId: voucher.emissionBranchId,
                productId: p.productId,
                stock: p.quantity,
              },
            );
          });
        } else {
          await this.updateProductsStock(voucher.products, async (p) => {
            await this.client.send(
              { cmd: "increase_branch_product_stock" },
              {
                branchId: voucher.emissionBranchId, // ⚠️ revisar si debe ser product.branchId
                productId: p.productId,
                stock: p.quantity,
              },
            );
            return this.client.send(
              { cmd: "descrease_branch_product_stock" },
              {
                branchId: voucher.destinationBranchId,
                productId: p.productId,
                stock: p.quantity,
              },
            );
          });
        }
        break;

      case VoucherType.NOTA_CREDITO_PROVEEDOR:
        await this.updateProductsStock(voucher.products, async (p) => {
          return this.client.send(
            { cmd: "increase_branch_product_stock" },
            {
              branchId: voucher.emissionBranchId,
              productId: p.productId,
              stock: p.quantity,
            },
          );
        });
        break;

      case VoucherType.NOTA_CREDITO_CLIENTE:
        await this.updateProductsStock(voucher.products, async (p) => {
          return this.client.send(
            { cmd: "descrease_branch_product_stock" },
            {
              branchId: voucher.emissionBranchId,
              productId: p.productId,
              stock: p.quantity,
            },
          );
        });
        break;

      default:
        throw new Error(`Delete not implemented for type ${voucher.type}`);
    }

    // Borrar voucher finalmente
    await this.eVoucher.delete({ where: { id } });

    return { message: "Voucher deleted successfully" };
  }

  async deletePaymentById(id: string) {
    try {
      const payment = await this.ePayment.delete({
        where: {
          id,
        },
      });

      const voucher = await this.findOneVoucher(payment?.voucherId);

      const paidAmount = (voucher?.paidAmount ?? 0) - (payment?.amount ?? 0);
      const remainingAmount = (voucher?.totalAmount ?? 0) - paidAmount;

      const voucherUpdate = await this.eVoucher.update({
        where: {
          id: payment?.voucherId,
        },
        data: {
          paidAmount,
          remainingAmount,
          status: "PENDIENTE",
          conditionPayment: "CREDIT",
        },
      });

      if (!payment) {
        return {
          message: "[DELETE_PAYMENT] No se encuentra el pago.",
          status: HttpStatus.BAD_REQUEST,
        };
      }

      return voucherUpdate;
    } catch (error) {
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `[DELETE_PAYMENT] No se pudo eliminar el pago: ${error.message}`,
      };
    }
  }

  async deleteVoucherAll() {
    await this.eVoucher.deleteMany();
    return "Successfully";
  }
}
