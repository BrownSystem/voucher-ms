import { HttpStatus, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";

@Injectable()
export class CardService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CardService.name);

  onModuleInit() {
    void this.$connect();
    this.logger.log("Connected to the database");
  }

  async create(createCardDto: CreateCardDto) {
    try {
      const card = await this.eCard.create({
        data: {
          ...createCardDto,
        },
      });
      return card;
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
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

  async findOne(id: string) {
    try {
      return this.eCard.findUnique({ where: { id: id, available: true } });
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[GET_CARD] Error al obtener: ${error.message}`,
      };
    }
  }

  async update(id: string, updateCardDto: UpdateCardDto) {
    try {
      const updated = await this.eCard.update({
        where: { id },
        data: updateCardDto,
      });
      return updated;
    } catch (error) {
      return {
        status: HttpStatus.BAD_REQUEST,
        message: `[UPDATE_CARD] Error al actualizar: ${error.message}`,
      };
    }
  }
}
