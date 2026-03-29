import { ResponseMessage } from '@/common';
import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ResponseMessage('Users fetched successfully')
  async findAll() {
    return this.userService.find();
  }
}
