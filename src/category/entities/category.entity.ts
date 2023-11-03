import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Post } from '../../post/entities/post.entity';

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    @ApiProperty()
    id: number;

    @Column()
    @ApiProperty()
    title: string;

    @OneToMany(() => Post, (post) => post.category)
    @ApiProperty({ type: () => [Post], description: 'Посты категории', nullable: false, isArray: true })
    posts: Post[];
}
