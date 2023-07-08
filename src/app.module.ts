import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsController } from './controllers/products/products.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { SensorController } from './controllers/sensor/sensor.controller';
import { SensorService } from './controllers/sensor/sensor.service';
import { SensorGateway } from './controllers/sensor/sensor.gateway';

@Module({
  imports: [],
  controllers: [
    AppController,
    ProductsController,
    CategoriesController,
    SensorController,
  ],
  providers: [AppService, SensorService, SensorGateway],
})
export class AppModule {}
