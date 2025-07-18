import { PartialType } from "@nestjs/mapped-types";
import { CreateBankDto } from "./create-back.dto";
import { IsOptional, IsString } from "class-validator";

export class UpdateBankDto extends PartialType(CreateBankDto) {
  @IsString()
  @IsOptional()
  id: string;
}
