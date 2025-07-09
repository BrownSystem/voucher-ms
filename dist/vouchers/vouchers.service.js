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
let VouchersService = VouchersService_1 = class VouchersService extends client_1.PrismaClient {
    logger = new common_1.Logger(VouchersService_1.name);
    onModuleInit() {
        this.$connect();
        this.logger.log('Database connected successfully');
    }
    create(createVoucherDto) {
        return 'This action adds a new voucher';
    }
    findAll() {
        return `This action returns all vouchers`;
    }
    findOne(id) {
        return `This action returns a #${id} voucher`;
    }
    update(id, updateVoucherDto) {
        return `This action updates a #${id} voucher`;
    }
    remove(id) {
        return `This action removes a #${id} voucher`;
    }
};
exports.VouchersService = VouchersService;
exports.VouchersService = VouchersService = VouchersService_1 = __decorate([
    (0, common_1.Injectable)()
], VouchersService);
//# sourceMappingURL=vouchers.service.js.map