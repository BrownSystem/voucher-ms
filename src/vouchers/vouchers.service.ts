import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class VouchersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(VouchersService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected successfully');
  }

  create(createVoucherDto: CreateVoucherDto) {
    return 'This action adds a new voucher';
  }

  findAll() {
    return `This action returns all vouchers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} voucher`;
  }

  update(id: number, updateVoucherDto: UpdateVoucherDto) {
    return `This action updates a #${id} voucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} voucher`;
  }
}
