import { Currency, PaymentMethod } from '@prisma/client';
export declare class CreatePaymentDto {
    voucherId: string;
    method: PaymentMethod;
    amount: number;
    currency: Currency;
    exchangeRate?: number;
    originalAmount?: number;
    receivedAt?: Date;
    receivedBy?: string;
    bankId?: string;
    chequeNumber?: string;
    chequeDueDate?: Date;
    chequeStatus?: string;
}
