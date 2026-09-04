import {
  Body,
  Controller,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('AppUsers')
@Controller('app/users')
export class AppUsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: '创建商城用户' })
  @ApiBody({ type: CreateUserDto })
  @SuccessMessage('创建成功')
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: '修改登录密码' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdatePasswordDto })
  @SuccessMessage('修改成功')
  @Post('password')
  updatePassword(
    @CurrentUser() user: RequestUser,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(user.id, updatePasswordDto);
  }

  @ApiOperation({ summary: '修改个人资料（手机号、昵称、头像，字段均可选）' })
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateProfileDto })
  @SuccessMessage('修改成功')
  @Patch('profile')
  updateProfile(
    @CurrentUser() user: RequestUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.id, updateProfileDto);
  }
}
