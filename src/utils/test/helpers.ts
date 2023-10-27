// import { ConfigModule } from '@nestjs/config';
// import * as process from 'process';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
// import { getConnection } from 'typeorm';
import {INestApplication} from "@nestjs/common";
import * as request from "supertest";
import {RegisterUserDto} from "../../auth/dto/register-user.dto";

// export async function clearDB() {
//     const entities = getConnection('default').entityMetadatas;
//     for (const entity of entities) {
//         const repository = getConnection('default').getRepository(entity.name);
//         await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
//     }
// }

export const TypeORMTestingModule = (entities: any[]) => {
    // ConfigModule.forRoot();

    const config: TypeOrmModuleOptions = {
        type: 'sqlite',
        // host        : process.env.DATABASE_HOST || '127.0.0.1',
        // port        : 3306,
        // username    : process.env.DATABASE_USERNAME || 'root',
        // password    : process.env.DATABASE_PASSWORD || 'root',
        // database: './test/test_blog',
        database: ':memory:',
        entities: [...entities],
        synchronize: true,
    };

    return TypeOrmModule.forRoot(config);
};

export async function registerTestUser(app: INestApplication, user: {email: string, password: string}): Promise<string> {
    const registerReq = await request(app.getHttpServer())
        .post('/auth/register')
        .send({password_confirmation: user.password, ...user} as RegisterUserDto);

    return registerReq.body.access_token;
}

export async function authTestUser(app: INestApplication, user: {email: string, password: string}): Promise<string> {
    const accessTokenReq = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
            email: user.email,
            password: user.password,
        });

    return accessTokenReq.body.access_token;
}