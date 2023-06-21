import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';

@WebSocketGateway(3220)
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger: Logger = new Logger('AppGateway');

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    this.logger.log(
      `Message received from ${client.id}: ${JSON.stringify(payload)}`,
    );
    this.savePayloadToFile(payload);
  }

  savePayloadToFile(payload: any) {
    fs.appendFile('data.json', JSON.stringify(payload), (err) => {
      if (err) {
        return this.logger.error(`Failed to write to file: ${err}`);
      }
      this.logger.log('Payload added to file');
    });
  }
}
