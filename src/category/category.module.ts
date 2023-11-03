import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Category } from './entities/category.entity';
import { PostService } from '../post/post.service';
import { Post } from '../post/entities/post.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Category, Post])],
    controllers: [CategoryController],
    providers: [CategoryService, MulterModule, PostService],
})
export class CategoryModule {}
