import { BadRequestException } from '@nestjs/common';

export async function emailAlreadyExistsHandler(e) {
    if (
        /(email)[\s\S]+(already exists)/.test(e.detail) ||
        /(email)[\s\S]+(already exists)/.test(e.QueryFailedError) ||
        /(Duplicate entry)/.test(e.sqlMessage) ||
        /(Duplicate entry)/.test(e.QueryFailedError) ||
        e.code === 'ER_DUP_ENTRY' ||
        /(UNIQUE constraint failed)/.test(e.sqlMessage) ||
        /(UNIQUE constraint failed)/.test(e.QueryFailedError) ||
        /(UNIQUE)/.test(e.sqlMessage) ||
        /(UNIQUE)/.test(e.QueryFailedError) ||
        e.code === 'SQLITE_CONSTRAINT'
    ) {
        // throw new BadRequestException('Account with this email already exists.');
        throw new BadRequestException({
            message: ['Account with this email already exists.'],
            error: 'Bad Request',
            statusCode: 400,
        });
    }

    return;
}
