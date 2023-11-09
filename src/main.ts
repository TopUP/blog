import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { EntityNotFoundExceptionFilter } from './utils/filters/entity-not-found-exception.filter';
import { useContainer } from 'class-validator';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Blog')
        .setDescription('Blog')
        .setVersion('0.0.1')
        .addBearerAuth()
        .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new EntityNotFoundExceptionFilter());

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    await app.listen(3000);

    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
