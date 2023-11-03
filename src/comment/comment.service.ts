import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(Comment)
        private repository: Repository<Comment>,
    ) {}

    create(createCommentDto: CreateCommentDto) {
        return this.repository.save({ ...createCommentDto });
    }

    findAll() {
        return this.repository.find();
    }

    async findOne(id: number) {
        return this.repository.findOneBy({ id });
    }

    update(id: number, updateCommentDto: UpdateCommentDto) {
        return this.repository.save({ ...updateCommentDto, id });
    }

    async remove(id: number) {
        await this.repository.delete(id);
    }
}
