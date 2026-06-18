import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import {
  FindOperator,
  FindOptionsWhere,
  Like,
  Repository,
} from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserPayPasswordDto } from './dto/update-user-pay-password.dto';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User } from './entities/user.entity';

export type SafeUser = Omit<User, 'password' | 'payPassword'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.ensurePhoneUnique(createUserDto.phone);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashPassword(createUserDto.password),
      userId: await this.generateUserId(),
      status: createUserDto.status ?? UserStatus.NORMAL,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    await this.ensurePhoneUnique(createAdminDto.phone);

    const admin = this.usersRepository.create({
      phone: createAdminDto.phone,
      password: await this.hashPassword(createAdminDto.password),
      nickname: createAdminDto.nickname,
      avatar: createAdminDto.avatar,
      userId: await this.generateUserId(),
      status: UserStatus.NORMAL,
      role: UserRole.ADMIN,
    });

    const savedAdmin = await this.usersRepository.save(admin);
    return this.toSafeUser(savedAdmin);
  }

  async findAll(queryUsersDto: QueryUsersDto) {
    const page = queryUsersDto.page ?? 1;
    const pageSize = queryUsersDto.pageSize ?? 10;

    const where: FindOptionsWhere<User> = {};

    if (queryUsersDto.phone) {
      where.phone = queryUsersDto.phone;
    }

    if (queryUsersDto.nickname) {
      where.nickname = Like(
        `%${queryUsersDto.nickname}%`,
      ) as FindOperator<string>;
    }

    if (queryUsersDto.status) {
      where.status = queryUsersDto.status;
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      order: {
        id: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      list: users.map((user) => this.toSafeUser(user)),
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  }

  findByPhone(phone: string) {
    return this.usersRepository.findOne({ where: { phone } });
  }

  async findProfile(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async findOneByUserId(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async updateProfile(userId: string, updateUserProfileDto: UpdateUserProfileDto) {
    const user = await this.usersRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      updateUserProfileDto.phone &&
      updateUserProfileDto.phone !== user.phone
    ) {
      await this.ensurePhoneUnique(updateUserProfileDto.phone);
    }

    Object.assign(user, updateUserProfileDto);
    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async updatePassword(
    userId: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    const user = await this.usersRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.password = await this.hashPassword(updateUserPasswordDto.password);
    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async updatePayPassword(
    userId: string,
    updateUserPayPasswordDto: UpdateUserPayPasswordDto,
  ) {
    const user = await this.usersRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.payPassword = await this.hashPassword(
      updateUserPayPasswordDto.payPassword,
    );
    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async updateStatus(userId: string, updateUserStatusDto: UpdateUserStatusDto) {
    const user = await this.usersRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.status = updateUserStatusDto.status;
    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  ensureUserEnabled(user: User) {
    if (user.status !== UserStatus.NORMAL) {
      throw new BadRequestException('Current user has been disabled');
    }
  }

  ensureAdmin(user: User) {
    if (user.role !== UserRole.ADMIN) {
      throw new BadRequestException('Current user is not an admin');
    }
  }

  toSafeUser(user: User): SafeUser {
    const {
      password: _password,
      payPassword: _payPassword,
      ...safeUser
    } = user;
    return safeUser;
  }

  private async hashPassword(password: string) {
    return hash(password, 10);
  }

  private async ensurePhoneUnique(phone: string) {
    const existingUser = await this.usersRepository.findOne({
      where: { phone },
    });

    if (existingUser) {
      throw new BadRequestException('Phone already exists');
    }
  }

  private async generateUserId() {
    let userId = '';
    let exists = true;

    while (exists) {
      userId = `U${Date.now()}${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')}`;

      exists = Boolean(
        await this.usersRepository.findOne({
          where: { userId },
          select: ['id'],
        }),
      );
    }

    return userId;
  }
}
