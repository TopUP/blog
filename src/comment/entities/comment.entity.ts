import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

import { User } from '../../user/entities/user.entity';
import { Post } from '../../post/entities/post.entity';

@ApiTags('User')
@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    @ApiProperty({ description: 'ID комментария', nullable: false })
    id: number;

    @ManyToOne(() => User, (user) => user.comments)
    @ApiProperty({ type: () => User, description: 'Владелец комментария', nullable: false })
    user: User;

    @ManyToOne(() => Post, (post) => post.comments)
    @ApiProperty({ type: () => Post, description: 'Пост комментария', nullable: false })
    post: Post;

    @Column()
    @ApiProperty({ description: 'Текст комментария', nullable: false })
    body: string;

    @Column()
    @ApiProperty({ description: 'ID поста комментария', nullable: false })
    postId: number;

    @Column()
    @ApiProperty({ description: 'ID владельца комментария', nullable: false })
    userId: number;
}
