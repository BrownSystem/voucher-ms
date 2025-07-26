import { IsEnum, IsString } from "class-validator";

enum TypeOfDelete {
  SOFT = "SOFT",
  REPLENISH = "REPLENISH",
}

export class DeleteVoucherDto {
  @IsString()
  id: string;

  @IsEnum(TypeOfDelete)
  typeOfDelete: TypeOfDelete;
}
