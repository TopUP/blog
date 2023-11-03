import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

import { registerTestUser, TypeORMTestingModule } from 'src/utils/test/helpers';

import { AuthModule } from 'src/auth/auth.module';

import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/entities/user.entity';

import { PostModule } from 'src/post/post.module';
import { Post } from 'src/post/entities/post.entity';

import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/entities/comment.entity';

import { CategoryModule } from 'src/category/category.module';
import { Category } from 'src/category/entities/category.entity';
import { CreateCommentDto } from '../src/comment/dto/create-comment.dto';
import { UpdateCommentDto } from '../src/comment/dto/update-comment.dto';
import { EntityNotFoundExceptionFilter } from '../src/utils/filters/entity-not-found-exception.filter';
import { notFoundExceptionBody } from '../src/utils/validation/helpers';

const testingModuleMetadata = {
    imports: [
        TypeORMTestingModule([User, Post, Category, Comment]),

        UserModule,
        AuthModule,
        PostModule,
        CategoryModule,
        CommentModule,
    ],
};

describe('CommentController (e2e) Post exceptions', () => {
    let app: INestApplication;
    let accessToken: string;
    const adminUserRegData = {
        id: 1,
        full_name: 'Admin',
        email: 'admin@blog.net',
        password: 'qwerty',
    };
    const examplePostCreateData = {
        id: 1,
        userId: 1,
        categoryId: 1,
        title: 'Post title',
        body: 'Post body',
    };
    const commentBody = 'Some comment body';
    const commentNewBody = 'Some comment new body';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule(testingModuleMetadata).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalFilters(new EntityNotFoundExceptionFilter());

        await app.init();
    });

    it('/comment (GET)', () => {
        return request(app.getHttpServer()).get('/comment').expect(HttpStatus.OK).expect([]);
    });

    it('/comment/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/comment/' + 'qwerty')
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)');
            });
    });

    it('/comment/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/comment/1')
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });
    });

    it('/comment (POST)', async () => {
        return request(app.getHttpServer())
            .post('/comment')
            .expect(HttpStatus.UNAUTHORIZED)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    message: 'Unauthorized',
                    statusCode: HttpStatus.UNAUTHORIZED,
                });
            });
    });

    it('/comment (POST)', async () => {
        accessToken = await registerTestUser(app, adminUserRegData);
        return request(app.getHttpServer())
            .post('/comment')
            .send({ body: '' } as CreateCommentDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
            });
    });

    let expectedComment;
    it('/comment (POST)', async () => {
        await request(app.getHttpServer())
            .post('/category')
            .send({ title: 'commentPostCategory' })
            .auth(accessToken, { type: 'bearer' });
        const commentPost = (
            await request(app.getHttpServer())
                .post('/post')
                .send(examplePostCreateData)
                .auth(accessToken, { type: 'bearer' })
        ).body;

        expectedComment = {
            id: 1,
            body: commentBody,
            post: {},
            user: {},
        };
        return request(app.getHttpServer())
            .post('/comment')
            .send({ postId: commentPost.id, body: 'Some comment body' } as CreateCommentDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.CREATED)
            .expect(({ body }) => {
                expect(body).toMatchObject(expectedComment);
            });
    });

    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/comment/1')
            .expect(HttpStatus.OK)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    id: 1,
                    body: commentBody,
                });
            });
    });

    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer()).get('/comment/qwerty').expect(HttpStatus.BAD_REQUEST);
    });

    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/comment/1111')
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });
    });

    it('/comment (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/comment/1')
            .send({ body: 'Some body updated' } as CreateCommentDto)
            .expect(HttpStatus.UNAUTHORIZED);
    });

    it('/comment (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/comment/1')
            .send({ body: '' } as CreateCommentDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('/comment (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/comment/1')
            .send({ body: commentNewBody } as UpdateCommentDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.OK)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    id: 1,
                    body: commentNewBody,
                });
            });
    });
    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/comment/1')
            .expect(HttpStatus.OK)
            .expect(({ body }) => {
                expect(body).toMatchObject({
                    id: 1,
                    body: commentNewBody,
                    userId: 1,
                    postId: 1,
                });
            });
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer()).delete('/comment/qwerty').expect(HttpStatus.UNAUTHORIZED);
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/qwerty')
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST);
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/1111')
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/1')
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.CREATED);
    });

    afterAll((done) => {
        app.close();
        done();
    });
});
