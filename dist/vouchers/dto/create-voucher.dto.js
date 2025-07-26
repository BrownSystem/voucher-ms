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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVoucherDto = void 0;
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const voucher_product_item_dto_1 = require("./voucher-product-item.dto");
const initial_payment_dto_1 = require("./initial-payment.dto");
class CreateVoucherDto {
    number;
    letter;
    type;
    emissionDate;
    dueDate;
    emissionBranchId;
    emissionBranchName;
    destinationBranchId;
    destinationBranchName;
    contactId;
    contactName;
    conditionPayment;
    currency;
    exchangeRate;
    products;
    totalAmount;
    paidAmount;
    observation;
    available;
    createdBy;
    emittedBy;
    deliveredBy;
    initialPayment;
}
exports.CreateVoucherDto = CreateVoucherDto;
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type !== "REMITO"),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "letter", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.VoucherType),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateVoucherDto.prototype, "emissionDate", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateVoucherDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === "REMITO"),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "emissionBranchId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === "REMITO"),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "emissionBranchName", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === "REMITO"),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "destinationBranchId", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => o.type === "REMITO"),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "destinationBranchName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "contactId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "contactName", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.ConditionPayment),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "conditionPayment", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Currency),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => voucher_product_item_dto_1.VoucherProductItemDto),
    __metadata("design:type", Array)
], CreateVoucherDto.prototype, "products", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "totalAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateVoucherDto.prototype, "paidAmount", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "observation", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateVoucherDto.prototype, "available", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "createdBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "emittedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateVoucherDto.prototype, "deliveredBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => initial_payment_dto_1.CreateInitialPaymentDto),
    __metadata("design:type", Array)
], CreateVoucherDto.prototype, "initialPayment", void 0);
//# sourceMappingURL=create-voucher.dto.js.map