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
exports.CreateInitialPaymentDto = void 0;
const client_1 = require("@prisma/client");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const payment_method_enum_1 = require("../../enum/payment-method.enum");
class CreateInitialPaymentDto {
    method;
    amount;
    currency;
    exchangeRate;
    originalAmount;
    receivedAt;
    receivedBy;
    bankId;
    cardId;
    chequeNumber;
    chequeBank;
    chequeDueDate;
    chequeStatus;
    observation;
    branchId;
    branchName;
}
exports.CreateInitialPaymentDto = CreateInitialPaymentDto;
__decorate([
    (0, class_validator_1.IsEnum)(payment_method_enum_1.PaymentMethod),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateInitialPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.Currency),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 4 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateInitialPaymentDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsNumber)({ maxDecimalPlaces: 2 }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateInitialPaymentDto.prototype, "originalAmount", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateInitialPaymentDto.prototype, "receivedAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "receivedBy", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "bankId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "cardId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "chequeNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "chequeBank", void 0);
__decorate([
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], CreateInitialPaymentDto.prototype, "chequeDueDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "chequeStatus", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "observation", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "branchId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInitialPaymentDto.prototype, "branchName", void 0);
//# sourceMappingURL=initial-payment.dto.js.map