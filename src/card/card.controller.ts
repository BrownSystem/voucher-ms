import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateCardDto } from "./dto/create-card.dto";
import { UpdateCardDto } from "./dto/update-card.dto";
import { CardService } from "./card.service";

@Controller()
export class CardController {
  constructor(private readonly cardService: CardService) {}

  @MessagePattern({ cmd: "create_card" })
  create(@Payload() createCardDto: CreateCardDto) {
    return this.cardService.create(createCardDto);
  }

  @MessagePattern({ cmd: "find_all_cards" })
  findAll() {
    return this.cardService.findAll();
  }

  @MessagePattern({ cmd: "find_one_card" })
  findOne(@Payload() payload: any) {
    return this.cardService.findOne(payload?.id);
  }

  @MessagePattern({ cmd: "update_card" })
  update(@Payload() updateCardDto: UpdateCardDto) {
    return this.cardService.update(updateCardDto.id, updateCardDto);
  }
}
