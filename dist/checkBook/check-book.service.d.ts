import { OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
export declare class CheckBookService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    findAll(): Promise<{
        branchId: string | null;
        id: string;
        amount: number;
        chequeNumber: string | null;
        chequeBank: string | null;
        chequeDueDate: Date | null;
        available: boolean | null;
        chequeReceived: Date | null;
    }[]>;
    deleteCheckBook(id: string): Promise<{
        branchId: string | null;
        id: string;
        amount: number;
        chequeNumber: string | null;
        chequeBank: string | null;
        chequeDueDate: Date | null;
        available: boolean | null;
        chequeReceived: Date | null;
    } | {
        message: string;
    }>;
}
