import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsAlphanumeric } from 'class-validator';

export class RegisterUserDto {
    @ApiProperty({ description: 'Имя пользователя', nullable: false })
    @IsNotEmpty()
    @IsString()
    full_name: string;

    @ApiProperty({ description: 'Электронная почта пользователя', nullable: false })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Пароль пользователя', nullable: false })
    @IsNotEmpty()
    @IsAlphanumeric()
    password: string;

    @ApiProperty({ description: 'Повтор пароля пользователя', nullable: false })
    @IsNotEmpty()
    @IsAlphanumeric()
    password_confirmation: string;
}
