import { Module } from "@nestjs/common";
import { CheckBookController } from "./check-book.controller";
import { CheckBookService } from "./check-book.service";

@Module({
  controllers: [CheckBookController],
  providers: [CheckBookService],
})
export class CheckBookModule {}
