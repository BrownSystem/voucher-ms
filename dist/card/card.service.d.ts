import { HttpStatus, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
export declare class CardService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    create(createCardDto: CreateCardDto): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
    findAll(): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    } | {
        status: HttpStatus;
        message: string;
    } | null>;
    update(id: string, updateCardDto: UpdateCardDto): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    } | {
        status: HttpStatus;
        message: string;
    }>;
}
