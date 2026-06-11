import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { RbacService } from '../rbac/rbac.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByPhone(loginDto.phone);

    if (!user || !(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('手机号或密码错误');
    }

    this.usersService.ensureUserEnabled(user);

    return this.buildLoginResult(user);
  }

  async adminLogin(loginDto: LoginDto) {
    const user = await this.usersService.findByPhone(loginDto.phone);

    if (!user || !(await compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('管理员账号或密码错误');
    }

    this.usersService.ensureUserEnabled(user);
    this.usersService.ensureAdmin(user);

    return this.buildLoginResult(user);
  }

  private async buildLoginResult(user: User) {
    const permissions = await this.rbacService.getUserPermissionCodes(user.id);

    const payload: JwtPayload = {
      sub: user.id,
      userId: user.userId,
      nickname: user.nickname,
      phone: user.phone,
      role: user.role,
      permissions,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      user: this.usersService.toSafeUser(user),
      permissions,
    };
  }
}
