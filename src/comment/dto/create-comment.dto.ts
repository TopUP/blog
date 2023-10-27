import {ApiProperty, ApiTags} from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@ApiTags('User')
export class CreateCommentDto {
    @ApiProperty({ description: 'Владелец комментария', nullable: false })
    user: User;

    @ApiProperty({ description: 'Пост комментария',     nullable: false })
    post: Post;

    @ApiProperty({ description: 'Текст комментария',    nullable: false })
    @IsNotEmpty()
    @IsString()
    body: string;
}
