import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppShippingAddressesController } from './app-shipping-addresses.controller';
import { ShippingAddress } from './entities/shipping-address.entity';
import { ShippingAddressesService } from './shipping-addresses.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingAddress])],
  controllers: [AppShippingAddressesController],
  providers: [ShippingAddressesService],
  exports: [TypeOrmModule],
})
export class ShippingAddressesModule {}
