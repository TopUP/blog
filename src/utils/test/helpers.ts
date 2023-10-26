import { TypeOrmModule } from '@nestjs/typeorm';
import * as process from 'process';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { ConfigModule } from '@nestjs/config';
import { getConnection } from 'typeorm';

export async function clearDB() {
    const entities = getConnection('default').entityMetadatas;
    for (const entity of entities) {
        const repository = getConnection('default').getRepository(entity.name);
        await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`);
    }
}

export const TypeORMTestingModule = (entities: any[]) => {
    ConfigModule.forRoot();

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
