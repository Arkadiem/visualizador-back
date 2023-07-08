import { Controller, Get, Post, Body } from '@nestjs/common';
import { SensorService } from './sensor.service';

@Controller('sensor')
export class SensorController {
  constructor(private sensorService: SensorService) {}

  @Get('sensorsdata')
  getSensorData() {
    return this.sensorService.getSensorData();
  }
  @Post('typeprocess')
  initProcessSensor(@Body() body: { process: string }) {
    return this.sensorService.initProcessSensor(body.process);
  }
  @Get('latestsensordata')
  GetLatestSensorData() {
    return this.sensorService.getLatestSensorData();
  }
}
