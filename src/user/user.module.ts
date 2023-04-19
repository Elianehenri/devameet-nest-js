/* eslint-disable prettier/prettier */
import {Module} from '@nestjs/common'
import {MongooseModule} from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schema'
import { UserService } from './user.service'
import { UserController } from './user.controller'

@Module({
    imports: 
    [MongooseModule.forFeature([{name: User.name, schema: UserSchema}])],//criar tabela que preciso neste module
    controllers: [UserController],
    providers: [UserService],
    exports: [MongooseModule, UserService]//expertar pra que alguem possa usar 
})
export class UserModule{}
