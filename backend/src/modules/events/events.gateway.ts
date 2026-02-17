import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface SeatUpdatePayload {
  seatId: string;
  label: string;
  status: string;
  expiresAt?: string;
}

@WebSocketGateway({
  namespace: '/seats',
  cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger('WEBSOCKET');

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket): void {
    const userAgent = client.handshake.headers['user-agent'] || 'unknown';
    const address = client.handshake.address;
    const device = (client.handshake.query?.device as string) || 'unknown';

    this.logger.log(
      `Client connected: ${client.id} | device: ${device} | ip: ${address} | ua: ${userAgent}`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitSeatUpdate(payload: SeatUpdatePayload): void {
    this.server.emit('seat:updated', payload);
  }

  emitBulkSeatUpdate(payloads: SeatUpdatePayload[]): void {
    this.server.emit('seat:bulk-updated', payloads);
  }
}
