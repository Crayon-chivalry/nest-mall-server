import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { RequestUser } from '../interfaces/request-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'nest_mall_local_secret',
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      userId: payload.userId,
      nickname: payload.nickname,
      phone: payload.phone,
      account: payload.account,
      role: payload.role,
      permissions: payload.permissions ?? [],
    };
  }
}
