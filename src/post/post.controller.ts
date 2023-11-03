import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ForbiddenException,
    ParseIntPipe,
    HttpStatus,
    Res,
    NotFoundException,
    BadRequestException,
    Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { CategoryService } from '../category/category.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
    constructor(
        private readonly postService: PostService,
        private readonly categoryService: CategoryService,
    ) {}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Создание поста' })
    @ApiQuery({ name: 'categoryId', required: true, description: 'ID категории' })
    @ApiQuery({ name: 'title', required: true, description: 'Заголовок поста' })
    @ApiQuery({ name: 'body', required: true, description: 'Тело поста' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Success', type: PostEntity })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    async create(@Body() createPostDto: CreatePostDto, @Req() req) {
        createPostDto.user = req.user;
        createPostDto.category = await this.categoryService.findOne(createPostDto.categoryId);
        if (!createPostDto.category) {
            throw new BadRequestException({
                message: ['Category not found'],
                error: 'Bad Request',
                statusCode: 400,
            });
        }

        return this.postService.create(createPostDto);
    }

    @Get()
    @ApiOperation({ summary: 'Список постов' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [PostEntity], isArray: true })
    findAll() {
        return this.postService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Одиночный пост' })
    @ApiParam({ name: 'id', required: true, description: 'ID поста' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: [PostEntity] })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async findOne(@Param('id', ParseIntPipe) id: string, @Res() res) {
        const post = await this.postService.findOne(+id);
        if (!post) {
            return res.status(HttpStatus.NOT_FOUND).send();
        }

        return res.json(post);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Изменение поста' })
    @ApiParam({ name: 'id', required: true, description: 'ID' })
    @ApiQuery({ name: 'categoryId', required: false, description: 'ID категории' })
    @ApiQuery({ name: 'title', required: false, description: 'Заголовок поста' })
    @ApiQuery({ name: 'body', required: false, description: 'Тело поста' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: PostEntity })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @Req() req) {
        var post = await this.postService.findOne(+id);
        if (!post) {
            throw new NotFoundException();
        }

        if (post.user.id != req.user.id) {
            throw new ForbiddenException();
        }

        if (updatePostDto.categoryId) {
            updatePostDto.category = await this.categoryService.findOne(updatePostDto.categoryId);
            if (!updatePostDto.category) {
                throw new BadRequestException({
                    message: ['Category not found'],
                    error: 'Bad Request',
                    statusCode: 400,
                });
            }
        }

        return this.postService.update(+id, updatePostDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Удаление поста' })
    @ApiParam({ name: 'id', required: true, description: 'ID' })
    @ApiResponse({ status: HttpStatus.CREATED, description: 'Deleted' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
    @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden.' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
    async remove(@Param('id') id: string, @Req() req, @Res() res) {
        var post = await this.postService.findOne(+id);
        if (!post) {
            throw new NotFoundException();
        }

        if (post.user.id != req.user.id) {
            throw new ForbiddenException();
        }

        await this.postService.remove(+id);
        return res.status(HttpStatus.CREATED).send();
    }
}
