import { HttpStatus, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { UpdateBankDto } from "./dto/update-bank.dto";
import { CreateBankDto } from "./dto/create-back.dto";
export declare class BanksService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    create(createBankDto: CreateBankDto): Promise<{
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        account: string | null;
        cbu: string | null;
        alias: string | null;
        isActive: boolean;
        accountType: string | null;
        bankCode: string | null;
        swiftCode: string | null;
        holderName: string | null;
        holderDoc: string | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
    findAll(): Promise<{
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        account: string | null;
        cbu: string | null;
        alias: string | null;
        isActive: boolean;
        accountType: string | null;
        bankCode: string | null;
        swiftCode: string | null;
        holderName: string | null;
        holderDoc: string | null;
    }[]>;
    findOne(id: string): Promise<{
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        account: string | null;
        cbu: string | null;
        alias: string | null;
        isActive: boolean;
        accountType: string | null;
        bankCode: string | null;
        swiftCode: string | null;
        holderName: string | null;
        holderDoc: string | null;
    } | {
        status: HttpStatus;
        message: string;
    } | null>;
    update(id: string, updateBankDto: UpdateBankDto): Promise<{
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        branch: string | null;
        account: string | null;
        cbu: string | null;
        alias: string | null;
        isActive: boolean;
        accountType: string | null;
        bankCode: string | null;
        swiftCode: string | null;
        holderName: string | null;
        holderDoc: string | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
}
