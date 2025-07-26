import { VoucherType } from "@prisma/client";
import { ConditionPayment } from "src/enum";
export declare class PaginationDto {
    conditionPayment: ConditionPayment;
    emissionBranchId: string;
    limit: number;
    offset: number;
    search?: string;
    type?: VoucherType;
    constructor(partial?: Partial<PaginationDto>);
}
