import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private repository: Repository<Category>,
    ) {}

    create(createCategoryDto: CreateCategoryDto) {
        return this.repository.save({ ...createCategoryDto });
    }

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneBy({ id });
    }

    update(id: number, updateCategoryDto: UpdateCategoryDto) {
        return this.repository.save({ ...updateCategoryDto, id });
    }

    async remove(id: number) {
        await this.repository.delete(id);
    }
}
