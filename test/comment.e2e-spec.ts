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
import {CreateCategoryDto} from "src/category/dto/create-category.dto";
import {CreateCommentDto} from "../src/comment/dto/create-comment.dto";
import {CreatePostDto} from "../src/post/dto/create-post.dto";
import {UpdateCommentDto} from "../src/comment/dto/update-comment.dto";

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

describe('CategoryController (e2e) Post exceptions', () => {
    let app: INestApplication;
    let accessToken: string;

    const adminUserRegData = {
        id: 1,
        full_name: 'Admin',
        email: 'admin@blog.net',
        password: 'qwerty',
    };
    const adminUser = {
        full_name: adminUserRegData.full_name,
        email: adminUserRegData.email,
        id: adminUserRegData.id,
    };
    const exampleUserRegData = {
        id: 2,
        full_name: 'Example User',
        email: 'example_user@blog.net',
        password: 'qwerty',
    };
    const exampleUser = {
        full_name: exampleUserRegData.full_name,
        email: exampleUserRegData.email,
        id: exampleUserRegData.id,
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
        app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true,}));
        await app.init();
    });


    it('/comment (GET)', () => {
        return request(app.getHttpServer())
            .get('/comment')
            .expect(HttpStatus.OK)
            .expect([]);
    });

    it('/comment/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/comment/' + 'qwerty')
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)')
            })
    });

    it('/comment/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/comment/1')
            .expect(HttpStatus.NOT_FOUND)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    message: 'Not Found',
                    statusCode: HttpStatus.NOT_FOUND
                })
            });
    });

    it('/comment (POST)', async () => {
        return request(app.getHttpServer())
            .post('/comment')
            .expect(HttpStatus.UNAUTHORIZED)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    message: 'Unauthorized',
                    statusCode: HttpStatus.UNAUTHORIZED
                })
            });
    });

    it('/comment (POST)', async () => {
        accessToken = await registerTestUser(app, adminUserRegData)
        return request(app.getHttpServer())
            .post('/comment')
            .send({ body: '' } as CreateCommentDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
            });
    });

    let expectedComment;
    it('/comment (POST)', async () => {
        const commentPostCategory = (await request(app.getHttpServer())
            .post('/category')
            .send({ title: 'commentPostCategory' })
            .auth(accessToken, {type: "bearer"}))
            .body;
        const commentPost = (await request(app.getHttpServer())
            .post('/post')
            .send(examplePostCreateData)
            .auth(accessToken, {type: "bearer"}))
            .body;

        expectedComment = {
            id: 1,
            body: commentBody,
            post: {},
            user: {}
        };
        return request(app.getHttpServer())
            .post('/comment')
            .send({ postId: commentPost.id, body: 'Some comment body' } as CreateCommentDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.CREATED)
            .expect(({body}) => {
                expect(body).toMatchObject(expectedComment);
            });
    });

    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/comment/1')
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                expect(body).toMatchObject({
                    id: 1,
                    body: commentBody,
                });
            });
    });

    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/comment/qwerty')
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('/comment/:id (GET)', async () => {
        return request(app.getHttpServer())
            .get('/comment/1111')
            .expect(HttpStatus.NOT_FOUND)
    });

    it('/comment (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/comment/1')
            .send({ body: 'Some body updated' } as CreateCommentDto)
            .expect(HttpStatus.UNAUTHORIZED)
    });

    it('/comment (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/comment/1')
            .send({ body: '' } as CreateCommentDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('/comment (PATCH)', async () => {
        return request(app.getHttpServer())
            .patch('/comment/1')
            .send({ body: commentNewBody } as UpdateCommentDto)
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.OK)
            .expect(({body}) => {
                console.debug(body);
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
            .expect(({body}) => {
                expect(body).toMatchObject({
                    id: 1,
                    body: commentNewBody,
                    userId: 1,
                    postId: 1,
                });
            });
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/qwerty')
            .expect(HttpStatus.UNAUTHORIZED)
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/qwerty')
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.BAD_REQUEST)
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/1111')
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.NOT_FOUND)
    });

    it('/comment/:id (DELETE)', async () => {
        return request(app.getHttpServer())
            .delete('/comment/1')
            .auth(accessToken, {type: "bearer"})
            .expect(HttpStatus.CREATED)
    });


    afterAll((done) => {
        app.close();
        done();
    });
});
