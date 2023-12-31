import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as process from 'process';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { emailAlreadyExistsExceptionBody } from '../utils/validation/helpers';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
    ) {}

    async create(data: CreateUserDto) {
        data.password = await bcrypt.hash(data.password, +process.env.SALT);

        return this.repository.save({ ...data });
    }

    findAll() {
        return this.repository.find();
    }

    findOne(id: number) {
        return this.repository.findOneByOrFail({ id });
    }

    async update(id: number, data: UpdateUserDto) {
        if (data.password) {
            data.password = await bcrypt.hash(data.password, +process.env.SALT);
        }

        return await this.repository.save({ ...data, id });
    }

    async remove(id: number) {
        await this.repository.delete(id);
    }

    findByEmail(email: string) {
        return this.repository.findOneBy({ email });
    }

    async emailAlreadyExistsFail(email: string) {
        if (!email) {
            return;
        }

        if (await this.findByEmail(email)) {
            throw new BadRequestException(emailAlreadyExistsExceptionBody);
        }
    }
}
