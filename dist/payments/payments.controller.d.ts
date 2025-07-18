import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
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
        status: import("@nestjs/common").HttpStatus;
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
    } | null>;
    update(data: {
        id: string;
        updatePaymentDto: UpdatePaymentDto;
    }): Promise<{
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
