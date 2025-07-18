import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
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
            products: {
                id: string;
                productId: string;
                description: string;
                quantity: number;
                price: number;
                subtotal: number;
                voucherId: string;
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
        };
        message: string;
        status?: undefined;
    }>;
    findAllConditionPayment(pagination: PaginationDto): Promise<{
        data: ({
            products: {
                id: string;
                productId: string;
                description: string;
                quantity: number;
                price: number;
                subtotal: number;
                voucherId: string;
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
}
