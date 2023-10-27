import {Entity, Column, PrimaryGeneratedColumn, OneToMany, IsNull} from 'typeorm';
import {ApiProperty, ApiTags} from "@nestjs/swagger";

import {Post} from "../../post/entities/post.entity";

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    @ApiProperty() id: number;

    @Column()
    @ApiProperty() title: string;

    @Column({default: null})
    @ApiProperty() image: string;

    @OneToMany(() => Post, post => post.category)
    @ApiProperty({type: () => [Post]}) posts: Post[]
}
