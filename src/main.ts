import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

class MyIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any): any {
    options = {
      ...options,
      cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
      },
    };
    return super.createIOServer(port, options);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useWebSocketAdapter(new MyIoAdapter(app));
  await app.listen(3000);
}
bootstrap();
