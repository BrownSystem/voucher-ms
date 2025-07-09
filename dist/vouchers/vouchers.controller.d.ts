import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
export declare class VouchersController {
    private readonly vouchersService;
    constructor(vouchersService: VouchersService);
    create(createVoucherDto: CreateVoucherDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(updateVoucherDto: UpdateVoucherDto): string;
    remove(id: number): string;
}
