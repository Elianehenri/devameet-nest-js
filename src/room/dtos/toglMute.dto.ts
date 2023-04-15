/* eslint-disable prettier/prettier */
import { IsBoolean } from "class-validator";
import { JoinRoomDto } from "./joinroom.dto";
import { RoomMessagesHelper } from "../helpers/roommesages.helper";

export class ToglMuteDto extends JoinRoomDto{   

    @IsBoolean({message: RoomMessagesHelper.MUTE_NOT_VALID})
    muted: boolean;
}
