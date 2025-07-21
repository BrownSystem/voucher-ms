"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var VouchersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const enum_1 = require("../enum");
const config_1 = require("../config");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const puppeteer_1 = require("puppeteer");
let VouchersService = VouchersService_1 = class VouchersService extends client_1.PrismaClient {
    client;
    logger = new common_1.Logger(VouchersService_1.name);
    _normalizeText(text) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }
    onModuleInit() {
        this.$connect();
        this.logger.log("Database connected successfully");
    }
    constructor(client) {
        super();
        this.client = client;
    }
    async create(createVoucherDto) {
        try {
            const { products, paidAmount = 0, available = true, createdBy, emittedBy, deliveredBy, initialPayment, destinationBranchId, ...voucherData } = createVoucherDto;
            if (products.some((p) => p.quantity <= 0 ||
                (p.price <= 0 && createVoucherDto.type !== "REMITO"))) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "[CREATE_VOUCHER] Cada producto debe tener cantidad y precio válidos.",
                };
            }
            const enrichedProducts = products.map((p) => ({
                productId: p.productId,
                branchId: p.branchId,
                isReserved: p.isReserved,
                description: p.description,
                quantity: p.quantity,
                price: p.price,
                subtotal: p.quantity * p.price,
            }));
            if (createVoucherDto.type === "REMITO") {
                enrichedProducts.map(async (p) => {
                    const decreaseBranchProducts = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "descrease_branch_product_stock" }, {
                        branchId: p.branchId,
                        productId: p.productId,
                        stock: p.quantity,
                    }));
                    const increaseBranchProducts = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "increase_branch_product_stock" }, {
                        branchId: destinationBranchId,
                        productId: p.productId,
                        stock: p.quantity,
                    }));
                });
            }
            else {
                enrichedProducts.map(async (p) => {
                    const decreaseBranchProducts = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "descrease_branch_product_stock" }, {
                        branchId: p.branchId,
                        productId: p.productId,
                        stock: p.quantity,
                    }));
                });
            }
            const totalAmount = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
            if (totalAmount <= 0 && createVoucherDto.type !== "REMITO") {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "[CREATE_VOUCHER] El total debe ser mayor a cero.",
                };
            }
            const initialPaidTotal = Array.isArray(initialPayment)
                ? initialPayment.reduce((sum, p) => sum + (p.amount ?? 0), 0)
                : 0;
            const remainingAmount = totalAmount - initialPaidTotal;
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
                    status: common_1.HttpStatus.CONFLICT,
                    message: `[CREATE_VOUCHER] Ya existe un comprobante con número ${resolvedNumber}`,
                };
            }
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
                                throw new Error(`[CREATE_PAYMENT] El banco ${payment.bankId} no existe.`);
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
        }
        catch (error) {
            if (error.code === "P2003" &&
                error.meta?.target?.includes("EPayment_bankId_fkey")) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "[CREATE_VOUCHER] El banco indicado en el pago no existe o está deshabilitado.",
                };
            }
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[CREATE_VOUCHER] No se pudo crear el comprobante: ${error.message}`,
            };
        }
    }
    async findAllConditionPayment(pagination) {
        try {
            const { limit, offset, conditionPayment, search, emissionBranchId } = pagination;
            const whereClause = {
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
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[FIND_ALL_CREDIT_VOUCHERS] Error al obtener los comprobantes de crédito: ${error.message}`,
            };
        }
    }
    async registerPayment(dto) {
        try {
            const voucher = await this.eVoucher.findUnique({
                where: { id: dto.voucherId, available: true },
            });
            if (!voucher) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: `[REGISTER_PAYMENT] El comprobante ${dto.voucherId} no existe.`,
                };
            }
            if (dto.bankId) {
                const bank = await this.eBank.findUnique({ where: { id: dto.bankId } });
                if (!bank) {
                    return {
                        status: common_1.HttpStatus.BAD_REQUEST,
                        message: `[REGISTER_PAYMENT] El banco indicado no existe.`,
                    };
                }
            }
            const payment = await this.ePayment.create({
                data: { ...dto },
            });
            const pagosAnteriores = await this.ePayment.findMany({
                where: { voucherId: dto.voucherId },
            });
            const totalPagado = pagosAnteriores.reduce((sum, p) => sum + (p.amount ?? 0), 0);
            const remaining = (voucher.totalAmount ?? 0) - totalPagado;
            await this.eVoucher.update({
                where: { id: dto.voucherId },
                data: {
                    paidAmount: totalPagado,
                    remainingAmount: remaining,
                    status: remaining <= 0 ? "PAGADO" : "PENDIENTE",
                    conditionPayment: remaining <= 0 ? enum_1.ConditionPayment.CASH : enum_1.ConditionPayment.CREDIT,
                },
            });
            return {
                success: true,
                data: payment,
                message: "Pago registrado correctamente.",
            };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[REGISTER_PAYMENT] No se pudo registrar el pago: ${error.message}`,
            };
        }
    }
    async findAllReservedProductsByBranchId(pagination) {
        const { emissionBranchId, limit, offset, search } = pagination;
        const whereClause = {
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
                            products: true,
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
    async updateReservedProduct(id, data) {
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
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: `[UPDATE_RESERVED_PRODUCT] Producto reservado con ID ${id} no encontrado.`,
                };
            }
            return {
                status: common_1.HttpStatus.OK,
                message: `[UPDATE_RESERVED_PRODUCT] Producto reservado actualizado correctamente.`,
                data: voucherProductsExists,
            };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: `[UPDATE_RESERVED_PRODUCT] Error al actualizar el producto reservado: ${error.message}`,
            };
        }
    }
    async buildHtml(voucher) {
        const date = new Date(voucher.emissionDate).toLocaleDateString("es-AR");
        const products = voucher.products
            .map((p) => `
        <tr>
          <td>${p.description}</td>
          <td>${p.quantity}</td>
          <td>$${p.price.toFixed(2)}</td>
          <td>$${(p.price * p.quantity).toFixed(2)}</td>
        </tr>
      `)
            .join("");
        const payments = voucher.payments
            .map((p) => `
        <li>${p.method} | $${p.amount.toFixed(2)} | ${new Date(p.receivedAt).toLocaleDateString("es-AR")}</li>
      `)
            .join("");
        const subtotal = voucher.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
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
        <h1>${voucher.type || "Factura"}</h1>

        <div class="header">
          <p><strong>N°:</strong> ${voucher.number}</p>
          <p><strong>Fecha:</strong> ${date}</p>
          <p><strong>Cliente:</strong> ${voucher.contactName || "Cliente N/D"}</p>
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
            ${products}
          </tbody>
        </table>

        <table class="totals">
          <tr><td><strong>Subtotal:</strong></td><td>$${subtotal.toFixed(2)}</td></tr>
          <tr><td><strong>Total:</strong></td><td>$${total.toFixed(2)}</td></tr>
          <tr><td><strong>Pagado:</strong></td><td>$${paid.toFixed(2)}</td></tr>
          <tr><td><strong>Saldo:</strong></td><td style="color:#dc2626;"><strong>$${remaining.toFixed(2)}</strong></td></tr>
        </table>

        ${voucher.payments.length > 0
            ? `<div class="payments">
                <strong>Pagos recibidos:</strong>
                <ul>${payments}</ul>
              </div>`
            : ""}

        <div class="footer">
          <div>
            <strong>Contacto</strong><br />
            (555) 1234 - 5678<br />
            hello@business.com<br />
            www.sitioweb.com
          </div>
          <div>
            <strong>Datos para pago</strong><br />
            Banco: Banco<br />
            CBU/CVU: 0000 1234 5678<br />
            Alias: empresa.alias<br />
            Fecha estimada: ${date}
          </div>
        </div>
      </body>
    </html>
  `;
    }
    async generateVoucherPdf(voucherId) {
        const voucher = await this.eVoucher.findUnique({
            where: { id: voucherId },
            include: { products: true, payments: true },
        });
        if (!voucher)
            throw new Error("No se encontró el comprobante");
        const html = await this.buildHtml(voucher);
        const browser = await puppeteer_1.default.launch();
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdfUint8 = await page.pdf({ format: "A4", printBackground: true });
        await browser.close();
        return Buffer.from(pdfUint8);
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = VouchersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.NATS_SERVICE)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map