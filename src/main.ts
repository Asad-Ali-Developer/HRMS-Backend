import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { allowedHeaders, allowedOrigins } from './utils';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import { PrismaService } from './services';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: (origin: any, callback: any) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: allowedHeaders,
  });

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks(app);

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('HRMS - JV Lands')
    .setDescription('Created by: asadali.dev512@gmail.com')
    .setVersion('1.1')
    .addTag('NestJs')
    .addApiKey(
      { type: 'apiKey', in: 'header', name: 'x-admin-secret' },
      'x-admin-secret',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  // Initialize Passport
  app.use(passport.initialize());

  // Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Cookie parser and body parsers AFTER rate limiting
  app.use(cookieParser());
  app.use(json());
  app.use(urlencoded({ extended: true }));

  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
