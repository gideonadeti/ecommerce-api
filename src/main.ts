import * as cookieParser from 'cookie-parser';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('E-Commerce API')
    .setDescription('An API for an e-commerce platform')
    .setVersion('1.0.0')
    .addTag('users', 'User related endpoints')
    .addTag('auth', 'Authentication related endpoints')
    .addTag('products', 'Product related endpoints')
    .addTag('cart-items', 'Cart item related endpoints')
    .addBearerAuth()
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (_controllerKey: string, methodKey: string) =>
      methodKey,
  };

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('api/documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
