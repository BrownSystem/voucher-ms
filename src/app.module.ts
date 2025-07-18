import { Module } from "@nestjs/common";
import { VouchersModule } from "./vouchers/vouchers.module";
import { BanksModule } from "./banks/banks.module";

@Module({
  imports: [VouchersModule, BanksModule],
})
export class AppModule {}
