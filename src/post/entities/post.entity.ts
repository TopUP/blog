import {Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany, OneToOne} from "typeorm";
import {ApiProperty} from "@nestjs/swagger";

import {User} from "../../user/entities/user.entity";
import {Comment} from "../../comment/entities/comment.entity";
import {Category} from "../../category/entities/category.entity";

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.posts, {eager: true})
    @ApiProperty({type: () => User})
    user: User

    @ManyToOne(() => Category, (category) => category.posts, {eager: true})
    @ApiProperty({type: () => Category})
    category: Category;

    @Column()
    @ApiProperty()
    title: string;

    @Column()
    @ApiProperty()
    body: string;

    @OneToMany(() => Comment, (comment) => comment.post)
    @ApiProperty({type: () => [Comment]})
    comments: Comment[]

    @Column()
    userId: number;

    @Column()
    categoryId: number;
}
