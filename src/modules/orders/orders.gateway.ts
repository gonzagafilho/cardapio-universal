import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';

export const ORDER_EVENTS = {
  CREATED: 'order.created',
  CONFIRMED: 'order.confirmed',
  STATUS_CHANGED: 'order.status_changed',
} as const;

const ROOM_PREFIX = 'establishment:';

@WebSocketGateway({ cors: true })
export class OrdersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OrdersGateway.name);

  @WebSocketServer()
  server!: Server;

  handleConnection(): void {
    this.logger.debug('Client connected');
  }

  handleDisconnect(): void {
    this.logger.debug('Client disconnected');
  }

  /**
   * Cliente envia { establishmentId } para receber eventos do estabelecimento.
   */
  @SubscribeMessage('subscribe')
  handleSubscribe(
    client: { join: (room: string) => void },
    payload: { establishmentId?: string },
  ): void {
    const id = payload?.establishmentId?.trim();
    if (!id) return;
    const room = ROOM_PREFIX + id;
    client.join(room);
    this.logger.debug(`Client joined room ${room}`);
  }

  /**
   * Emite evento para todos os clientes inscritos no establishment.
   * Usado por OrdersService e PaymentsService.
   */
  emitToEstablishment(
    establishmentId: string,
    event: string,
    data: { orderId: string; [k: string]: unknown },
  ): void {
    const room = ROOM_PREFIX + establishmentId;
    this.server.to(room).emit(event, data);
    this.logger.debug(`Emitted ${event} to ${room}`);
  }
}
