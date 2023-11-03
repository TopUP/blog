import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { authTestUser, registerTestUser, TypeORMTestingModule } from 'src/utils/test/helpers';

import { AuthModule } from 'src/auth/auth.module';

import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

import { PostModule } from 'src/post/post.module';
import { Post } from 'src/post/entities/post.entity';

import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/entities/comment.entity';

import { CategoryModule } from 'src/category/category.module';
import { Category } from 'src/category/entities/category.entity';
import { ConfigModule } from '@nestjs/config';
import { emailAlreadyExistsExceptionBody, notFoundExceptionBody } from '../src/utils/validation/helpers';
import { EntityNotFoundExceptionFilter } from '../src/utils/filters/entity-not-found-exception.filter';

const testingModuleMetadata = {
    imports: [
        ConfigModule.forRoot(),

        TypeORMTestingModule([User, Post, Category, Comment]),

        UserModule,
        AuthModule,
        PostModule,
        CategoryModule,
        CommentModule,
    ],
};

describe('UserController (e2e) User exceptions', () => {
    let app: INestApplication;
    let accessToken: string;

    const adminUser = {
        id: 1,
        full_name: 'Admin',
        email: 'admin@blog.net',
        password: 'qwerty',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule(testingModuleMetadata).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalFilters(new EntityNotFoundExceptionFilter());

        await app.init();
    });

    it('/user (GET)', () => {
        return request(app.getHttpServer()).get('/user').expect(HttpStatus.OK).expect([]);
    });

    it('/user/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/user/' + 'qwerty')
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)');
            });
    });

    it('/user/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/user/1')
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });
    });

    it('/user (POST)', async () => {
        accessToken = await registerTestUser(app, adminUser);
        return request(app.getHttpServer())
            .post('/user')
            .send({
                full_name: '',
                email: '',
                password: '',
            })
            .expect(HttpStatus.UNAUTHORIZED)
            .expect(({ body }) => {
                expect(body.message).toMatch('Unauthorized');
                expect(body.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
            });
    });

    it('/user (POST)', async () => {
        return request(app.getHttpServer())
            .post('/user')
            .send({
                full_name: '',
                email: '',
                password: '',
            })
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
            });
    });

    it('/user (POST)', () => {
        return request(app.getHttpServer())
            .post('/user')
            .send({
                full_name: 'Full Name',
                email: 'E-Mail',
                password: 'password',
            })
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toEqual(['email must be an email']);
                expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
            });
    });

    afterAll((done) => {
        app.close();
        done();
    });
});

describe('UserController (e2e) User life cycle', () => {
    let app: INestApplication;

    const adminUser = {
        id: 1,
        full_name: 'Admin',
        email: 'admin@blog.net',
        password: 'qwerty',
    };

    const exampleUser = {
        id: 2,
        full_name: 'Example User',
        email: 'example_user@blog.net',
        password: 'qwerty',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule(testingModuleMetadata).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalFilters(new EntityNotFoundExceptionFilter());

        await app.init();
    });

    it('/user (POST|GET|PATCH|DELETE) ', async () => {
        const accessToken = await registerTestUser(app, adminUser);

        const createUserReq = await request(app.getHttpServer())
            .post('/user')
            .auth(accessToken, { type: 'bearer' })
            .send(exampleUser as CreateUserDto)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    id: exampleUser.id,
                    full_name: exampleUser.full_name,
                    email: exampleUser.email,
                });
            });

        const createdUser = await createUserReq.body;
        const getOneUserReq = await request(app.getHttpServer())
            .get('/user/' + createdUser.id)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toMatchObject(createdUser);
            });

        const user = getOneUserReq.body;
        await request(app.getHttpServer())
            .patch('/user/' + user.id)
            .auth(accessToken, { type: 'bearer' })
            .send({
                email: 'email',
            })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
                expect(res.body.message).toEqual(['email must be an email']);
            });

        const newFullName: string = 'New Full Name';
        const newEmail: string = 'newEmail@email.new';
        await request(app.getHttpServer())
            .patch('/user/' + user.id)
            .auth(accessToken, { type: 'bearer' })
            .send({
                full_name: newFullName,
                email: newEmail,
            })
            .expect(HttpStatus.FORBIDDEN);

        const userAccessToken = await authTestUser(app, { email: exampleUser.email, password: exampleUser.password });
        const updateUserReq = await request(app.getHttpServer())
            .patch('/user/' + user.id)
            .auth(userAccessToken, { type: 'bearer' })
            .send({
                full_name: newFullName,
                email: newEmail,
            })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.full_name).toMatch(newFullName);
                expect(res.body.email).toMatch(newEmail);
            });

        let updatedUser = updateUserReq.body;
        const getUpdatedUserReq = await request(app.getHttpServer())
            .get('/user/' + updatedUser.id)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toMatchObject(updatedUser);
            });

        updatedUser = getUpdatedUserReq.body;
        await request(app.getHttpServer())
            .post('/user')
            .send(updatedUser as CreateUserDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body).toMatchObject(emailAlreadyExistsExceptionBody);
            });

        await request(app.getHttpServer())
            .delete('/user/' + 99999)
            .expect(HttpStatus.UNAUTHORIZED);

        await request(app.getHttpServer())
            .delete('/user/' + 99999)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });

        await request(app.getHttpServer())
            .delete('/user/' + updatedUser.id)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

        await request(app.getHttpServer())
            .delete('/user/' + updatedUser.id)
            .auth(userAccessToken, { type: 'bearer' })
            .expect(HttpStatus.CREATED);

        await request(app.getHttpServer())
            .delete('/user/' + 'qwerty')
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)');
            });
    });

    afterAll((done) => {
        app.close();
        done();
    });
});
