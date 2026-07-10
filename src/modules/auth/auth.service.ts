import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { OperationLogType } from 'src/common/enums/operation-log-type.enum';
import { LogsService } from '../logs/logs.service';
import { RbacService } from '../rbac/rbac.service';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly rbacService: RbacService,
    private readonly jwtService: JwtService,
    private readonly logsService: LogsService,
  ) {}

  async login(loginDto: LoginDto, ip?: string) {
    const user = await this.usersService.findByPhone(loginDto.phone);

    if (!user || !(await compare(loginDto.password, user.password))) {
      await this.logLoginFailure(
        loginDto.phone,
        '/auth/login',
        '用户登录失败',
        '手机号或密码错误',
        ip,
      );
      throw new UnauthorizedException('手机号或密码错误');
    }

    this.usersService.ensureUserEnabled(user);

    return this.buildLoginResult(user);
  }

  async adminLogin(loginDto: AdminLoginDto, ip?: string) {
    const user = await this.usersService.findByAccount(loginDto.account);

    if (!user || !(await compare(loginDto.password, user.password))) {
      await this.logLoginFailure(
        loginDto.account,
        '/auth/admin/login',
        '管理员登录失败',
        '管理员账号或密码错误',
        ip,
      );
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
      phone: user.phone ?? user.account ?? user.userId,
      account: user.account ?? undefined,
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

  private async logLoginFailure(
    identifier: string,
    path: string,
    action: string,
    errorMessage: string,
    ip?: string,
  ) {
    await this.logsService.createOperationLog({
      operatorPhone: identifier,
      module: '认证管理',
      action,
      type: OperationLogType.DANGEROUS,
      method: 'POST',
      path,
      ip,
      requestData: JSON.stringify({
        body: {
          identifier,
        },
      }),
      isSuccess: false,
      errorMessage,
      duration: 0,
    });
  }
}
