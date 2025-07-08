import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @MessagePattern('createVoucher')
  create(@Payload() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @MessagePattern('findAllVouchers')
  findAll() {
    return this.vouchersService.findAll();
  }

  @MessagePattern('findOneVoucher')
  findOne(@Payload() id: number) {
    return this.vouchersService.findOne(id);
  }

  @MessagePattern('updateVoucher')
  update(@Payload() updateVoucherDto: UpdateVoucherDto) {
    return this.vouchersService.update(updateVoucherDto.id, updateVoucherDto);
  }

  @MessagePattern('removeVoucher')
  remove(@Payload() id: number) {
    return this.vouchersService.remove(id);
  }
}
