"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let PaymentsService = PaymentsService_1 = class PaymentsService extends client_1.PrismaClient {
    logger = new common_1.Logger(PaymentsService_1.name);
    onModuleInit() {
        void this.$connect();
        this.logger.log("Connected to the database [Payments]");
    }
    async create(createPaymentDto) {
        try {
            const payment = await this.ePayment.create({
                data: {
                    ...createPaymentDto,
                },
            });
            await this.eVoucher.update({
                where: { id: createPaymentDto.voucherId },
                data: {
                    paidAmount: {
                        increment: createPaymentDto.amount,
                    },
                    remainingAmount: {
                        decrement: createPaymentDto.amount,
                    },
                },
            });
            return payment;
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[CREATE_PAYMENT] Error al crear el pago: ${error.message}`,
            };
        }
    }
    async findAll(voucherId) {
        return this.ePayment.findMany({
            where: {
                voucherId,
            },
        });
    }
    async findOne(id) {
        try {
            return this.ePayment.findUnique({ where: { id } });
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[GET_PAYMENT] Error al obtener: ${error.message}`,
            };
        }
    }
    async update(id, updatePaymentDto) {
        try {
            return await this.ePayment.update({
                where: { id },
                data: updatePaymentDto,
            });
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[UPDATE_PAYMENT] Error al actualizar: ${error.message}`,
            };
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)()
], PaymentsService);
//# sourceMappingURL=payments.service.js.map