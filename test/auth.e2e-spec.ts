import {Test, TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication, ValidationPipe} from '@nestjs/common';
import * as request from 'supertest';

import {TypeORMTestingModule} from "src/utils/test/helpers";

import {AuthModule} from "src/auth/auth.module";
import {RegisterUserDto} from "src/auth/dto/register-user.dto";

import {UserModule} from "src/user/user.module";
import {User} from "src/user/entities/user.entity";

import {PostModule} from "src/post/post.module";
import {Post} from "src/post/entities/post.entity";

import {CategoryModule} from "src/category/category.module";
import {Category} from "src/category/entities/category.entity";

import {CommentModule} from "src/comment/comment.module";
import {Comment} from "src/comment/entities/comment.entity";

describe('AuthController (e2e)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TypeORMTestingModule([
                User,
                Post,
                Category,
                Comment,
            ]),

                AuthModule,
                UserModule,
                PostModule,
                CategoryModule,
                CommentModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true,}));
        await app.init();
    });

    it('/auth/register | /auth/login (POST) - BAD REQUESTS', () => {
        request(app.getHttpServer())
            .post('/auth/register')
            .send({})
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(400);
            });

        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                full_name: 'FullName',
                email: 'email',
                password: 'password',
                password_confirmation: 'password',
            } as RegisterUserDto)
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(400);
            });

        request(app.getHttpServer())
            .post('/auth/register')
            .send({
                full_name: 'FullName',
                email: 'email@email.net',
                password: 'password',
                password_confirmation: 'bad password',
            } as RegisterUserDto)
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.message[0]).toMatch('Password not confirmed');
                expect(body.statusCode).toEqual(400);
            });

        request(app.getHttpServer())
            .post('/auth/login')
            .send({
                full_name: 'FullName',
                email: 'email@email.net',
                password: 'password',
                password_confirmation: 'bad password',
            } as RegisterUserDto)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/auth/register | /auth/login (POST) - GOOD REQUESTS', async () => {
        const exampleUser = {
            id: 1,
            full_name: 'Full Name',
            email: 'email@email.net',
            password: 'qwerty',
            password_confirmation: 'qwerty',
        };

        await request(app.getHttpServer())
            .post('/auth/register')
            .send(exampleUser as RegisterUserDto)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toEqual(expect.objectContaining({
                    access_token: expect.any(String)
                }));
            });

        const loginReq = await request(app.getHttpServer())
            .post('/auth/login')
            .send({
                email: exampleUser.email,
                password: exampleUser.password,
            })
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toEqual(expect.objectContaining({
                    access_token: expect.any(String)
                }));
            });

        const accessToken: string = loginReq.body.access_token;
    });

    afterAll((done) => {
        app.close();
        done();
    });
});
