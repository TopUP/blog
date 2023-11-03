import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConfigModule } from '@nestjs/config';
import * as process from 'process';

import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './auth/auth.module';

import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';

import { PostModule } from './post/post.module';
import { Post } from './post/entities/post.entity';

import { CategoryModule } from './category/category.module';
import { Category } from './category/entities/category.entity';

import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/entities/comment.entity';

@Module({
    imports: [
        ConfigModule.forRoot(),

        TypeOrmModule.forRoot({
            type: 'mysql',
            host: process.env.DATABASE_HOST,
            port: 3306,
            username: process.env.DATABASE_USERNAME,
            password: process.env.DATABASE_PASSWORD,
            database: process.env.DATABASE_DATABASE,
            entities: [User, Post, Category, Comment],
            synchronize: true,
        }),

        AuthModule,
        UserModule,
        PostModule,
        CategoryModule,
        CommentModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
