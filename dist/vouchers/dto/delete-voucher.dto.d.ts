declare enum TypeOfDelete {
    SOFT = "SOFT",
    REPLENISH = "REPLENISH"
}
export declare class DeleteVoucherDto {
    id: string;
    typeOfDelete: TypeOfDelete;
}
export {};
