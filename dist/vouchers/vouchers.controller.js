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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VouchersController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const vouchers_service_1 = require("./vouchers.service");
const create_voucher_dto_1 = require("./dto/create-voucher.dto");
const update_voucher_dto_1 = require("./dto/update-voucher.dto");
let VouchersController = class VouchersController {
    vouchersService;
    constructor(vouchersService) {
        this.vouchersService = vouchersService;
    }
    create(createVoucherDto) {
        return this.vouchersService.create(createVoucherDto);
    }
    findAll() {
        return this.vouchersService.findAll();
    }
    findOne(id) {
        return this.vouchersService.findOne(id);
    }
    update(updateVoucherDto) {
        return this.vouchersService.update(updateVoucherDto.id, updateVoucherDto);
    }
    remove(id) {
        return this.vouchersService.remove(id);
    }
};
exports.VouchersController = VouchersController;
__decorate([
    (0, microservices_1.MessagePattern)('createVoucher'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_voucher_dto_1.CreateVoucherDto]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "create", null);
__decorate([
    (0, microservices_1.MessagePattern)('findAllVouchers'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "findAll", null);
__decorate([
    (0, microservices_1.MessagePattern)('findOneVoucher'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "findOne", null);
__decorate([
    (0, microservices_1.MessagePattern)('updateVoucher'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_voucher_dto_1.UpdateVoucherDto]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "update", null);
__decorate([
    (0, microservices_1.MessagePattern)('removeVoucher'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VouchersController.prototype, "remove", null);
exports.VouchersController = VouchersController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [vouchers_service_1.VouchersService])
], VouchersController);
//# sourceMappingURL=vouchers.controller.js.map