"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var VouchersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const enum_1 = require("../enum");
let VouchersService = VouchersService_1 = class VouchersService extends client_1.PrismaClient {
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
    async create(createVoucherDto) {
        try {
            const { products, paidAmount = 0, available = true, createdBy, emittedBy, deliveredBy, initialPayment, ...voucherData } = createVoucherDto;
            if (products.some((p) => p.quantity <= 0 || p.price <= 0)) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "[CREATE_VOUCHER] Cada producto debe tener cantidad y precio válidos.",
                };
            }
            const enrichedProducts = products.map((p) => ({
                productId: p.productId,
                description: p.description,
                quantity: p.quantity,
                price: p.price,
                subtotal: p.quantity * p.price,
            }));
            const totalAmount = enrichedProducts.reduce((sum, p) => sum + p.subtotal, 0);
            const initialPaidTotal = Array.isArray(initialPayment)
                ? initialPayment.reduce((sum, p) => sum + (p.amount ?? 0), 0)
                : 0;
            const remainingAmount = totalAmount - paidAmount;
            if (totalAmount <= 0) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "[CREATE_VOUCHER] El total debe ser mayor a cero.",
                };
            }
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
                        products: { create: enrichedProducts },
                    },
                    include: { products: true },
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
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = VouchersService_1 = __decorate([
    (0, common_1.Injectable)()
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map