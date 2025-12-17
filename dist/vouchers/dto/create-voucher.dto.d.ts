import { ConditionPayment, Currency, VoucherType } from "@prisma/client";
import { VoucherProductItemDto } from "./voucher-product-item.dto";
import { CreateInitialPaymentDto } from "./initial-payment.dto";
export declare class CreateVoucherDto {
    boxId: string;
    letter?: string;
    type: VoucherType;
    emissionDate: Date;
    dueDate?: Date;
    emissionBranchId: string;
    emissionBranchName: string;
    destinationBranchId: string;
    destinationBranchName: string;
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
    cancelledInvoiceNumber: string;
    initialPayment?: CreateInitialPaymentDto[];
}
