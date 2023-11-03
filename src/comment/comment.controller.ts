import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    Req,
    BadRequestException,
    ForbiddenException,
    Res,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { AuthGuard } from '@nestjs/passport';
import { Post as PostEntity } from '../post/entities/post.entity';
import { PostService } from '../post/post.service';
import { UserService } from '../user/user.service';
import { EntityNotFoundError } from 'typeorm';

@ApiTags('Comment')
@ApiBearerAuth()
@Controller('comment')
export class CommentController {
    constructor(
        private readonly commentService: CommentService,
        private readonly postService: PostService,
        private readonly userService: UserService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Создание комментария' })
    @ApiQuery({ name: 'postId', required: true, description: 'ID категории' })
    @ApiQuery({ name: 'body', required: true, description: 'Тело поста' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Success', type: PostEntity })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    async create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
        createCommentDto.user = await this.userService.findOne(req.user.id);
        createCommentDto.post = await this.postService.findOne(createCommentDto.postId);
        if (!createCommentDto.post) {
            throw new BadRequestException({
                message: ['Post not found'],
                error: 'Bad Request',
                statusCode: 400,
            });
        }

        return this.commentService.create(createCommentDto);
    }

    @Get()
    @ApiOperation({ summary: 'Список комментариев' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [Comment], isArray: true })
    findAll() {
        return this.commentService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Одиночный комментарий' })
    @ApiParam({ name: 'id', required: true, description: 'ID комментария' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [Comment], isArray: true })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async findOne(@Param('id', ParseIntPipe) id: string) {
        return await this.commentService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Изменение комментария' })
    @ApiParam({ name: 'id', required: true, description: 'ID комментария' })
    @ApiQuery({ name: 'body', required: true, description: 'Тело поста' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: Comment })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async update(@Param('id', ParseIntPipe) id: string, @Body() updateCommentDto: UpdateCommentDto, @Req() req) {
        const comment = await this.commentService.findOne(+id);

        try {
            await this.postService.findOne(comment.postId);
        } catch (e) {
            if (e instanceof EntityNotFoundError) {
                throw new BadRequestException({
                    message: ['Post not found'],
                    error: 'Bad Request',
                    statusCode: 400,
                });
            }
        }

        if (comment.userId != req.user.id) {
            throw new ForbiddenException();
        }

        return this.commentService.update(+id, { body: updateCommentDto.body } as UpdateCommentDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Удаление комментария' })
    @ApiParam({ name: 'id', required: true, description: 'ID комментария' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Success' })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async remove(@Param('id', ParseIntPipe) id: string, @Req() req, @Res() res) {
        const comment = await this.commentService.findOne(+id);

        if (comment.userId != req.user.id) {
            throw new ForbiddenException();
        }

        await this.commentService.remove(+id);
        return res.status(HttpStatus.CREATED).send();
    }
}
