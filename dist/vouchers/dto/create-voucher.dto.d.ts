import { ConditionPayment, Currency, VoucherType } from "@prisma/client";
import { VoucherProductItemDto } from "./voucher-product-item.dto";
import { CreateInitialPaymentDto } from "./initial-payment.dto";
export declare class CreateVoucherDto {
    number: string;
    letter?: string;
    type: VoucherType;
    emissionDate: Date;
    dueDate?: Date;
    emissionBranchId: string;
    emissionBranchName: string;
    destinationBranchId: string;
    contactId?: string;
    contactName?: string;
    conditionPayment?: ConditionPayment;
    currency: Currency;
    exchangeRate?: number;
    products: VoucherProductItemDto[];
    totalAmount?: number;
    paidAmount?: number;
    observation?: string;
    available?: boolean;
    createdBy?: string;
    emittedBy?: string;
    deliveredBy?: string;
    initialPayment?: CreateInitialPaymentDto[];
}
