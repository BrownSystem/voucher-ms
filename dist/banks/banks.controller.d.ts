import { BanksService } from "./banks.service";
import { UpdateBankDto } from "./dto/update-bank.dto";
import { CreateBankDto } from "./dto/create-back.dto";
export declare class BanksController {
    private readonly banksService;
    constructor(banksService: BanksService);
    create(createBankDto: CreateBankDto): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
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
    findOne(payload: any): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
    } | null>;
    update(updateBankDto: UpdateBankDto): Promise<{
        id: string;
        currency: import(".prisma/client").$Enums.Currency;
        available: boolean;
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
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
