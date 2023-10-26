import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
    ) {}

    create(createUserDto: CreateUserDto) {
        return this.repository.save({ ...createUserDto });
    }

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneBy({ id });
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return this.repository.save({ ...updateUserDto, id });
    }

    async remove(id: number) {
        await this.repository.delete(id);
    }
}
