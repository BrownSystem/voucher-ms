import { IsEnum, IsOptional, IsString } from "class-validator";

enum TypeOfDelete {
  SOFT = "SOFT",
  REPLENISH = "REPLENISH",
}

export class DeleteVoucherDto {
  @IsString()
  id: string;

  @IsEnum(TypeOfDelete)
  @IsOptional()
  typeOfDelete?: TypeOfDelete;
}
