import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  // `rawBody: true` exposes the unparsed request body on `req.rawBody`,
  // required to verify the Lemon Squeezy webhook HMAC signature.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('FeedZony API')
    .setDescription('FeedZony backend REST API — Phase 2: Services management')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // Apply Bearer auth to every operation that has a security requirement
  Object.values(document.paths).forEach((path: any) => {
    Object.values(path).forEach((operation: any) => {
      if (!operation.security) {
        operation.security = [{ 'access-token': [] }];
      }
    });
  });
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
