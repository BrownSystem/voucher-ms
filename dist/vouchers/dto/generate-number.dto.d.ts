import { VoucherType } from "@prisma/client";
export declare class GenerateNumberVoucherDto {
    type: VoucherType;
    emissionBranchId: string;
}
