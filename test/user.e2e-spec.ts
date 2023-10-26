import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeORMTestingModule } from 'src/utils/test/helpers';
import { User }                 from 'src/user/entities/user.entity';
import { UserModule }           from 'src/user/user.module';
import { CreateUserDto }        from 'src/user/dto/create-user.dto';

describe('UserController (e2e)', () => {
    let app: INestApplication;
    const exampleUser = {
        id: 1,
        full_name: 'Full Name',
        email: 'email@email.net',
        password: 'qwerty',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [TypeORMTestingModule([User]), UserModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({whitelist: true, transform: true,}));
        await app.init();
    });

    it('/user (GET)', () => {
        return request(app.getHttpServer())
            .get('/user')
            .expect(HttpStatus.OK)
            .expect([]);
    });

    it('/user/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/user/' + 'qwerty')
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)')
            })
    });

    it('/user/:id (GET)', () => {
        return request(app.getHttpServer())
            .get('/user/1')
            .expect(HttpStatus.NOT_FOUND)
            .expect('');
    });

    it('/user (POST)', () => {
        return request(app.getHttpServer())
            .post('/user')
            .send({
                full_name: '',
                email: '',
                password: '',
            })
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual(expect.any(Array));
                expect(body.statusCode).toEqual(400);
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
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toEqual([ 'email must be an email' ] );
                expect(body.statusCode).toEqual(400);
            });
    });

    let updatedUser;
    it('/user (POST|PATCH) ', async () => {
        const createUserReq = await request(app.getHttpServer())
            .post('/user')
            .send(exampleUser as CreateUserDto)
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body).toMatchObject(exampleUser);
            });

        const createdUser = await createUserReq.body;
        const getOneUserReq = await request(app.getHttpServer())
            .get('/user/' + createdUser.id)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toMatchObject(exampleUser);
            });

        const user = getOneUserReq.body
        await request(app.getHttpServer())
            .patch('/user/' + user.id)
            .send({
                email: 'email'
            })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
                expect(res.body.message).toEqual([ 'email must be an email' ]);
            });

        const newFullName: string = 'New Full Name';
        const newEmail: string = 'newEmail@email.new';
        const updateUserReq = await request(app.getHttpServer())
            .patch('/user/' + user.id)
            .send({
                full_name: newFullName,
                email: newEmail,
            })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.full_name).toMatch(newFullName);
            });

        updatedUser = updateUserReq.body;
        const getUpdatedUserReq = await request(app.getHttpServer())
            .get('/user/' + updatedUser.id)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body).toEqual({
                    id: 1,
                    full_name: newFullName,
                    email: newEmail,
                    password: 'qwerty',
                });
            });

        updatedUser = getUpdatedUserReq.body;

        return getUpdatedUserReq;
    });

    it('/user (POST)', () => {
        return request(app.getHttpServer())
            .post('/user')
            .send(updatedUser as CreateUserDto)
            // .expect(HttpStatus.BAD_REQUEST)
            .expect(({status, body}) => {
                console.log(status, body)
                expect(body.message).toMatch('Account with this email already exists.');
            });
    });

    it('/user (DELETE)', () => {
        return request(app.getHttpServer())
            .delete('/user/' + 99999)
            .send(updatedUser as CreateUserDto)
            .expect(HttpStatus.NOT_FOUND)
    });

    it('/user (DELETE)', () => {
        return request(app.getHttpServer())
            .delete('/user/' + updatedUser.id)
            .send(updatedUser as CreateUserDto)
            .expect(HttpStatus.CREATED)
    });

    it('/user (DELETE)', () => {
        return request(app.getHttpServer())
            .delete('/user/' + 'qwerty')
            .send(updatedUser as CreateUserDto)
            .expect(HttpStatus.BAD_REQUEST)
            .expect(({body}) => {
                expect(body.message).toMatch('Validation failed (numeric string is expected)')
            })
    });


    afterAll((done) => {
        app.close();
        done();
    });
});
