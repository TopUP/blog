import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Category } from '../category/entities/category.entity';
import { categoryHasPostsExceptionBody } from '../utils/validation/helpers';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private repository: Repository<Post>,
    ) {}

    create(createPostDto: CreatePostDto) {
        return this.repository.save({ ...createPostDto });
    }

    async findAll() {
        const posts = await this.repository.find();

        posts.forEach((post: Post) => {
            delete post?.user.password;
        });

        return posts;
    }

    async findOne(id: number) {
        const post = await this.repository.findOneByOrFail({ id });
        delete post?.user.password;

        return post;
    }

    update(id: number, updatePostDto: UpdatePostDto) {
        return this.repository.save({ ...updatePostDto, id });
    }

    async remove(id: number) {
        await this.repository.delete(id);
    }

    findByCategory(category: Category) {
        return this.repository.findOneBy({ category });
    }

    async categoryHasPostsFail(category: Category) {
        if (!category) {
            return;
        }

        if (await this.findByCategory(category)) {
            throw new BadRequestException(categoryHasPostsExceptionBody);
        }
    }
}
