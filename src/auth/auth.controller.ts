import { Controller, Post, Body, UseGuards, Request, BadRequestException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { emailAlreadyExistsHandler } from '../utils/validation/helpers';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @ApiOperation({ summary: 'Регистрация нового пользователя' })
    @ApiQuery({ name: 'full_name', required: true, description: 'ФИО' })
    @ApiQuery({ name: 'email', required: true, description: 'E-Mail' })
    @ApiQuery({ name: 'password', required: true, description: 'Пароль' })
    @ApiQuery({ name: 'password_confirmation', required: true, description: 'Повтор пароля' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Success', type: Object })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
    async register(@Body() data: RegisterUserDto) {
        if (data.password !== data.password_confirmation) {
            throw new BadRequestException({
                message: ['Password not confirmed'],
                error: 'Bad Request',
                statusCode: 400,
            });
        }

        try {
            const user = await this.authService.register(data);
            // const {password, password_confirmation, ...userData} = user;
            return this.authService.login(user);
        } catch (e) {
            emailAlreadyExistsHandler(e);
        }
    }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @ApiQuery({ name: 'email', required: true, description: 'E-Mail' })
    @ApiQuery({ name: 'password', required: true, description: 'Пароль' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Success', type: Object })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    login(@Request() req) {
        return this.authService.login(req.user);
    }
}
