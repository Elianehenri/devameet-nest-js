/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { UserModule } from 'src/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetModule } from 'src/meet/meet.module';
import { Position, PositionSchema } from './schemas/position.schema';

@Module({
  imports: [ 
    MeetModule, UserModule,
    MongooseModule.forFeature([
      { name: Position.name, schema: PositionSchema}
    ])
  ],
  providers: [RoomService],
  controllers: [RoomController]
})
export class RoomModule {}