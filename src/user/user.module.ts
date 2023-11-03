import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([User])],
    exports: [],
    providers: [UserService, User],
    controllers: [UserController],
})
export class UserModule {}
