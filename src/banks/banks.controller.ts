import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { BanksService } from "./banks.service";
import { UpdateBankDto } from "./dto/update-bank.dto";
import { CreateBankDto } from "./dto/create-back.dto";

@Controller()
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @MessagePattern({ cmd: "create_bank" })
  create(@Payload() createBankDto: CreateBankDto) {
    return this.banksService.create(createBankDto);
  }

  @MessagePattern({ cmd: "find_all_banks" })
  findAll() {
    return this.banksService.findAll();
  }

  @MessagePattern({ cmd: "find_one_banks" })
  findOne(@Payload() payload: any) {
    return this.banksService.findOne(payload?.id);
  }

  @MessagePattern({ cmd: "update_bank" })
  update(@Payload() updateBankDto: UpdateBankDto) {
    return this.banksService.update(updateBankDto.id, updateBankDto);
  }
}
