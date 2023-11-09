import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
@ValidatorConstraint({ name: 'IsExistUserEmail', async: true })
export class IsExistUserEmailConstraint implements ValidatorConstraintInterface {
    constructor(private dataSource: DataSource) {}

    async validate(email: string, args: ValidationArguments) {
        if (!email) {
            return true;
        }

        const user = await this.dataSource.getRepository('User').findOne({
            where: {
                email: email,
            },
        });

        if (user?.email === email && args.targetName !== 'CreateUserDto') {
            return true;
        }

        return !user;
    }

    defaultMessage() {
        return 'Account with this email already exists.';
    }
}

export function IsExistUserEmail(entity?: string, validationOptions?: ValidationOptions): PropertyDecorator {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [entity],
            validator: IsExistUserEmailConstraint,
        });
    };
}
