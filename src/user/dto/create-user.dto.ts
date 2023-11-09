import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsExistUserEmail } from '../../utils/validation/is-exist-user-email.validator';

@ApiTags('User')
export class CreateUserDto {
    @ApiProperty({ description: 'Имя пользователя', nullable: false })
    @IsNotEmpty()
    @IsString()
    full_name: string;

    @ApiProperty({ description: 'Электронная почта пользователя', nullable: false })
    @IsNotEmpty()
    @IsEmail()
    @IsExistUserEmail()
    email: string;

    @ApiProperty({ description: 'Пароль пользователя', nullable: false })
    @IsNotEmpty()
    @IsString()
    password: string;
}
