import { ResponseMessage } from '@/common';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Roles } from '../auth/auth.decorator';
import { Role } from './user.model';
import { UserService } from './user.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ResponseMessage('User profile fetched successfully')
  async getMe(@CurrentUser('id') userId: string) {
    return this.userService.findById(userId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ResponseMessage('Users fetched successfully')
  async findAll() {
    return this.userService.find();
  }
}
