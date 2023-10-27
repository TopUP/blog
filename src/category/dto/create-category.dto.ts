import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
    @ApiProperty({ description: 'Название категории', nullable: false })
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({ description: 'Изображение категории', nullable: true })
    @IsString()
    image: string;
}