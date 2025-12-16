import { VoucherType } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { ConditionPayment } from "src/enum";

export class PaginationDto {
  @IsEnum(ConditionPayment)
  @IsOptional()
  conditionPayment: ConditionPayment;

  @IsString()
  @IsOptional()
  emissionBranchId: string;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit: number;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  offset: number;

  @IsEnum(VoucherType)
  @IsOptional()
  type?: VoucherType;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  contactId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateFrom?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  dateUntil?: Date;

  @IsString()
  @IsOptional()
  branch: string;

  @IsString()
  @IsOptional()
  productId: string;

  constructor(partial: Partial<PaginationDto> = {}) {
    Object.assign(this, partial);
    this.limit = partial?.limit || 10;
    this.offset = partial?.offset || 1;
  }
}
