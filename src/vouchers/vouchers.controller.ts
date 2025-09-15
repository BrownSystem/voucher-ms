import { Controller } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { VouchersService } from "./vouchers.service";
import { CreateVoucherDto } from "./dto/create-voucher.dto";
import { PaginationDto } from "./dto/pagination.dto";
import { CreatePaymentDto } from "./dto/create-payment.dto";
import { UpdateVoucherProductItemDto } from "./dto/voucher-product-item.dto";
import { GenerateNumberVoucherDto } from "./dto/generate-number.dto";
import { DeleteVoucherDto } from "./dto/delete-voucher.dto";
@Controller()
export class VouchersController {
  constructor(private readonly vouchersService: VouchersService) {}

  @MessagePattern({ cmd: "generate_voucher_html" })
  generateVoucherPdf(@Payload() voucherId: string) {
    return this.vouchersService.generateVoucherHtml(voucherId);
  }

  @MessagePattern({ cmd: "generate_number_voucher" })
  generateNextNumberForVoucher(
    @Payload() generateNumber: GenerateNumberVoucherDto
  ) {
    return this.vouchersService.generateNextNumber(generateNumber);
  }

  @MessagePattern({ cmd: "create_voucher" })
  create(@Payload() createVoucherDto: CreateVoucherDto) {
    return this.vouchersService.create(createVoucherDto);
  }

  @MessagePattern({ cmd: "find_all_vouchers_condition_payment" })
  findAllConditionPayment(@Payload() pagination: PaginationDto) {
    return this.vouchersService.findAllConditionPayment(pagination);
  }

  @MessagePattern({ cmd: "find_one_voucher" })
  findOneVoucher(@Payload() { id }: { id: string }) {
    return this.vouchersService.findOneVoucher(id);
  }

  @MessagePattern({ cmd: "register_payment" })
  registerPayment(@Payload() createPaymentDto: CreatePaymentDto) {
    return this.vouchersService.registerPayment(createPaymentDto);
  }

  @MessagePattern({ cmd: "find_all_reserved_products" })
  findAllReservedProductsByBranchId(@Payload() pagination: PaginationDto) {
    return this.vouchersService.findAllReservedProductsByBranchId(pagination);
  }

  @MessagePattern({ cmd: "update_reserved_product" })
  update(
    @Payload() { id, data }: { id: string; data: UpdateVoucherProductItemDto }
  ) {
    return this.vouchersService.updateReservedProduct(id, data);
  }

  @MessagePattern({ cmd: "type_delete" })
  delete(@Payload() deleteVoucherDto: DeleteVoucherDto) {
    return this.vouchersService.deleteVoucher(deleteVoucherDto);
  }

  @MessagePattern({ cmd: "delete" })
  deleteAll() {
    return this.vouchersService.deleteVoucherAll();
  }
}
