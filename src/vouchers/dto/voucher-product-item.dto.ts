import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class VoucherProductItemDto {
  @IsString()
  productId: string;

  @IsBoolean()
  isReserved: boolean;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  voucherId?: string;

  @IsString()
  branchId?: string; // ID de la sucursal donde se emitió el voucher

  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;
}

export class UpdateVoucherProductItemDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsBoolean()
  @IsOptional()
  isReserved?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  voucherId?: string;

  @IsString()
  @IsOptional()
  branchId?: string; // ID de la sucursal donde se emitió el voucher

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  price?: number;
}
