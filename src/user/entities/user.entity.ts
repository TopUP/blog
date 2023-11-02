import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from 'typeorm';
import {ApiProperty} from '@nestjs/swagger';

import {Post} from "../../post/entities/post.entity";
import {Comment} from "../../comment/entities/comment.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: 'ID пользователя', nullable: false})
    id: number;

    @Column()
    @ApiProperty({description: 'Имя пользователя', nullable: false})
    full_name: string;

    @Column({unique: true})
    @ApiProperty({description: 'E-Mail пользователя', nullable: false})
    email: string;

    @Column()
    @ApiProperty({description: 'Пароль пользователя', nullable: false})
    password: string;

    @OneToMany(() => Post, (post) => post.user)
    @ApiProperty({type: () => [Post], description: 'Посты пользователя', nullable: false, isArray: true})
    posts: Post[]

    @OneToMany(() => Comment, (comment) => comment.user)
    @ApiProperty({type: () => [Comment]})
    comments: Comment[]
}
