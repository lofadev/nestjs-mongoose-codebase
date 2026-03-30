import { ResponseMessage } from '@/common';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from './auth.decorator';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ResponseMessage('Registration successful')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @ResponseMessage('Login successful')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
