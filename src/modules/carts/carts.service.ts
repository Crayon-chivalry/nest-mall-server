import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartsRepository: Repository<Cart>,
  ) {}

  findAll() {
    return this.cartsRepository.find({
      relations: {
        user: true,
        items: {
          product: true,
        },
      },
    });
  }
}
