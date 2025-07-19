export declare class VoucherProductItemDto {
    productId: string;
    isReserved: boolean;
    description: string;
    voucherId?: string;
    branchId?: string;
    quantity: number;
    price: number;
}
export declare class UpdateVoucherProductItemDto {
    id?: string;
    productId?: string;
    isReserved?: boolean;
    description?: string;
    voucherId?: string;
    branchId?: string;
    price?: number;
}
