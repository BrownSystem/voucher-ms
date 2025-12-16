import {
  ConditionPayment,
  Currency,
  VoucherStatus,
  VoucherType,
} from "@prisma/client";
import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { VoucherProductItemDto } from "./voucher-product-item.dto";
import { CreateInitialPaymentDto } from "./initial-payment.dto";

export class CreateVoucherDto {
  @IsString()
  @IsOptional()
  letter?: string;

  @IsEnum(VoucherType)
  type: VoucherType;

  @IsDate()
  @Type(() => Date)
  emissionDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  dueDate?: Date;

  @ValidateIf((o) => o.type === "REMITO")
  @IsString()
  emissionBranchId: string;

  @ValidateIf((o) => o.type === "REMITO")
  @IsString()
  emissionBranchName: string;

  @ValidateIf((o) => o.type === "REMITO")
  @IsString()
  destinationBranchId: string;

  @ValidateIf((o) => o.type === "REMITO")
  @IsString()
  destinationBranchName: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsEnum(ConditionPayment)
  @IsOptional()
  conditionPayment?: ConditionPayment;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsOptional()
  exchangeRate?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VoucherProductItemDto)
  products: VoucherProductItemDto[];

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  totalAmount?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  paidAmount?: number;

  @IsString()
  @IsOptional()
  observation?: string;

  @IsBoolean()
  @IsOptional()
  available?: boolean;

  @IsString()
  @IsOptional()
  createdBy?: string;

  @IsString()
  @IsOptional()
  emittedBy?: string;

  @IsString()
  @IsOptional()
  deliveredBy?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInitialPaymentDto)
  initialPayment?: CreateInitialPaymentDto[]; // 👈 nuevo campo para registrar el primer pago
}
