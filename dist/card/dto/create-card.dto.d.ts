import { CardType } from "@prisma/client";
export declare class CreateCardDto {
    name: string;
    quotas?: number;
    cardType: CardType;
    available: boolean;
}
