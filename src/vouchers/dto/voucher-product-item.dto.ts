import { IsNumber, IsPositive, IsString } from "class-validator";

export class VoucherProductItemDto {
  @IsString()
  productId: string;

  @IsString()
  description: string;

  @IsString()
  branchId: string;

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;
}
