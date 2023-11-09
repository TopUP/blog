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
import { CreatePostDto } from '../src/post/dto/create-post.dto';
import { CreateCategoryDto } from '../src/category/dto/create-category.dto';
import { EntityNotFoundExceptionFilter } from '../src/utils/filters/entity-not-found-exception.filter';
import { categoryNotFoundExceptionBody, notFoundExceptionBody } from '../src/utils/validation/helpers';
import { useContainer } from 'class-validator';

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

describe('PostController (e2e) Post exceptions', () => {
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
        useContainer(moduleFixture, { fallbackOnErrors: true });

        await app.init();
    });

    it('/post (GET)', () => {
        return request(app.getHttpServer()).get('/post').expect(HttpStatus.OK).expect([]);
    });

    it('/post/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/post/' + 'qwerty')
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)');
            });
    });

    it('/post/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/post/1')
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });
    });

    it('/post (POST)', async () => {
        accessToken = await registerTestUser(app, adminUser);
        return request(app.getHttpServer())
            .post('/post')
            .expect(HttpStatus.UNAUTHORIZED)
            .expect(({ body }) => {
                expect(body.message).toMatch('Unauthorized');
                expect(body.statusCode).toEqual(HttpStatus.UNAUTHORIZED);
            });
    });

    it('/post (POST)', async () => {
        return request(app.getHttpServer())
            .post('/post')
            .send({
                categoryId: null,
                title: '',
                body: '',
            } as CreatePostDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(HttpStatus.BAD_REQUEST);
            });
    });

    it('/post (POST)', async () => {
        return request(app.getHttpServer())
            .post('/post')
            .send({
                categoryId: 1,
                title: 'Some title',
                body: 'Some body',
            } as CreatePostDto)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body).toMatchObject(categoryNotFoundExceptionBody);
            });
    });

    afterAll((done) => {
        app.close();
        done();
    });
});

describe('PostController (e2e) Post life cycle', () => {
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
    const examplePost = {
        id: 1,
        userId: 1,
        categoryId: 1,
        title: 'Post title',
        body: 'Post body',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule(testingModuleMetadata).compile();

        app = moduleFixture.createNestApplication();

        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalFilters(new EntityNotFoundExceptionFilter());
        useContainer(moduleFixture, { fallbackOnErrors: true });

        await app.init();
    });

    it('/post (POST|GET|PATCH|DELETE) ', async () => {
        const accessToken = await registerTestUser(app, adminUser);

        const categories = [];
        for (let i = 1; i <= 2; i++) {
            const categoryCreateReq = await request(app.getHttpServer())
                .post('/category')
                .auth(accessToken, { type: 'bearer' })
                .send({ title: `Post category ${i}` } as CreateCategoryDto);
            categories.push(categoryCreateReq.body);
        }

        const expectedPost = {
            user: {
                id: adminUser.id,
                full_name: adminUser.full_name,
                email: adminUser.email,
            },
            category: categories[0],
            title: examplePost.title,
            body: examplePost.body,
        };

        const createPostReq = await request(app.getHttpServer())
            .post('/post')
            .auth(accessToken, { type: 'bearer' })
            .send({
                categoryId: categories[0].id,
                title: 'Post title',
                body: 'Post body',
            } as CreatePostDto)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toMatchObject(expectedPost);
            });
        const createdPost = await createPostReq.body;
        const getOnePostReq = await request(app.getHttpServer())
            .get('/post/' + createdPost.id)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toMatchObject(expectedPost);
            });
        const post = getOnePostReq.body;

        await request(app.getHttpServer())
            .patch('/post/' + post.id)
            .auth(accessToken, { type: 'bearer' })
            .send({
                categoryId: 999,
            } as CreatePostDto)
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({ body }) => {
                expect(body).toMatchObject(categoryNotFoundExceptionBody);
            });

        const newCategory: Category = categories[1];
        const newTitle: string = 'New Post Title';
        const newBody: string = 'New Post Body';
        const updatePostReq = await request(app.getHttpServer())
            .patch('/post/' + post.id)
            .auth(accessToken, { type: 'bearer' })
            .send({
                categoryId: newCategory.id,
                title: newTitle,
                body: newBody,
            } as CreatePostDto)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toMatchObject({
                    title: newTitle,
                    body: newBody,
                    category: newCategory,
                    id: post.id,
                });
            });

        let updatedPost = updatePostReq.body;
        expectedPost.category = newCategory;
        expectedPost.title = newTitle;
        expectedPost.body = newBody;
        const getUpdatedPostReq = await request(app.getHttpServer())
            .get('/post/' + updatedPost.id)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toMatchObject(expectedPost);
            });

        const secondAccessToken = await registerTestUser(app, exampleUser);
        request(app.getHttpServer())
            .patch('/post/' + post.id)
            .auth(secondAccessToken, { type: 'bearer' })
            .send({
                title: newTitle,
                body: newBody,
            } as CreatePostDto)
            .expect(HttpStatus.FORBIDDEN);

        updatedPost = getUpdatedPostReq.body;

        request(app.getHttpServer())
            .delete('/post/' + 99999)
            .expect(HttpStatus.UNAUTHORIZED);

        request(app.getHttpServer())
            .delete('/post/' + 99999)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.NOT_FOUND)
            .expect(({ body }) => {
                expect(body).toMatchObject(notFoundExceptionBody);
            });

        request(app.getHttpServer())
            .delete('/post/' + updatedPost.id)
            .auth(secondAccessToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

        request(app.getHttpServer())
            .delete('/post/' + updatedPost.id)
            .auth(accessToken, { type: 'bearer' })
            .expect(HttpStatus.CREATED);

        request(app.getHttpServer())
            .delete('/post/' + 'qwerty')
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
