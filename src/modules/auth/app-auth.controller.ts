import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Request } from 'express';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { getRequestIp } from 'src/common/utils/request-ip.util';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestUser } from './interfaces/request-user.interface';

@ApiTags('AppAuth')
@Controller('app/auth')
export class AppAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: '用户登录并获取 JWT' })
  @ApiBody({ type: LoginDto })
  @ApiUnauthorizedResponse({ description: '手机号或密码错误' })
  @SuccessMessage('登录成功')
  @Post('login')
  login(@Body() loginDto: LoginDto, @Req() request: Request) {
    return this.authService.login(loginDto, getRequestIp(request));
  }

  @ApiOperation({ summary: '获取当前前台登录用户信息' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@CurrentUser() user: RequestUser) {
    return this.usersService.findProfile(user.id);
  }
}
