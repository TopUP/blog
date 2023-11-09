import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { IsExistUserEmailConstraint } from '../utils/validation/is-exist-user-email.validator';

@Module({
    imports: [
        ConfigModule.forRoot(),

        UserModule,
        PassportModule,
        TypeOrmModule.forFeature([User]),

        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: '6660s' },
        }),
    ],
    exports: [AuthService],
    providers: [AuthService, LocalStrategy, JwtStrategy, User, IsExistUserEmailConstraint],
    controllers: [AuthController],
})
export class AuthModule {}
