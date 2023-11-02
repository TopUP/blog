import {Test, TestingModule} from '@nestjs/testing';
import {HttpStatus, INestApplication, ValidationPipe} from '@nestjs/common';
import * as request from 'supertest';

import {registerTestUser, TypeORMTestingModule} from 'src/utils/test/helpers';

import {AuthModule} from "src/auth/auth.module";

import {UserModule} from 'src/user/user.module';
import {User} from 'src/user/entities/user.entity';

import {PostModule} from "src/post/post.module";
import {Post} from "src/post/entities/post.entity";

import {CommentModule} from "src/comment/comment.module";
import {Comment} from "src/comment/entities/comment.entity";

import {CategoryModule} from "src/category/category.module";
import {Category} from "src/category/entities/category.entity";
import {CreateCategoryDto} from "../src/category/dto/create-category.dto";

const testingModuleMetadata = {
    imports: [
        TypeORMTestingModule([
            User,
            Post,
            Category,
            Comment
        ]),

        UserModule,
        AuthModule,
        PostModule,
        CategoryModule,
        CommentModule
    ],
}

describe('CategoryController (e2e)', () => {
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
        app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true,}));
        await app.init();
    });


    it('/category (GET)', () => {
        return request(app.getHttpServer())
            .get('/category')
            .expect(HttpStatus.OK)
            .expect([]);
    });

    it('/category/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/category/' + 'qwerty')
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)')
            })
    });

    it('/category/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/category/1')
            .expect(HttpStatus.NOT_FOUND)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    message:'Not Found',
                    statusCode:404
                })
            });
    });

    it('/category (POST)', async () => {
        accessToken = await registerTestUser(app, adminUser)
        return request(app.getHttpServer())
            .post('/category')
            .expect(HttpStatus.UNAUTHORIZED)
            .expect(({body}) => {
                expect(body.message).toMatch('Unauthorized');
                expect(body.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
            });
    });

    it('/category (POST)', async () => {
        return request(app.getHttpServer())
            .post('/category')
            .send({ title: '' } as CreateCategoryDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
            });
    });

    it('/category (POST)', async () => {
        return request(app.getHttpServer())
            .post('/category')
            .send({ title: 'Some title' } as CreateCategoryDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.CREATED)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    id: 1,
                    title: 'Some title',
                });
            });
    });

    it('/category/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/category/1')
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    id: 1,
                    title: 'Some title',
                });
            });
    });

    it('/category/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/category/qwerty')
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('/category/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/category/1111')
            .expect(HttpStatus.NOT_FOUND)
    });

    it('/category (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/category/1')
            .send({ title: 'Some title updated' } as CreateCategoryDto)
            .expect(HttpStatus.UNAUTHORIZED)
    });

    it('/category (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/category/1')
            .send({ title: '' } as CreateCategoryDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('/category (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/category/1')
            .send({ title: 'Some title updated' } as CreateCategoryDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    id: 1,
                    title: 'Some title updated',
                });
            });
    });

    it('/category/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/category/1')
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    id: 1,
                    title: 'Some title updated',
                });
            });
    });

    it('/category/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/category/qwerty')
            .expect(HttpStatus.UNAUTHORIZED)
    });

    it('/category/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/category/qwerty')
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('/category/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/category/1111')
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.NOT_FOUND)
    });

    it('/category/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/category/1')
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.CREATED)
    });

    afterAll((done) => {
        app.close();
        done();
    });
});
