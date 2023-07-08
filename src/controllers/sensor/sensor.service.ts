import { Injectable } from '@nestjs/common';
import { SensorGateway } from './sensor.gateway';
import * as WebSocket from 'ws';
import { MongoClient } from 'mongodb';

@Injectable()
export class SensorService {
  private socket: WebSocket;
  private sensorData = [];
  private angleData = [];
  private collectionName = 'sensorData'; // Nombre de la colección en MongoDB
  // Agrega un contador para llevar la cuenta de cuántos objetos de datos se han guardado
  private objectCount = 0;
  private client: MongoClient;
  private db: any;

  constructor(private sensorGateway: SensorGateway) {
    this.initMongoDB();
    this.socket = new WebSocket('ws://192.168.100.135:3200/');
    this.socket.on('open', () => {
      console.log('Connected to server');
    });
    this.socket.on('connect', () => {
      console.log('Connected to ESP32 WebSocket server');
    });
    this.socket.on('error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    this.socket.on('message', (data) => {
      const messageStr = data.toString();

      let message;
      try {
        message = JSON.parse(messageStr);
      } catch (e) {
        console.log('Received non-JSON message:', messageStr);
        return;
      }

      console.log('Received data:', message);

      // Calcular el ángulo basado en el índice del dato
      const angle = this.sensorData.length;

      // Agregar el ángulo al objeto de mensaje
      message.angle = angle;

      this.angleData.push(message.angle);
      // Crear un objeto que incluya tanto la distancia como el ángulo
      const dataPoint = { angle: angle, distance: message.distance };

      // Almacenar el objeto en el array sensorData en lugar de solo la distancia
      this.sensorData.push(dataPoint);

      // Check if the array length reaches 20
      if (this.sensorData.length === 360) {
        // Create a new object with the sensor data
        const sensorObject = { data: this.sensorData, angles: this.angleData };

        // Save the object to MongoDB
        this.saveSensorData(sensorObject);

        this.sensorGateway.updateClients(this.sensorData);
        // Clear the sensorData array
        this.sensorData = [];
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from ESP32 WebSocket server');
    });
  }

  async initMongoDB() {
    try {
      this.client = await MongoClient.connect('mongodb://172.17.0.2:27017');
      this.db = this.client.db('sensordata');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  }

  async saveSensorData(sensorObject: any) {
    try {
      const collection = this.db.collection(this.collectionName);

      // Increment the counter and use its value to generate the object name
      this.objectCount++;
      const objectName = 'objeto_' + this.objectCount;

      // Create a new sensor object with the changed structure
      const namedSensorObject = {
        nombre: objectName,
        datos: sensorObject.data, // 'data' is now an array of objects with 'angle' and 'distance'
        createdAt: new Date(), // add a timestamp
      };

      await collection.insertOne(namedSensorObject);
      console.log('Sensor data saved to MongoDB');
    } catch (error) {
      console.log('Error saving sensor data:', error);
    }
  }

  async getSensorData() {
    let data = [];
    try {
      const collection = this.db.collection(this.collectionName);

      // Find all documents in the collection and convert them to an array
      data = await collection.find().toArray();
    } catch (error) {
      console.log('Error getting sensor data:', error);
    }

    return {
      data: data,
    };
  }

  initProcessSensor(process: string) {
    try {
      // Comprueba si la conexión WebSocket está abierta antes de intentar enviar el mensaje
      if (this.socket.readyState === WebSocket.OPEN) {
        // Envía el mensaje al servidor WebSocket
        this.socket.send(process);
      } else {
        console.error('Cannot send message, WebSocket is not open');
      }
    } catch (error) {
      console.error('Error sending message to WebSocket:', error);
    }

    return {
      process: process,
    };
  }

  async getLatestSensorData() {
    let latestData;
    try {
      const collection = this.db.collection(this.collectionName);

      // Find the latest document in the collection
      latestData = await collection
        .find()
        .sort({ createdAt: -1 })
        .limit(1)
        .toArray();
    } catch (error) {
      console.log('Error getting sensor data:', error);
    }

    return {
      data: latestData,
    };
  }
}
