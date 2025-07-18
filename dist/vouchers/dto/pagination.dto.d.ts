import { ConditionPayment } from "src/enum";
export declare class PaginationDto {
    conditionPayment: ConditionPayment;
    emissionBranchId: string;
    limit: number;
    offset: number;
    search?: string;
    constructor(partial?: Partial<PaginationDto>);
}
