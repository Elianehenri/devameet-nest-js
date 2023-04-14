/* eslint-disable prettier/prettier */
import {Controller, Get, Request, BadRequestException, HttpStatus, HttpCode, Body, Put} from '@nestjs/common';
import { UserMessagesHelper } from './helpers/messages.helper';
import { UserService } from './user.service';
import { UpdateUserDto } from './dtos/updatuser.dto';

@Controller('user')
export class UserController{
    constructor(private readonly userSerice:UserService){}

    @Get()
    async getUser(@Request() req){
        const {userId} = req?.user;
        const user = await this.userSerice.getUserById(userId);

        if(!user){
            throw new BadRequestException(UserMessagesHelper.GET_USER_NOT_FOUND);
        }

        return {
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            id: user._id
        }
    }
    
    @Put()
    @HttpCode(HttpStatus.OK)
    async updateUser(@Request() req, @Body() dto: UpdateUserDto){
        const {userId} = req?.user;
        await this.userSerice.updateUser(userId, dto);
    }
}
