import { IsNumber, IsPositive, IsString } from "class-validator";

export class VoucherProductItemDto {
    @IsString()
    voucherId: string;

    @IsString()
    productId: string;

    @IsNumber()
    @IsPositive()
    quantity: number;
}