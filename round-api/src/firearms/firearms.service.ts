import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Firearm, FirearmDocument } from './firearm.schema';
import { CreateFirearmDto } from './dto/create-firearm.dto';
import { UpdateFirearmDto } from './dto/update-firearm.dto';

@Injectable()
export class FirearmsService {
  constructor(
    @InjectModel(Firearm.name) private firearmModel: Model<FirearmDocument>,
  ) {}

  findAll(userId: string) {
    return this.firearmModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOne(id: string, userId: string) {
    const firearm = await this.firearmModel.findById(id).exec();
    if (!firearm) throw new NotFoundException('Firearm not found');
    if (firearm.userId.toString() !== userId) throw new ForbiddenException();
    return firearm;
  }

  create(userId: string, dto: CreateFirearmDto) {
    return this.firearmModel.create({
      ...dto,
      userId: new Types.ObjectId(userId),
      totalRounds: 0,
    });
  }

  async update(id: string, userId: string, dto: UpdateFirearmDto) {
    await this.findOne(id, userId);
    return this.firearmModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.firearmModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
