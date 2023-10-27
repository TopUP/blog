import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from 'class-validator';

@ApiTags('User')
export class CreateUserDto {
    @ApiProperty({ description: 'Имя пользователя', nullable: false })
    @IsNotEmpty()
    @IsString()
    full_name: string;

    @ApiProperty({ description: 'Электронная почта пользователя', nullable: false, })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Пароль пользователя', nullable: false })
    @IsNotEmpty()
    @IsAlphanumeric()
    password: string;
}
