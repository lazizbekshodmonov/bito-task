import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsDocsController } from './events-docs.controller';

@Module({
  controllers: [EventsDocsController],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
