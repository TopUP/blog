import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity';
import { Category } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';

@Module({
    imports: [TypeOrmModule.forFeature([Post, Category])],
    exports: [],
    providers: [PostService, CategoryService],
    controllers: [PostController],
})
export class PostModule {}
