import { OnModuleInit } from '@nestjs/common';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { PrismaClient } from '@prisma/client';
export declare class VouchersService extends PrismaClient implements OnModuleInit {
    private readonly logger;
    onModuleInit(): void;
    create(createVoucherDto: CreateVoucherDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateVoucherDto: UpdateVoucherDto): string;
    remove(id: number): string;
}
