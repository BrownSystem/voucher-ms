import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsPositive, IsString } from "class-validator";
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

  @IsOptional()
  @IsString()
  search?: string;

  constructor(partial: Partial<PaginationDto> = {}) {
    Object.assign(this, partial);
    this.limit = partial?.limit || 10;
    this.offset = partial?.offset || 1;
  }
}
