import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

const typeOrmModule = TypeOrmModule.forFeature([User]);

@Module({
    imports: [typeOrmModule],
    exports: [],
    providers: [UserService, User],
    controllers: [UserController],
})
export class UserModule {}
