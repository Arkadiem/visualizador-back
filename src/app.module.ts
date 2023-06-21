import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsController } from './controllers/products/products.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { WebsocketController } from './controllers/websocket/websocket.controller';
import { AppGateway } from './app/app.gateway';

@Module({
  imports: [],
  controllers: [
    AppController,
    ProductsController,
    CategoriesController,
    WebsocketController,
  ],
  providers: [AppService, AppGateway],
})
export class AppModule {}
