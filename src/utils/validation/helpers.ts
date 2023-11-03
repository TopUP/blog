import { HttpStatus } from '@nestjs/common';

export const notFoundExceptionBody = {
    error: 'Not Found',
    statusCode: HttpStatus.NOT_FOUND,
};

export const emailAlreadyExistsExceptionBody = {
    message: ['Account with this email already exists.'],
    error: 'Bad Request',
    statusCode: HttpStatus.BAD_REQUEST,
};

export const categoryHasPostsExceptionBody = {
    message: ['Category has posts.'],
    error: 'Bad Request',
    statusCode: HttpStatus.BAD_REQUEST,
};

export const categoryNotFoundExceptionBody = {
    message: ['Category not found'],
    error: 'Bad Request',
    statusCode: HttpStatus.BAD_REQUEST,
};
