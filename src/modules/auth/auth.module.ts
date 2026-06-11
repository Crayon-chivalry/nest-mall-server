import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RbacModule } from '../rbac/rbac.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

type JwtTimeUnit = 'ms' | 's' | 'm' | 'h' | 'd' | 'w' | 'y';
type JwtExpiresIn = number | `${number}${JwtTimeUnit}`;

function getJwtExpiresIn(configService: ConfigService): JwtExpiresIn {
  const expiresIn = configService.get<string>('JWT_EXPIRES_IN') ?? '7d';
  const numericExpiresIn = Number(expiresIn);

  if (!Number.isNaN(numericExpiresIn)) {
    return numericExpiresIn;
  }

  return expiresIn as `${number}${JwtTimeUnit}`;
}

@Module({
  imports: [
    UsersModule,
    RbacModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ?? 'nest_mall_local_secret',
        signOptions: {
          expiresIn: getJwtExpiresIn(configService),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
