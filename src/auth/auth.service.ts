import * as process from 'process';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { emailAlreadyExistsExceptionBody } from '../utils/validation/helpers';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private repository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(data: RegisterUserDto) {
        data.password = await bcrypt.hash(data.password, +process.env.SALT);

        return this.repository.save({ ...data });
    }

    async login(user: any) {
        return {
            access_token: this.jwtService.sign(this.getPayload(user)),
        };
    }

    getPayload(user: any) {
        return {
            full_name: user.full_name,
            email: user.email,
            id: user.id,
        };
    }

    async validateUser(email: string, pass: string) {
        const user: User = await this.findByEmail(email);
        if (!user || !(await bcrypt.compare(pass, user.password))) {
            return null;
        }

        // const { password, ...userData } = user;
        delete user.password;
        return user;
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
