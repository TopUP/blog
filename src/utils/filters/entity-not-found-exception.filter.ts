import { Catch, ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Response } from 'express';
import { notFoundExceptionBody } from '../validation/helpers';

/**
 * Custom exception filter to convert EntityNotFoundError from TypeOrm to NestJs responses
 * @see also @https://docs.nestjs.com/exception-filters
 */
@Catch(EntityNotFoundError)
export class EntityNotFoundExceptionFilter implements ExceptionFilter {
    public catch(exception: EntityNotFoundError, host: ArgumentsHost) {
        const response = host.switchToHttp().getResponse<Response>();

        return response.status(404).json(notFoundExceptionBody);
    }
}
