/* eslint-disable prettier/prettier */
import { IsNotEmpty } from "class-validator";
import { RoomMessagesHelper } from "../helpers/roommesages.helper";

//entrar na sala
export class JoinRoomDto{    
    @IsNotEmpty({message: RoomMessagesHelper.JOIN_USER_NOT_VALID})
    userId: string;

    @IsNotEmpty({message: RoomMessagesHelper.JOIN_LINK_NOT_VALID})
    link: string;
}
