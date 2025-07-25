import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { GenerateNumberVoucherDto } from "./dto/generate-number.dto";
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    generateVoucherPdf(voucherId: string): Promise<string>;
    generateNextNumberForVoucher(generateNumber: GenerateNumberVoucherDto): Promise<{
        number: string;
    }>;
    create(createVoucherDto: CreateVoucherDto): Promise<Promise<void>[] | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
        success?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            number: string;
            id: string;
            letter: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            emissionBranchId: string | null;
            emissionBranchName: string | null;
            destinationBranchId: string | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            financialStatus: string | null;
            logisticStatus: string | null;
            contactId: string | null;
            contactName: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            totalAmount: number | null;
            paidAmount: number;
            remainingAmount: number;
            observation: string | null;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            emittedBy: string | null;
            deliveredBy: string | null;
        };
        message: string;
        status?: undefined;
    }>;
    findAllConditionPayment(pagination: PaginationDto): Promise<{
        data: ({
            products: {
                id: string;
                voucherId: string;
                isReserved: boolean;
                productId: string;
                description: string;
                quantity: number;
                price: number;
                subtotal: number;
                branchId: string | null;
            }[];
            payments: {
                id: string;
                currency: import(".prisma/client").$Enums.Currency;
                exchangeRate: number | null;
                createdAt: Date;
                updatedAt: Date;
                voucherId: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
                originalAmount: number | null;
                receivedAt: Date;
                receivedBy: string | null;
                bankId: string | null;
                chequeNumber: string | null;
                chequeDueDate: Date | null;
                chequeStatus: string | null;
            }[];
        } & {
            number: string;
            id: string;
            letter: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            emissionBranchId: string | null;
            emissionBranchName: string | null;
            destinationBranchId: string | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            financialStatus: string | null;
            logisticStatus: string | null;
            contactId: string | null;
            contactName: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            totalAmount: number | null;
            paidAmount: number;
            remainingAmount: number;
            observation: string | null;
            available: boolean;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            updatedBy: string | null;
            emittedBy: string | null;
            deliveredBy: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
        status?: undefined;
        message?: undefined;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    registerPayment(createPaymentDto: CreatePaymentDto): Promise<{
        status: import("@nestjs/common").HttpStatus;
        message: string;
        success?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            id: string;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            createdAt: Date;
            updatedAt: Date;
            voucherId: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            originalAmount: number | null;
            receivedAt: Date;
            receivedBy: string | null;
            bankId: string | null;
            chequeNumber: string | null;
            chequeDueDate: Date | null;
            chequeStatus: string | null;
        };
        message: string;
        status?: undefined;
    }>;
    findAllReservedProductsByBranchId(pagination: PaginationDto): Promise<{
        data: ({
            voucher: {
                number: string;
                products: {
                    id: string;
                    voucherId: string;
                    isReserved: boolean;
                    productId: string;
                    description: string;
                    quantity: number;
                    price: number;
                    subtotal: number;
                    branchId: string | null;
                }[];
                id: string;
                emissionDate: Date;
                emissionBranchId: string | null;
                status: import(".prisma/client").$Enums.VoucherStatus;
                contactId: string | null;
                contactName: string | null;
                conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
                totalAmount: number | null;
                paidAmount: number;
                remainingAmount: number;
            };
        } & {
            id: string;
            voucherId: string;
            isReserved: boolean;
            productId: string;
            description: string;
            quantity: number;
            price: number;
            subtotal: number;
            branchId: string | null;
        })[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    update({ id, data }: {
        id: string;
        data: UpdateVoucherProductItemDto;
    }): Promise<{
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data: {
            id: string;
            voucherId: string;
            isReserved: boolean;
            productId: string;
            description: string;
            quantity: number;
            price: number;
            subtotal: number;
            branchId: string | null;
        };
    }>;
}
