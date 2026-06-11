import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  findAll() {
    return this.ordersRepository.find({
      relations: {
        user: true,
        items: {
          product: true,
        },
      },
      order: {
        id: 'DESC',
      },
    });
  }
}
