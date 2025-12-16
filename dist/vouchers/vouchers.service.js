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
let VouchersService = VouchersService_1 = class VouchersService extends client_1.PrismaClient {
    client;
    logger = new common_1.Logger(VouchersService_1.name);
    _normalizeText(text) {
        return text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    }
    async updateProductsStock(products, action) {
        for (const product of products) {
            await (0, rxjs_1.firstValueFrom)(await action(product));
        }
    }
    onModuleInit() {
        this.$connect();
        this.logger.log("Database connected successfully");
    }
    constructor(client) {
        super();
        this.client = client;
    }
    async handleStockChanges(type, enrichedProducts, emissionBranchId, destinationBranchId) {
        const tasks = [];
        for (const product of enrichedProducts) {
            const { productId, branchId, quantity } = product;
            switch (type) {
                case "REMITO":
                    if (emissionBranchId === destinationBranchId) {
                        tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "increase_branch_product_stock" }, {
                            branchId,
                            productId,
                            stock: quantity,
                        })));
                    }
                    else {
                        tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "descrease_branch_product_stock" }, {
                            branchId,
                            productId,
                            stock: quantity,
                        })));
                        tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "increase_branch_product_stock" }, {
                            branchId: destinationBranchId,
                            productId,
                            stock: quantity,
                        })));
                    }
                    break;
                case "FACTURA":
                    tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "increase_branch_product_stock" }, {
                        branchId: emissionBranchId,
                        productId,
                        stock: quantity,
                    })));
                    break;
                case "NOTA_CREDITO_CLIENTE":
                    tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "increase_branch_product_stock" }, {
                        branchId: emissionBranchId,
                        productId,
                        stock: quantity,
                    })));
                    break;
                case "NOTA_CREDITO_PROVEEDOR":
                    tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "descrease_branch_product_stock" }, {
                        branchId: emissionBranchId,
                        productId,
                        stock: quantity,
                    })));
                    break;
                default:
                    tasks.push((0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "descrease_branch_product_stock" }, {
                        branchId,
                        productId,
                        stock: quantity,
                    })));
                    break;
            }
        }
        await Promise.all(tasks);
    }
    async create(createVoucherDto) {
        try {
            const { products, type, emissionBranchId, paidAmount = 0, available = true, createdBy, emittedBy, deliveredBy, initialPayment, destinationBranchId, destinationBranchName, ...voucherData } = createVoucherDto;
            if (products.some((p) => p.quantity <= 0)) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "[CREATE_VOUCHER] Cada producto debe tener cantidad",
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
            const nextNumber = await (0, rxjs_1.firstValueFrom)(this.client.send({ cmd: "generate_number_voucher" }, { type, emissionBranchId }));
            await this.handleStockChanges(createVoucherDto.type, enrichedProducts, createVoucherDto.emissionBranchId, destinationBranchId);
            const totalAmount = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
            const initialPaidTotal = Array.isArray(initialPayment)
                ? initialPayment.reduce((sum, p) => sum + (p.amount ?? 0), 0)
                : 0;
            const remainingAmount = totalAmount - initialPaidTotal;
            const resolvedStatus = remainingAmount <= 0 ? "PAGADO" : "PENDIENTE";
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
                                throw new Error(`[CREATE_PAYMENT] El banco ${payment.bankId} no existe.`);
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
            const { limit, offset, conditionPayment, search, type, emissionBranchId, contactId, branch, dateFrom, dateUntil, } = pagination;
            const whereClause = {
                available: true,
            };
            if (type)
                whereClause.type = type;
            if (conditionPayment)
                whereClause.conditionPayment = conditionPayment;
            if (emissionBranchId)
                whereClause.emissionBranchId = emissionBranchId;
            if (contactId)
                whereClause.contactId = contactId;
            if (branch)
                whereClause.emissionBranchName = {
                    contains: branch,
                    mode: "insensitive",
                };
            if (dateFrom || dateUntil) {
                whereClause.emissionDate = {};
                if (dateFrom)
                    whereClause.emissionDate.gte = dateFrom;
                if (dateUntil)
                    whereClause.emissionDate.lte = dateUntil;
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
            const vouchers = await this.eVoucher.findMany({
                where: whereClause,
                take: limit,
                skip: (offset - 1) * limit,
                include: {
                    products: true,
                    payments: true,
                },
                orderBy: [{ createdAt: "desc" }, { number: "desc" }],
            });
            const total = await this.eVoucher.count({ where: whereClause });
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
                message: `[FIND_ALL_CREDIT_VOUCHERS] Error fetching vouchers: ${error.message}`,
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
            if (dto.cardId) {
                const card = await this.eCard.findUnique({ where: { id: dto.cardId } });
                if (!card) {
                    return {
                        status: common_1.HttpStatus.BAD_REQUEST,
                        message: `[REGISTER_PAYMENT] La tarjeta indicada no existe.`,
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
    async findOneVoucher(id) {
        const voucher = await this.eVoucher.findFirst({
            where: {
                id,
                available: true,
            },
            include: { products: true, payments: true },
        });
        return voucher;
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
        const formatDate = (d) => new Date(d).toLocaleDateString("es-AR");
        const headerFields = [];
        const pushIfExists = (label, value) => {
            if (value !== null && value !== undefined && value !== "") {
                headerFields.push(`<p><strong>${label}:</strong> ${value}</p>`);
            }
        };
        pushIfExists("N°", voucher.number);
        pushIfExists("Fecha", formatDate(voucher.emissionDate));
        pushIfExists("Cliente", voucher.contactName);
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
        const productsHtml = voucher.products
            .map((p) => `
        <tr>
          <td>${p.description}</td>
          <td>${p.quantity}</td>
          <td>$${p.price.toFixed(2)}</td>
          <td>$${(p.price * p.quantity).toFixed(2)}</td>
        </tr>
      `)
            .join("");
        const paymentsHtml = voucher.payments
            .map((p) => `
        <li>${p.method} | $${p.amount.toFixed(2)} | ${formatDate(p.receivedAt)}</li>
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

      ${voucher.payments.length > 0
            ? `<div class="payments">
              <strong>Pagos recibidos:</strong>
              <ul>${paymentsHtml}</ul>
            </div>`
            : ""}

      
    </body>
  </html>
  `;
    }
    async generateVoucherHtml(voucherId) {
        const voucher = await this.eVoucher.findUnique({
            where: { id: voucherId },
            include: { products: true, payments: true },
        });
        if (!voucher)
            throw new Error("No se encontró el comprobante");
        return await this.buildHtml(voucher);
    }
    async generateNextNumber(dto) {
        const { type, emissionBranchId } = dto;
        const lastVoucher = await this.eVoucher.findFirst({
            where: { type, emissionBranchId },
            orderBy: { number: "desc" },
            select: { number: true },
        });
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
    async deleteVoucher(deleteVoucherDto) {
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
        switch (voucher.type) {
            case client_1.VoucherType.P:
                await this.updateProductsStock(voucher.products, async (p) => {
                    return this.client.send({ cmd: "increase_branch_product_stock" }, {
                        branchId: voucher.emissionBranchId,
                        productId: p.productId,
                        stock: p.quantity,
                    });
                });
                break;
            case client_1.VoucherType.REMITO:
                if (voucher.emissionBranchId === voucher.destinationBranchId) {
                    await this.updateProductsStock(voucher.products, async (p) => {
                        return this.client.send({ cmd: "descrease_branch_product_stock" }, {
                            branchId: voucher.emissionBranchId,
                            productId: p.productId,
                            stock: p.quantity,
                        });
                    });
                }
                else {
                    await this.updateProductsStock(voucher.products, async (p) => {
                        await this.client.send({ cmd: "increase_branch_product_stock" }, {
                            branchId: voucher.emissionBranchId,
                            productId: p.productId,
                            stock: p.quantity,
                        });
                        return this.client.send({ cmd: "descrease_branch_product_stock" }, {
                            branchId: voucher.destinationBranchId,
                            productId: p.productId,
                            stock: p.quantity,
                        });
                    });
                }
                break;
            case client_1.VoucherType.NOTA_CREDITO_PROVEEDOR:
                await this.updateProductsStock(voucher.products, async (p) => {
                    return this.client.send({ cmd: "increase_branch_product_stock" }, {
                        branchId: voucher.emissionBranchId,
                        productId: p.productId,
                        stock: p.quantity,
                    });
                });
                break;
            case client_1.VoucherType.NOTA_CREDITO_CLIENTE:
                await this.updateProductsStock(voucher.products, async (p) => {
                    return this.client.send({ cmd: "descrease_branch_product_stock" }, {
                        branchId: voucher.emissionBranchId,
                        productId: p.productId,
                        stock: p.quantity,
                    });
                });
                break;
            default:
                throw new Error(`Delete not implemented for type ${voucher.type}`);
        }
        await this.eVoucher.delete({ where: { id } });
        return { message: "Voucher deleted successfully" };
    }
    async deleteVoucherAll() {
        const voucher = await this.eVoucher.deleteMany();
        return "Succefully";
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = VouchersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(config_1.NATS_SERVICE)),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map