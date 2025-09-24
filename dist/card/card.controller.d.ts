import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { CardService } from "./card.service";
export declare class CardController {
    private readonly cardService;
    constructor(cardService: CardService);
    create(createCardDto: CreateCardDto): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
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
    findOne(payload: any): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    } | null>;
    update(updateCardDto: UpdateCardDto): Promise<{
        id: string;
        available: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        cardType: import(".prisma/client").$Enums.CardType;
        quotas: number | null;
    } | {
        status: import("@nestjs/common").HttpStatus;
        message: string;
    }>;
}
