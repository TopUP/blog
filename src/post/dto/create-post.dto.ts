import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

export class CreatePostDto {
    @ApiProperty({ description: 'Владелец поста', nullable: false })
    user: User;

    @ApiProperty({ description: 'Категория поста', nullable: false })
    category: Category;

    @ApiProperty({ description: 'ID категории поста', nullable: false })
    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    @ApiProperty({ description: 'Заголовок поста', nullable: false })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Тело поста', nullable: false })
    @IsNotEmpty()
    @IsString()
    body: string;
}
