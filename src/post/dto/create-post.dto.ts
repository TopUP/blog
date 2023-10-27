import { ApiProperty } from '@nestjs/swagger';

import { User }     from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';
import {IsNotEmpty, IsString} from "class-validator";

export class CreatePostDto {
    @ApiProperty({ description: 'Владелец поста',   nullable: false })
    user        : User;

    @ApiProperty({ description: 'Категория поста',  nullable: false })
    category    : Category;

    @ApiProperty({ description: 'Заголовок поста',  nullable: false })
    @IsNotEmpty()
    @IsString()
    title       : string;

    @ApiProperty({ description: 'Тело поста',       nullable: false })
    @IsNotEmpty()
    @IsString()
    body        : string;
}
