// create-payment.dto.ts
import { Currency } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from "class-validator";
import { PaymentMethod } from "src/enum/payment-method.enum";

export class CreatePaymentDto {
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsPositive()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsEnum(Currency)
  currency: Currency;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  exchangeRate?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  originalAmount?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  receivedAt?: Date;

  @IsOptional()
  @IsString()
  receivedBy?: string;

  @IsOptional()
  @IsString()
  bankId?: string;

  @IsOptional()
  @IsString()
  cardId?: string;

  // 📝 Campos obligatorios solo si es CHEQUE o CHEQUE_TERCERO
  @ValidateIf(
    (o) =>
      o.method === PaymentMethod.CHEQUE_TERCERO ||
      o.method === PaymentMethod.CHEQUE
  )
  @IsString({
    message: "El número de cheque es obligatorio para pagos con cheque",
  })
  chequeNumber: string;

  @ValidateIf(
    (o) =>
      o.method === PaymentMethod.CHEQUE_TERCERO ||
      o.method === PaymentMethod.CHEQUE
  )
  @IsDate({ message: "La fecha de vencimiento del cheque es obligatoria" })
  @Type(() => Date)
  chequeDueDate: Date;

  @ValidateIf(
    (o) =>
      o.method === PaymentMethod.CHEQUE_TERCERO ||
      o.method === PaymentMethod.CHEQUE
  )
  @IsDate({ message: "La fecha de recepción del cheque es obligatoria" })
  @Type(() => Date)
  chequeReceived: Date;

  @ValidateIf(
    (o) =>
      o.method === PaymentMethod.CHEQUE_TERCERO ||
      o.method === PaymentMethod.CHEQUE
  )
  @IsString({ message: "El banco del cheque es obligatorio" })
  chequeBank: string;

  @IsOptional()
  @IsString()
  chequeStatus?: string;

  @IsOptional()
  @IsString()
  observation?: string;

  @IsString()
  voucherId: string;

  @IsString()
  @IsOptional()
  boxId?: string;
}
