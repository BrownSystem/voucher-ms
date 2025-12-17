import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CheckBookService } from "./check-book.service";

@Controller()
export class CheckBookController {
  constructor(private readonly checkBookService: CheckBookService) {}

  @MessagePattern({ cmd: "find_all_check_books" })
  findAll() {
    return this.checkBookService.findAll();
  }

  @MessagePattern({ cmd: "delete_check_book" })
  deleteCheckBook(@Payload() payload: any) {
    return this.checkBookService.deleteCheckBook(payload?.id);
  }
}
