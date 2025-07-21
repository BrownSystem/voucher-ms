import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { HttpStatus, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { ClientProxy } from "@nestjs/microservices";
export declare class VouchersService extends PrismaClient implements OnModuleInit {
    private readonly client;
    private readonly logger;
    private _normalizeText;
    onModuleInit(): void;
    constructor(client: ClientProxy);
    create(createVoucherDto: CreateVoucherDto): Promise<{
        status: HttpStatus;
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
        status: HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    registerPayment(dto: CreatePaymentDto): Promise<{
        status: HttpStatus;
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
    updateReservedProduct(id: string, data: UpdateVoucherProductItemDto): Promise<{
        status: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        status: HttpStatus;
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
    buildHtml(voucher: any): Promise<string>;
    generateVoucherPdf(voucherId: string): Promise<Buffer>;
}
