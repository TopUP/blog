import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsAlphanumeric } from 'class-validator';

export class LoginUserDto {
    @ApiProperty({ description: 'Электронная почта пользователя', nullable: false })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Пароль пользователя', nullable: false })
    @IsNotEmpty()
    @IsAlphanumeric()
    password: string;
}
