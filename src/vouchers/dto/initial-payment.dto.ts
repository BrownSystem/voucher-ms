import { Currency } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { PaymentMethod } from "src/enum/payment-method.enum";

export class CreateInitialPaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsNumber({ maxDecimalPlaces: 4 })
  @IsOptional()
  exchangeRate?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  originalAmount?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  receivedAt?: Date;

  @IsString()
  @IsOptional()
  receivedBy?: string;

  @IsString()
  @IsOptional()
  bankId?: string;

  @IsString()
  @IsOptional()
  chequeNumber?: string;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  chequeDueDate?: Date;

  @IsString()
  @IsOptional()
  chequeStatus?: string;
}
