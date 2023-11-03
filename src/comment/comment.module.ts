import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { Comment } from './entities/comment.entity';
import { Post } from '../post/entities/post.entity';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Comment, Post, User])],
    controllers: [CommentController],
    providers: [CommentService, PostService, UserService],
})
export class CommentModule {}
