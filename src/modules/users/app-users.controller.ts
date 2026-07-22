import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessMessage } from 'src/common/decorators/success-message.decorator';
import { CreateUserDto } from './dto/create-user.dto';
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
}
