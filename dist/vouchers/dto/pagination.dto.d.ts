import { VoucherType } from "@prisma/client";
import { ConditionPayment } from "src/enum";
export declare class PaginationDto {
    conditionPayment: ConditionPayment;
    emissionBranchId: string;
    limit: number;
    offset: number;
    type?: VoucherType;
    search?: string;
    contactId?: string;
    dateFrom?: Date;
    dateUntil?: Date;
    branch: string;
    constructor(partial?: Partial<PaginationDto>);
}
