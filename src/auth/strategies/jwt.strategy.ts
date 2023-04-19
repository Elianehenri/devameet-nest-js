/* eslint-disable prettier/prettier */
import {Injectable} from '@nestjs/common'
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt} from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(){
        super({//construtor pai
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: true,
            secretOrKey: process.env.USER_JWT_SECRET_KEY,//vem da .env
        });
    }

    //valicaçao
    async validate(payload:any){
        return {userId: payload.sub, email: payload.email};
    }
}
