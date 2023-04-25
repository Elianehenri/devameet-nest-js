/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meet, MeetDocument } from 'src/meet/schemas/meet.schema';
import { MeetObject, MeetObjectDocument } from 'src/meet/schemas/meetobject.schema';
import { UserService } from 'src/user/user.service';
import { ToglMuteDto } from './dtos/toglMute.dto';
import { UpdateUserPositionDto } from './dtos/updateposition.dto';
import { Position, PositionDocument } from './schemas/position.schema';
import { RoomMessagesHelper } from './helpers/roommesages.helper';
import { positionRoom } from './dtos/positionRoom.dto';

@Injectable()
export class RoomService {
    private logger = new Logger(RoomService.name);

    constructor(
        @InjectModel(Meet.name) private readonly meetModel: Model<MeetDocument>,
        @InjectModel(MeetObject.name) private readonly objectModel: Model<MeetObjectDocument>,
        @InjectModel(Position.name) private readonly positionModel: Model<PositionDocument>,
        private readonly userService: UserService
    ) { }
    //listar objetos da sala
    async getRoom(link: string) {
        this.logger.debug(`getRoom - ${link}`);

        const meet = await this._getMeet(link);
        const objects = await this.objectModel.find({ meet });

        return {
            link,
            name: meet.name,
            color: meet.color,
            objects
        };
    }
    //listar posicao de cada um na sala
    async listUsersPositionByLink(link: string) {
        this.logger.debug(`listUsersPositionByLink - ${link}`);

        const meet = await this._getMeet(link);
        return await this.positionModel.find({ meet: meet, positionRoom: true });
    }
    //deletar o usuario 
    async deleteUsersPosition(clientId: string, dto: positionRoom) {
       this.logger.debug(`deleteUsersPosition - ${clientId}`);

        const meet = await this._getMeet(dto.link);
        const user = await this.userService.getUserById(dto.userId);
     
        
        if (!user) {
            throw new  BadRequestException(RoomMessagesHelper.JOIN_USER_NOT_VALID);
        }

        const positionActual = {
            ...dto,
            clientId,
            user,
            meet,
            name: user.name,
            avatar: user.avatar,
        };
      
        const position = await this.positionModel.find({
            user: user._id,
            meet: meet._id,
        });

        return await this.positionModel.findByIdAndUpdate( position[0]._id, positionActual );
    }

    async updateUserPosition(clientId: string, dto: UpdateUserPositionDto) {
        this.logger.debug(`listUsersPositionByLink - ${dto.link}`);

        const meet = await this._getMeet(dto.link);
        const user = await this.userService.getUserById(dto.userId);

        if (!user) {
            throw new BadRequestException(RoomMessagesHelper.JOIN_USER_NOT_VALID);
        }

        const position = {
            ...dto,
            clientId,
            user,
            meet,
            name: user.name,
            avatar: user.avatar,
        };

        const usersInRoom = await this.positionModel.find({ meet });
        const loogedUserInRoom = usersInRoom.find(u =>
            u.user.toString() === user._id.toString() || u.clientId === clientId);

        if (loogedUserInRoom) {
            await this.positionModel.findByIdAndUpdate({ _id: loogedUserInRoom._id }, position);
        } else {
            if (usersInRoom && usersInRoom.length > 10) {
                throw new BadRequestException(RoomMessagesHelper.ROOM_MAX_USERS);
            };

            await this.positionModel.create(position);
        }
    }

    async updateUserMute(dto: ToglMuteDto) {
        this.logger.debug(`updateUserMute - ${dto.link} - ${dto.userId}`);

        const meet = await this._getMeet(dto.link);
        const user = await this.userService.getUserById(dto.userId);
        await this.positionModel.updateMany({ user, meet }, { muted: dto.muted });
    }

    async _getMeet(link: string) {
        const meet = await this.meetModel.findOne({ link });
        if (!meet) {
            throw new BadRequestException(RoomMessagesHelper.JOIN_LINK_NOT_VALID);
        }

        return meet;
    }
    
    async findPositionUser(link: string, userId: string) {
        const meet = await this.meetModel.findOne({ link });

        return await this.positionModel.find({ meet: meet._id, user: userId });
    }
}
