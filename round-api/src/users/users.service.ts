import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    return this.userModel
      .findById(userId)
      .select('-passwordHash -refreshToken')
      .exec();
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const update: Partial<User> = {};
    if (dto.displayName) update.displayName = dto.displayName;
    if (dto.password) update.passwordHash = await bcrypt.hash(dto.password, 12);

    return this.userModel
      .findByIdAndUpdate(userId, update, { new: true })
      .select('-passwordHash -refreshToken')
      .exec();
  }
}
