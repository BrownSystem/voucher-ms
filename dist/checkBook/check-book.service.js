"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CheckBookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckBookService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
let CheckBookService = CheckBookService_1 = class CheckBookService extends client_1.PrismaClient {
    logger = new common_1.Logger(CheckBookService_1.name);
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
    async deleteCheckBook(id) {
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
        }
        catch (error) {
            return {
                message: "[CHECK_BOOK] No se pudo eliminar el cheque de tercero",
            };
        }
    }
};
exports.CheckBookService = CheckBookService;
exports.CheckBookService = CheckBookService = CheckBookService_1 = __decorate([
    (0, common_1.Injectable)()
], CheckBookService);
//# sourceMappingURL=check-book.service.js.map