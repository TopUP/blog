import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

@ApiTags('Comment')
export class UpdateCommentDto {
    @ApiProperty({ description: 'Текст комментария', nullable: false })
    @IsNotEmpty()
    @IsString()
    body: string;
}
