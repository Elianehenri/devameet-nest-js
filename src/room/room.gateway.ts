/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/ban-types */
import {OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { RoomService } from './room.service';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JoinRoomDto } from './dtos/joinroom.dto';
import { UpdateUserPositionDto } from './dtos/updateposition.dto';
import { ToglMuteDto } from './dtos/toglMute.dto';
import { positionRoom } from './dtos/positionRoom.dto';

type ActiveSocketType = {
  // eslint-disable-next-line prettier/prettier
  room: String;
  id: string;
  userId: string;
}

@WebSocketGateway({ cors: true })
export class RoomGateway implements OnGatewayInit, OnGatewayDisconnect {

  constructor(private readonly service: RoomService) { }
  //trocar informçaoes para todo mundo
  @WebSocketServer() wss: Server;

  private logger = new Logger(RoomGateway.name);
  //guarda a lista de objetos que tem room, id, userId 
  private activeSockets: ActiveSocketType[] = [];

  // desconectar 
  async handleDisconnect(client: any) {
    const existingOnSocket = this.activeSockets.find(
      socket => socket.id === client.id//
    );

    if (!existingOnSocket) return;

    this.activeSockets = this.activeSockets.filter(
      socket => socket.id !== client.id,//
    );

    const dto = {
      link: existingOnSocket.room,
      userId: existingOnSocket.userId,
      positionRoom: false,
    } as positionRoom;

    await this.service.deleteUsersPosition(client.id, dto);

    client.broadcast.emit(`${existingOnSocket.room}-remove-user`, { socketId: client.id });

    this.logger.debug(`Client: ${client.id} disconnected`);

  }
  //o gateway subiu
  afterInit(server: any) {
    this.logger.log('Gateway initialized');
  }

  //passar qual usuario e sala
  @SubscribeMessage('join')
  async handleJoin(client: Socket, payload: JoinRoomDto) {
    const { link, userId } = payload;

    //ver o usuario esta conectado
    const existingOnSocket = this.activeSockets.find(
      socket => socket.room === link && socket.id === client.id );
    //se nao tem o usuario na memoria, criar
    if (!existingOnSocket) {
      this.activeSockets.push({ room: link, id: client.id, userId });//criar participante
      const previousPosition = await this.service.findPositionUser( link, userId );
      
      //criar posiçao na sala, sem a posiçao de cada usuario ser a mesma

      let x = 2;
      let y = 2;
      if (previousPosition.length > 0) {
        x = previousPosition[0].x;
        y = previousPosition[0].y;
      }

      const dto = {
        link,
        userId,
        x,
        y,
        orientation: 'front',
        positionRoom: true,
      } as UpdateUserPositionDto;

      await this.service.updateUserPosition(client.id, dto);

      //pegar a lista de usuarios atualizada
      const users = await this.service.listUsersPositionByLink(link);

      //enviar para todos os usuarios -websockt em açao
      this.wss.emit(`${link}-update-user-list`, { users });

      //enviar para todos os usuarios -websockt em açao
      client.broadcast.emit(`${link}-add-user`, { user: client.id });//usuario adicionado e falando para as outras que o usuario conectou
      
      
    }
    this.logger.debug(`Socket client: ${client.id} start to join room ${link}`);
  }
  // acao de andar na sala
  @SubscribeMessage('move')
  async handleMove(client: Socket, payload: UpdateUserPositionDto) {
    const { link, userId, x, y, orientation } = payload;

    const dto = {
      link,
      userId,
      x,
      y,
      orientation
    } as UpdateUserPositionDto;

    await this.service.updateUserPosition(client.id, dto);//atualizar movimento
    const users = await this.service.listUsersPositionByLink(link);//enviar pra todos nova atualizaçao de movimento
    this.wss.emit(`${link}-update-user-list`, { users });
  }
  // acao de mutar
  @SubscribeMessage('toggl-mute-user')
  async handleToglMute(_: Socket, payload: ToglMuteDto) {
    const { link } = payload;
    await this.service.updateUserMute(payload);
    const users = await this.service.listUsersPositionByLink(link);//enviar pra todos nova atualizaçao
    this.wss.emit(`${link}-update-user-list`, { users });
  }

  //fazendo ligacao
  @SubscribeMessage('call-user')
  async callUser(client: Socket, data: any) {
    this.logger.debug(`callUser: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('call-made', {
      offer: data.offer,
      socket: client.id
    });
  }
  //resposta da chamada
  @SubscribeMessage('make-answer')
  async makeAnswer(client: Socket, data: any) {
    this.logger.debug(`makeAnswer: ${client.id} to: ${data.to}`);
    client.to(data.to).emit('answer-made', {
      answer: data.answer,
      socket: client.id
    });
  }

}
