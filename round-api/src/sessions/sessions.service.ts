import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Session, SessionDocument } from './session.schema';
import { Firearm, FirearmDocument } from '../firearms/firearm.schema';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Firearm.name) private firearmModel: Model<FirearmDocument>,
  ) {}

  findAll(userId: string, firearmId?: string, limit = 20, offset = 0) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (firearmId) query.firearmId = new Types.ObjectId(firearmId);
    return this.sessionModel
      .find(query)
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit)
      .populate('firearmId', 'name make model caliber')
      .exec();
  }

  async findOne(id: string, userId: string) {
    const session = await this.sessionModel.findById(id).populate('firearmId').exec();
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId.toString() !== userId) throw new ForbiddenException();
    return session;
  }

  async create(userId: string, dto: CreateSessionDto) {
    // Verify firearm ownership
    const firearm = await this.firearmModel.findById(dto.firearmId).exec();
    if (!firearm) throw new NotFoundException('Firearm not found');
    if (firearm.userId.toString() !== userId) throw new ForbiddenException();

    // Create session
    const session = await this.sessionModel.create({
      userId: new Types.ObjectId(userId),
      firearmId: new Types.ObjectId(dto.firearmId),
      date: new Date(dto.date),
      roundsFired: dto.roundsFired,
      location: dto.location ?? null,
      notes: dto.notes ?? null,
    });

    // Atomically increment totalRounds on the firearm
    await this.firearmModel
      .findByIdAndUpdate(dto.firearmId, { $inc: { totalRounds: dto.roundsFired } })
      .exec();

    return session;
  }

  async remove(id: string, userId: string) {
    const session = await this.findOne(id, userId);

    // Atomically decrement totalRounds (floor at 0)
    const firearm = await this.firearmModel.findById(session.firearmId).exec();
    if (firearm) {
      const decrement = Math.min(session.roundsFired, firearm.totalRounds);
      await this.firearmModel
        .findByIdAndUpdate(session.firearmId, { $inc: { totalRounds: -decrement } })
        .exec();
    }

    await this.sessionModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
