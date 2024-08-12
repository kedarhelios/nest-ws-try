import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { OnModuleInit } from '@nestjs/common';
import * as SocketIORedis from 'socket.io-redis';

@WebSocketGateway(80, {
  namespace: 'chat',
  cors: {
    origin: '*',
  },
  // adapter: SocketIORedis({ host: 'localhost', port: 6379 }),
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  connectedClients: Set<string> = new Set();

  // async afterInit(server: Server) {
  //   // Create Redis clients for pub/sub
  //   // const pubClient = createClient({
  //   //   url: 'redis://localhost:6379',
  //   // });
  //   // const subClient = pubClient.duplicate();
  //   // await pubClient.connect();
  //   // await subClient.connect();
  //   // // Ensure the server is fully initialized before setting the adapter
  //   // this.server.adapter(createAdapter(pubClient, subClient));
  //   // console.log('Redis adapter is set up');
  //   // console.log('WebSocket Gateway Initialized');
  // }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.add(client.id);
  }

  @SubscribeMessage('message')
  handleMessage(client: Socket, message: string) {
    // Emit only to the client who sent the message
    console.log(`Message from client: ${client.id}, message: ${message}`);
    client.emit('reply', 'This is a message to the sender');

    // Broadcast to all connected clients across all instances
    this.server.emit('reply', 'Broadcasting to all clients');
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }
}
