import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { GenerateNumberVoucherDto } from "./dto/generate-number.dto";
import { DeleteVoucherDto } from "./dto/delete-voucher.dto";
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    generateVoucherPdf(voucherId: string): Promise<string>;
    generateNextNumberForVoucher(generateNumber: GenerateNumberVoucherDto): Promise<{
        number: string;
    }>;
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
            status: import("@nestjs/common").HttpStatus;
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findAllVoucher(pagination: PaginationDto): Promise<{
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findOneVoucher({ id }: {
        id: string;
    }): Promise<({
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
    findMonthlySalesByBranch(payload: {
        month: number;
        year: number;
    }): Promise<{
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
    }>;
    findSalesByBranch(payload: {
        branchId: string;
    }): Promise<{
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
        data?: undefined;
        meta?: undefined;
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
    registerPayment(createPaymentDto: CreatePaymentDto): Promise<{
        status: import("@nestjs/common").HttpStatus;
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
            voucherId: string | null;
            branchId: string | null;
            quantity: number;
            price: number;
            id: string;
            observation: string | null;
            subtotal: number;
        };
    }>;
    delete(deleteVoucherDto: DeleteVoucherDto): Promise<{
        message: string;
    }>;
    deletePayment(payload: any): Promise<{
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
        status: import("@nestjs/common").HttpStatus;
    }>;
    deleteAll(): Promise<string>;
}
