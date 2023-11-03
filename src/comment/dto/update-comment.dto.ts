import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@ApiTags('Comment')
export class UpdateCommentDto {
    @ApiProperty({ description: 'Текст комментария', nullable: false })
    @IsNotEmpty()
    @IsString()
    body: string;
}
