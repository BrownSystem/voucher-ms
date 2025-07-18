import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateBankDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  branch?: string;

  @IsString()
  @IsOptional()
  account?: string;

  @IsString()
  @IsOptional()
  cbu?: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsEnum(Currency)
  currency: Currency;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  accountType?: string; // ej: CAJA_AHORRO, CUENTA_CORRIENTE

  @IsString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  swiftCode?: string;

  @IsString()
  @IsOptional()
  holderName?: string;

  @IsString()
  @IsOptional()
  holderDoc?: string;

  @IsBoolean()
  @IsOptional()
  available: boolean;
}
