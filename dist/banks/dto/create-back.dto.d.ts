import { Currency } from '@prisma/client';
export declare class CreateBankDto {
    name: string;
    branch?: string;
    account?: string;
    cbu?: string;
    alias?: string;
    currency: Currency;
    isActive?: boolean;
    accountType?: string;
    bankCode?: string;
    swiftCode?: string;
    holderName?: string;
    holderDoc?: string;
    available: boolean;
}
