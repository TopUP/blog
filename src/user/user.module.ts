import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';
import { IsExistUserEmailConstraint } from '../utils/validation/is-exist-user-email.validator';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User])],
    exports: [],
    providers: [UserService, User, IsExistUserEmailConstraint],
    controllers: [UserController],
})
export class UserModule {}
