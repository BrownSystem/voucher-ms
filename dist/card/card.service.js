"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let CardService = CardService_1 = class CardService extends client_1.PrismaClient {
    logger = new common_1.Logger(CardService_1.name);
    onModuleInit() {
        void this.$connect();
        this.logger.log("Connected to the database");
    }
    async create(createCardDto) {
        try {
            const card = await this.eCard.create({
                data: {
                    ...createCardDto,
                },
            });
            return card;
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[CREATE_CARD] Error al crear la tarjeta: ${error.message}`,
            };
        }
    }
    async findAll() {
        return this.eCard.findMany({
            where: { available: true },
            orderBy: { name: "asc" },
        });
    }
    async findOne(id) {
        try {
            return this.eCard.findUnique({ where: { id: id, available: true } });
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[GET_CARD] Error al obtener: ${error.message}`,
            };
        }
    }
    async update(id, updateCardDto) {
        try {
            const updated = await this.eCard.update({
                where: { id },
                data: updateCardDto,
            });
            return updated;
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.BAD_REQUEST,
                message: `[UPDATE_CARD] Error al actualizar: ${error.message}`,
            };
        }
    }
};
exports.CardService = CardService;
exports.CardService = CardService = CardService_1 = __decorate([
    (0, common_1.Injectable)()
], CardService);
//# sourceMappingURL=card.service.js.map