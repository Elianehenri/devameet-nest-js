/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guards';
import { MeetModule } from './meet/meet.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    ConfigModule.forRoot(),//configuraçao da env
    MongooseModule.forRoot(process.env.DATABASE_URL),//conectar no banco mongo
    AuthModule,
    UserModule,
    MeetModule,
    RoomModule
  ],
  controllers: [],
  providers: [
   {provide: APP_GUARD, useClass: JwtAuthGuard}//blindar sistema
  ],
})
export class AppModule {}
