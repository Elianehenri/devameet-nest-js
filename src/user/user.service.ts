/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RegisterDto } from './dtos/register.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as CryptoJS from 'crypto-js';
import { UpdateUserDto } from './dtos/updatuser.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,//userDocuemnt vem de schema
  ) { }

  async create(dto: RegisterDto) {
    dto.password = CryptoJS.AES.encrypt(
      dto.password,
      process.env.USER_CYPHER_SECRET_KEY,
    ).toString();

    const createdUser = new this.userModel(dto);
    await createdUser.save();
  }

  async existsByEmail(email: string): Promise<boolean> {
    const result = await this.userModel.findOne({ email });

    if (result) {
      return true;
    }

    return false;
  }

  // metodo
  async getUserByLoginPassword(email: string, password: string): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ email }) as UserDocument;//ver se o ususario existe

    if (user) {
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.USER_CYPHER_SECRET_KEY);//descriptograr senha
      const savedPassword = bytes.toString(CryptoJS.enc.Utf8);

      if (password == savedPassword) {
        return user;
      }
    }

    return null;
  }

  //usuario por id
  async getUserById(id: string) {
    return await this.userModel.findById(id);
  }

  //atualiar os dados
  async updateUser(id: string, dto: UpdateUserDto) {
    return await this.userModel.findByIdAndUpdate(id, dto);
  }
}
