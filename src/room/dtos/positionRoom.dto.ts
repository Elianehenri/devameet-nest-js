/* eslint-disable prettier/prettier */
import { IsBoolean } from 'class-validator';
import { JoinRoomDto } from "./joinRoom.dto";
import { RoomMessagesHelper } from '../helpers/roommesages.helper';

export class positionRoom extends JoinRoomDto{
    @IsBoolean({ message: RoomMessagesHelper.POSITION_ROOM_NOT_VALID })
    positionRoom: boolean;
}
