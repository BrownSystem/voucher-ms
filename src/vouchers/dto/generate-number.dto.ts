import { VoucherType } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";
export class GenerateNumberVoucherDto {
  @IsEnum(VoucherType)
  type: VoucherType;

  @IsString()
  emissionBranchId: string;
}
