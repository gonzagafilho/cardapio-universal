import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { env } from './config/env/env';
import { getSwaggerConfig } from './config/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.setGlobalPrefix(env.apiPrefix);
  if (env.corsOrigins) {
    const origins = env.corsOrigins.split(',').map((o) => o.trim()).filter(Boolean);
    app.enableCors({ origin: origins, credentials: true });
  } else {
    app.enableCors();
  }
  const config = getSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${env.apiPrefix}/docs`, app, document);
  await app.listen(env.port);
  console.log(`Application running on: http://localhost:${env.port}/${env.apiPrefix}`);
  console.log(`Swagger: http://localhost:${env.port}/${env.apiPrefix}/docs`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
