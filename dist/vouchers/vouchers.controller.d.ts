import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    create(createVoucherDto: CreateVoucherDto): Promise<{
        status: import("@nestjs/common").HttpStatus;
        message: string;
        success?: undefined;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            number: string;
            id: string;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            letter: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            emissionBranchId: string | null;
            emissionBranchName: string | null;
            destinationBranchId: string | null;
            contactId: string | null;
            contactName: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            totalAmount: number | null;
            paidAmount: number;
            observation: string | null;
            available: boolean;
            createdBy: string | null;
            emittedBy: string | null;
            deliveredBy: string | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            financialStatus: string | null;
            logisticStatus: string | null;
            remainingAmount: number;
            createdAt: Date;
            updatedAt: Date;
            updatedBy: string | null;
        };
        message: string;
        status?: undefined;
    }>;
    findAllConditionPayment(pagination: PaginationDto): Promise<{
        data: ({
            products: {
                productId: string;
                isReserved: boolean;
                description: string;
                voucherId: string;
                branchId: string | null;
                quantity: number;
                price: number;
                id: string;
                subtotal: number;
            }[];
            payments: {
                voucherId: string;
                id: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
                currency: import(".prisma/client").$Enums.Currency;
                exchangeRate: number | null;
                originalAmount: number | null;
                receivedAt: Date;
                receivedBy: string | null;
                bankId: string | null;
                chequeNumber: string | null;
                chequeDueDate: Date | null;
                chequeStatus: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            number: string;
            id: string;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            letter: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            emissionBranchId: string | null;
            emissionBranchName: string | null;
            destinationBranchId: string | null;
            contactId: string | null;
            contactName: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            totalAmount: number | null;
            paidAmount: number;
            observation: string | null;
            available: boolean;
            createdBy: string | null;
            emittedBy: string | null;
            deliveredBy: string | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            financialStatus: string | null;
            logisticStatus: string | null;
            remainingAmount: number;
            createdAt: Date;
            updatedAt: Date;
            updatedBy: string | null;
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
            voucherId: string;
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            originalAmount: number | null;
            receivedAt: Date;
            receivedBy: string | null;
            bankId: string | null;
            chequeNumber: string | null;
            chequeDueDate: Date | null;
            chequeStatus: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        message: string;
        status?: undefined;
    }>;
    findAllReservedProductsByBranchId(pagination: PaginationDto): Promise<{
        data: ({
            voucher: {
                number: string;
                id: string;
                emissionDate: Date;
                emissionBranchId: string | null;
                contactId: string | null;
                contactName: string | null;
                conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
                products: {
                    productId: string;
                    isReserved: boolean;
                    description: string;
                    voucherId: string;
                    branchId: string | null;
                    quantity: number;
                    price: number;
                    id: string;
                    subtotal: number;
                }[];
                totalAmount: number | null;
                paidAmount: number;
                status: import(".prisma/client").$Enums.VoucherStatus;
                remainingAmount: number;
            };
        } & {
            productId: string;
            isReserved: boolean;
            description: string;
            voucherId: string;
            branchId: string | null;
            quantity: number;
            price: number;
            id: string;
            subtotal: number;
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
            productId: string;
            isReserved: boolean;
            description: string;
            voucherId: string;
            branchId: string | null;
            quantity: number;
            price: number;
            id: string;
            subtotal: number;
        };
    }>;
}
