/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetModule } from 'src/meet/meet.module';
import { Position, PositionSchema } from './schemas/position.schema';
import { RoomGateway } from './room.gateway';

@Module({
  imports: [ 
    MeetModule, UserModule,
    MongooseModule.forFeature([//tabela nova de posicao
      { name: Position.name, schema: PositionSchema}
    ])
  ],
  providers: [RoomService, RoomGateway],
  controllers: [RoomController]
})
export class RoomModule {}
