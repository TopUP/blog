import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@ApiTags('User')
export class CreateCommentDto {
    @ApiProperty({ description: 'Владелец комментария', nullable: false })
    user: User;

    @ApiProperty({ description: 'Пост комментария', nullable: false })
    post: Post;

    @ApiProperty({ description: 'ID поста комментария', nullable: false })
    @IsNotEmpty()
    @IsNumber()
    postId: number;

    @ApiProperty({ description: 'Текст комментария', nullable: false })
    @IsNotEmpty()
    @IsString()
    body: string;
}
