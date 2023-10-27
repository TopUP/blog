import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';

import {CommentService} from './comment.service';
import {CommentController} from './comment.controller';
import {Comment} from "./entities/comment.entity";


@Module({
    imports: [TypeOrmModule.forFeature([Comment])],
    controllers: [CommentController],
    providers: [CommentService],
})
export class CommentModule {
}
