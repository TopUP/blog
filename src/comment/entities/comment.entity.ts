import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToOne, JoinColumn} from 'typeorm';
import {ApiProperty, ApiTags} from "@nestjs/swagger";

import {User} from "../../user/entities/user.entity";
import {Post} from "../../post/entities/post.entity";

@ApiTags('User')
@Entity()
export class Comment {
    @PrimaryGeneratedColumn()
    @ApiProperty() id: number;

    @ManyToOne(() => User, (user) => user.posts, {eager: true})
    @ApiProperty({type: () => User})
    user: User

    @ManyToOne(() => Post, (post) => post.comments, {eager: true})
    @ApiProperty({type: () => Post})
    post: Post

    @Column()
    @ApiProperty() body: string;
}
