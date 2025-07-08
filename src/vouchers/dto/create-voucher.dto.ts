import { ConditionPayment, VoucherStatus, VoucherType } from "@prisma/client";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";
import { VoucherProductItemDto } from "./voucher-product-item.dto";

export class CreateVoucherDto {
    @IsNumber()
    @IsPositive()
    number: number;

    @IsString()
    @IsOptional()
    letter?: string;

    @IsEnum(VoucherType)
    type: VoucherType

    @IsDate()
    @Type(() => Date)
    emissionDate: Date;

    @IsDate()
    @Type(() => Date )
    @IsOptional()
    dueTime?: Date;

    @IsString()
    @IsOptional()
    emissionBranchId?: string;

    @IsString()
    @IsOptional()
    emissionBranchName?: string;
    
    @IsString()
    @IsOptional()
    destinationBranchId?: string;

    @IsEnum(VoucherStatus)
    status: VoucherStatus;

    @IsString()
    contactId: string;

    @IsString()
    contactName: string;

    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => VoucherProductItemDto)
    products: VoucherProductItemDto[]

    @IsEnum(ConditionPayment)
    @IsOptional()
    conditionPayment?: ConditionPayment;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    totalAmount?: number;

    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @IsOptional()
    paidAmount?: number;

    @IsString()
    @IsOptional()
    observation?: string;

    @IsBoolean()
    @IsOptional()
    available?: boolean;

    
}
