import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @MessagePattern({ cmd: "create_voucher" })
  create(@Payload() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @MessagePattern({ cmd: "find_all_vouchers_condition_payment" })
  findAllConditionPayment(@Payload() pagination: PaginationDto) {
    return this.vouchersService.findAllConditionPayment(pagination);
  }

  @MessagePattern({ cmd: "register_payment" })
  registerPayment(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.vouchersService.registerPayment(createPaymentDto);
  }
}
