import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateShippingAddressDto } from './dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from './dto/update-shipping-address.dto';
import { ShippingAddress } from './entities/shipping-address.entity';

@Injectable()
export class ShippingAddressesService {
  constructor(
    @InjectRepository(ShippingAddress)
    private readonly shippingAddressesRepository: Repository<ShippingAddress>,
  ) {}

  async create(userId: number, createShippingAddressDto: CreateShippingAddressDto) {
    const addressCount = await this.shippingAddressesRepository.count({
      where: { user: { id: userId } },
    });
    const shouldBeDefault =
      createShippingAddressDto.isDefault === true || addressCount === 0;

    if (shouldBeDefault) {
      await this.clearDefaultAddress(userId);
    }

    const shippingAddress = this.shippingAddressesRepository.create({
      ...createShippingAddressDto,
      postalCode: createShippingAddressDto.postalCode ?? null,
      addressTag: createShippingAddressDto.addressTag ?? null,
      isDefault: shouldBeDefault,
      user: { id: userId },
    });

    return this.shippingAddressesRepository.save(shippingAddress);
  }

  findAll(userId: number) {
    return this.shippingAddressesRepository.find({
      where: { user: { id: userId } },
      order: {
        isDefault: 'DESC',
        id: 'DESC',
      },
    });
  }

  async findDefault(userId: number) {
    const address = await this.shippingAddressesRepository.findOne({
      where: { user: { id: userId }, isDefault: true },
    });

    if (!address) {
      throw new NotFoundException('Default shipping address not found');
    }

    return address;
  }

  async findOne(userId: number, id: number) {
    const address = await this.shippingAddressesRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    return address;
  }

  async update(
    userId: number,
    id: number,
    updateShippingAddressDto: UpdateShippingAddressDto,
  ) {
    const address = await this.findOne(userId, id);

    if (updateShippingAddressDto.isDefault === true) {
      await this.clearDefaultAddress(userId);
    }

    Object.assign(address, {
      ...updateShippingAddressDto,
      postalCode:
        updateShippingAddressDto.postalCode ?? address.postalCode ?? null,
      addressTag: updateShippingAddressDto.addressTag ?? address.addressTag ?? null,
      isDefault: updateShippingAddressDto.isDefault ?? address.isDefault,
    });

    const savedAddress = await this.shippingAddressesRepository.save(address);

    if (!savedAddress.isDefault) {
      await this.ensureHasDefaultAddress(userId);
    }

    return this.findOne(userId, savedAddress.id);
  }

  async remove(userId: number, id: number) {
    const address = await this.findOne(userId, id);
    await this.shippingAddressesRepository.remove(address);
    await this.ensureHasDefaultAddress(userId);

    return {
      id,
      success: true,
    };
  }

  async setDefault(userId: number, id: number) {
    const address = await this.findOne(userId, id);
    await this.clearDefaultAddress(userId);
    address.isDefault = true;
    await this.shippingAddressesRepository.save(address);
    return this.findOne(userId, id);
  }

  private async clearDefaultAddress(userId: number) {
    await this.shippingAddressesRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false },
    );
  }

  private async ensureHasDefaultAddress(userId: number) {
    const defaultAddress = await this.shippingAddressesRepository.findOne({
      where: { user: { id: userId }, isDefault: true },
      select: ['id'],
    });

    if (defaultAddress) {
      return;
    }

    const latestAddress = await this.shippingAddressesRepository.findOne({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });

    if (!latestAddress) {
      return;
    }

    latestAddress.isDefault = true;
    await this.shippingAddressesRepository.save(latestAddress);
  }
}
