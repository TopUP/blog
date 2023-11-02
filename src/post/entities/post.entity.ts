import {Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

import {User} from "../../user/entities/user.entity";
import {Comment} from "../../comment/entities/comment.entity";
import {Category} from "../../category/entities/category.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    @ApiProperty({description: 'ID поста', nullable: false})
    id: number;

    @ManyToOne(() => User, (user) => user.posts, {eager: true})
    @ApiProperty({type: () => User, description: 'Владелец поста', nullable: false})
    user: User

    @ManyToOne(() => Category, (category) => category.posts, {eager: true})
    @ApiProperty({type: () => Category, description: 'Категория поста', nullable: false})
    category: Category;

    @Column()
    @ApiProperty({description: 'Заголовок поста', nullable: false})
    title: string;

    @Column()
    @ApiProperty({description: 'Текст поста', nullable: false})
    body: string;

    @OneToMany(() => Comment, (comment) => comment.post)
    @ApiProperty({type: () => [Comment], description: 'Комментарии к посту', nullable: false, isArray: true})
    comments: Promise<Comment[]>
}
