/* eslint-disable prettier/prettier */
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

//objeto relacioanl ,o que vai mapear a nossa tabela
@Schema()
export class User {
    @Prop({required: true})
    name:string;

    @Prop({required: true})
    email:string;

    @Prop({required: true})
    password:string;

    @Prop()
    avatar:string;
}

export const UserSchema = SchemaFactory.createForClass(User);
