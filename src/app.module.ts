import { Module } from "@nestjs/common";
import { VouchersModule } from "./vouchers/vouchers.module";
import { BanksModule } from "./banks/banks.module";
import { CardModule } from "./card/card.module";
import { CheckBookModule } from "./checkBook/check-book.module";

@Module({
  imports: [VouchersModule, BanksModule, CardModule, CheckBookModule],
})
export class AppModule {}
