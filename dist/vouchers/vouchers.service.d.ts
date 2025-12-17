import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { HttpStatus, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { ClientProxy } from "@nestjs/microservices";
import { GenerateNumberVoucherDto } from "./dto/generate-number.dto";
import { DeleteVoucherDto } from "./dto/delete-voucher.dto";
export declare class VouchersService extends PrismaClient implements OnModuleInit {
    private readonly client;
    private readonly logger;
    private _normalizeText;
    private updateProductsStock;
    private _loadTransaction;
    onModuleInit(): void;
    constructor(client: ClientProxy);
    private handleStockChanges;
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
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            observation: string | null;
            letter: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            emissionBranchId: string | null;
            emissionBranchName: string | null;
            destinationBranchId: string | null;
            destinationBranchName: string | null;
            contactId: string | null;
            contactName: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            totalAmount: number | null;
            paidAmount: number;
            available: boolean;
            createdBy: string | null;
            emittedBy: string | null;
            deliveredBy: string | null;
            cancelledInvoiceNumber: string | null;
            status: import(".prisma/client").$Enums.VoucherStatus;
            financialStatus: string | null;
            logisticStatus: string | null;
            remainingAmount: number;
            createdAt: Date;
            updatedAt: Date;
            updatedBy: string | null;
        } | {
            message: string;
            status: HttpStatus;
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
                voucherId: string | null;
                branchId: string | null;
                quantity: number;
                price: number;
                id: string;
                observation: string | null;
                subtotal: number;
            }[];
            payments: {
                voucherId: string;
                branchId: string | null;
                id: string;
                method: import(".prisma/client").$Enums.PaymentMethod;
                amount: number;
                currency: import(".prisma/client").$Enums.Currency;
                exchangeRate: number | null;
                originalAmount: number | null;
                receivedAt: Date;
                receivedBy: string | null;
                bankId: string | null;
                cardId: string | null;
                chequeNumber: string | null;
                chequeBank: string | null;
                chequeDueDate: Date | null;
                chequeStatus: string | null;
                observation: string | null;
                branchName: string | null;
                chequeReceived: Date | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
        } & {
            number: string;
            id: string;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            observation: string | null;
            letter: string | null;
            type: import(".prisma/client").$Enums.VoucherType;
            emissionDate: Date;
            dueDate: Date | null;
            emissionBranchId: string | null;
            emissionBranchName: string | null;
            destinationBranchId: string | null;
            destinationBranchName: string | null;
            contactId: string | null;
            contactName: string | null;
            conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
            totalAmount: number | null;
            paidAmount: number;
            available: boolean;
            createdBy: string | null;
            emittedBy: string | null;
            deliveredBy: string | null;
            cancelledInvoiceNumber: string | null;
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
        status: HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findAllByContact(pagination: PaginationDto): Promise<{
        data: {
            contactId: string | null;
            contactName: string | null;
            voucherType: import(".prisma/client").$Enums.VoucherType;
            voucherCount: number;
            totalDeuda: number;
            vouchers: any[];
        }[];
        meta: {
            totalContactos: number;
            totalDeudaGeneral: number;
        };
        status?: undefined;
        message?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findMonthlySalesByBranch(month: number, year: number): Promise<{
        data: {
            branchName: string;
            ventas: number;
            cobranzas: number;
            cantidadComprobantes: number;
        }[];
        meta: {
            totalSucursales: number;
            totalGeneral: number;
        };
        status?: undefined;
        message?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findSalesByBranch(branchId?: string): Promise<{
        data: never[];
        meta: {
            totalSucursales: number;
            totalGeneral: number;
            salesEvolution: never[];
        };
        status?: undefined;
        message?: undefined;
    } | {
        data: {
            mes: string;
            saldoPendiente: number;
            ingresos: number;
        }[];
        meta: {
            totalSucursales: number;
            totalGeneral: number;
            salesEvolution?: undefined;
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
            voucherId: string;
            branchId: string | null;
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            originalAmount: number | null;
            receivedAt: Date;
            receivedBy: string | null;
            bankId: string | null;
            cardId: string | null;
            chequeNumber: string | null;
            chequeBank: string | null;
            chequeDueDate: Date | null;
            chequeStatus: string | null;
            observation: string | null;
            branchName: string | null;
            chequeReceived: Date | null;
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
                    voucherId: string | null;
                    branchId: string | null;
                    quantity: number;
                    price: number;
                    id: string;
                    observation: string | null;
                    subtotal: number;
                }[];
                totalAmount: number | null;
                paidAmount: number;
                status: import(".prisma/client").$Enums.VoucherStatus;
                remainingAmount: number;
            } | null;
        } & {
            productId: string;
            isReserved: boolean;
            description: string;
            voucherId: string | null;
            branchId: string | null;
            quantity: number;
            price: number;
            id: string;
            observation: string | null;
            subtotal: number;
        })[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    findOneVoucher(id: string): Promise<({
        products: {
            productId: string;
            isReserved: boolean;
            description: string;
            voucherId: string | null;
            branchId: string | null;
            quantity: number;
            price: number;
            id: string;
            observation: string | null;
            subtotal: number;
        }[];
        payments: {
            voucherId: string;
            branchId: string | null;
            id: string;
            method: import(".prisma/client").$Enums.PaymentMethod;
            amount: number;
            currency: import(".prisma/client").$Enums.Currency;
            exchangeRate: number | null;
            originalAmount: number | null;
            receivedAt: Date;
            receivedBy: string | null;
            bankId: string | null;
            cardId: string | null;
            chequeNumber: string | null;
            chequeBank: string | null;
            chequeDueDate: Date | null;
            chequeStatus: string | null;
            observation: string | null;
            branchName: string | null;
            chequeReceived: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        number: string;
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        exchangeRate: number | null;
        observation: string | null;
        letter: string | null;
        type: import(".prisma/client").$Enums.VoucherType;
        emissionDate: Date;
        dueDate: Date | null;
        emissionBranchId: string | null;
        emissionBranchName: string | null;
        destinationBranchId: string | null;
        destinationBranchName: string | null;
        contactId: string | null;
        contactName: string | null;
        conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
        totalAmount: number | null;
        paidAmount: number;
        available: boolean;
        createdBy: string | null;
        emittedBy: string | null;
        deliveredBy: string | null;
        cancelledInvoiceNumber: string | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
        financialStatus: string | null;
        logisticStatus: string | null;
        remainingAmount: number;
        createdAt: Date;
        updatedAt: Date;
        updatedBy: string | null;
    }) | null>;
    updateReservedProduct(id: string, data: UpdateVoucherProductItemDto): Promise<{
        status: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data: {
            productId: string;
            isReserved: boolean;
            description: string;
            voucherId: string | null;
            branchId: string | null;
            quantity: number;
            price: number;
            id: string;
            observation: string | null;
            subtotal: number;
        };
    }>;
    buildHtml(voucher: any): Promise<string>;
    generateVoucherHtml(voucherId: string): Promise<string>;
    generateNextNumber(dto: GenerateNumberVoucherDto): Promise<{
        number: string;
    }>;
    deleteVoucher(deleteVoucherDto: DeleteVoucherDto): Promise<{
        message: string;
    }>;
    deletePaymentById(id: string): Promise<{
        number: string;
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        exchangeRate: number | null;
        observation: string | null;
        letter: string | null;
        type: import(".prisma/client").$Enums.VoucherType;
        emissionDate: Date;
        dueDate: Date | null;
        emissionBranchId: string | null;
        emissionBranchName: string | null;
        destinationBranchId: string | null;
        destinationBranchName: string | null;
        contactId: string | null;
        contactName: string | null;
        conditionPayment: import(".prisma/client").$Enums.ConditionPayment | null;
        totalAmount: number | null;
        paidAmount: number;
        available: boolean;
        createdBy: string | null;
        emittedBy: string | null;
        deliveredBy: string | null;
        cancelledInvoiceNumber: string | null;
        status: import(".prisma/client").$Enums.VoucherStatus;
        financialStatus: string | null;
        logisticStatus: string | null;
        remainingAmount: number;
        createdAt: Date;
        updatedAt: Date;
        updatedBy: string | null;
    } | {
        message: string;
        status: HttpStatus;
    }>;
    deleteVoucherAll(): Promise<string>;
}
