import { HttpStatus, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdatePaymentDto } from "./dto/update-payment.dto";
export declare class PaymentsService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    create(createPaymentDto: CreatePaymentDto): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        voucherId: string;
    } | {
        status: HttpStatus;
        message: string;
    }>;
    findAll(voucherId: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        voucherId: string;
    }[]>;
    findOne(id: string): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        voucherId: string;
    } | {
        status: HttpStatus;
        message: string;
    } | null>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<{
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        voucherId: string;
    } | {
        status: HttpStatus;
        message: string;
    }>;
}
