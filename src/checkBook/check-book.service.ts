import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
@Injectable()
export class CheckBookService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(CheckBookService.name);

  onModuleInit() {
    void this.$connect();
    this.logger.log("Connected to the database");
  }

  async findAll() {
    return this.eCheckBook.findMany({
      where: {
        available: true,
      },
    });
  }

  async deleteCheckBook(id: string) {
    try {
      const chequeDelete = await this.eCheckBook.update({
        where: {
          id,
        },
        data: {
          available: false,
        },
      });

      return chequeDelete;
    } catch (error) {
      return {
        message: "[CHECK_BOOK] No se pudo eliminar el cheque de tercero",
      };
    }
  }
}
