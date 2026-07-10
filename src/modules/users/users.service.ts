import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import {
  BUILTIN_ADMIN_ACCOUNT,
  BUILTIN_ADMIN_NICKNAME,
} from 'src/common/constants/builtin-admin.constants';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import {
  FindOperator,
  FindOptionsWhere,
  In,
  Like,
  Repository,
} from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { DeleteUsersDto } from './dto/delete-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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
      account: null,
      password: await this.hashPassword(createUserDto.password),
      payPassword: createUserDto.payPassword
        ? await this.hashPassword(createUserDto.payPassword)
        : null,
      userId: await this.generateUserId(),
      status: createUserDto.status ?? UserStatus.NORMAL,
      role: UserRole.CUSTOMER,
    });

    const savedUser = await this.usersRepository.save(user);
    return this.toSafeUser(savedUser);
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    await this.ensureAccountUnique(createAdminDto.account);

    const admin = this.usersRepository.create({
      phone: null,
      account: createAdminDto.account,
      password: await this.hashPassword(createAdminDto.password),
      nickname: createAdminDto.nickname,
      avatar: createAdminDto.avatar,
      userId: await this.generateUserId(),
      status: createAdminDto.status ?? UserStatus.NORMAL,
      role: UserRole.ADMIN,
    });

    const savedAdmin = await this.usersRepository.save(admin);
    return this.toSafeUser(savedAdmin);
  }

  async ensureBuiltinAdmin(options: {
    account: string;
    password: string;
    nickname?: string;
  }) {
    let admin = await this.usersRepository.findOne({
      where: { account: options.account },
      relations: {
        adminRoles: true,
      },
    });

    if (!admin) {
      admin = await this.usersRepository.save(
        this.usersRepository.create({
          phone: null,
          account: options.account,
          password: await this.hashPassword(options.password),
          nickname: options.nickname ?? BUILTIN_ADMIN_NICKNAME,
          userId: await this.generateUserId(),
          status: UserStatus.NORMAL,
          role: UserRole.ADMIN,
        }),
      );
    } else {
      let changed = false;

      if (admin.role !== UserRole.ADMIN) {
        admin.role = UserRole.ADMIN;
        changed = true;
      }

      if (admin.status !== UserStatus.NORMAL) {
        admin.status = UserStatus.NORMAL;
        changed = true;
      }

      if (!admin.nickname && options.nickname) {
        admin.nickname = options.nickname;
        changed = true;
      }

      if (changed) {
        admin = await this.usersRepository.save(admin);
      }
    }

    return this.toSafeUser(admin);
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

    if (queryUsersDto.role) {
      where.role = queryUsersDto.role;
    }

    const [users, total] = await this.usersRepository.findAndCount({
      where,
      relations: {
        adminRoles: true,
      },
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

  findByAccount(account: string) {
    return this.usersRepository.findOne({ where: { account } });
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
      relations: {
        adminRoles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async remove(deleteUsersDto: DeleteUsersDto) {
    const userIds = [...new Set(deleteUsersDto.userIds)];
    const users = await this.usersRepository.find({
      where: {
        userId: In(userIds),
      },
      select: ['id', 'userId', 'account'],
    });

    if (users.some((user) => user.account === BUILTIN_ADMIN_ACCOUNT)) {
      throw new BadRequestException('Builtin admin account cannot be deleted');
    }

    if (users.length !== userIds.length) {
      const foundUserIds = new Set(users.map((user) => user.userId));
      const missingUserIds = userIds.filter((userId) => !foundUserIds.has(userId));
      throw new NotFoundException(
        `Users not found: ${missingUserIds.join(', ')}`,
      );
    }

    await this.usersRepository.remove(users);

    return {
      userIds,
      deletedCount: users.length,
      success: true,
    };
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({
      where: { userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isBuiltinAdmin = user.account === BUILTIN_ADMIN_ACCOUNT;

    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      await this.ensurePhoneUnique(updateUserDto.phone);
    }

    if (updateUserDto.account && updateUserDto.account !== user.account) {
      if (isBuiltinAdmin) {
        throw new BadRequestException('Builtin admin account cannot be renamed');
      }
      await this.ensureAccountUnique(updateUserDto.account);
    }

    if (updateUserDto.phone !== undefined) {
      user.phone = updateUserDto.phone;
    }

    if (updateUserDto.account !== undefined) {
      user.account = updateUserDto.account;
    }

    if (updateUserDto.nickname !== undefined) {
      user.nickname = updateUserDto.nickname;
    }

    if (updateUserDto.avatar !== undefined) {
      user.avatar = updateUserDto.avatar;
    }

    if (updateUserDto.status !== undefined) {
      if (isBuiltinAdmin && updateUserDto.status !== UserStatus.NORMAL) {
        throw new BadRequestException('Builtin admin account cannot be disabled');
      }
      user.status = updateUserDto.status;
    }

    if (updateUserDto.password !== undefined) {
      user.password = await this.hashPassword(updateUserDto.password);
    }

    if (updateUserDto.payPassword !== undefined) {
      user.payPassword = await this.hashPassword(updateUserDto.payPassword);
    }

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

  private async ensureAccountUnique(account: string) {
    const existingUser = await this.usersRepository.findOne({
      where: { account },
    });

    if (existingUser) {
      throw new BadRequestException('Account already exists');
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
