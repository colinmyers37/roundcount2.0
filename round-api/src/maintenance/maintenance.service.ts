import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MaintenanceTask, MaintenanceTaskDocument } from './maintenance-task.schema';
import { Firearm, FirearmDocument } from '../firearms/firearm.schema';
import { CreateMaintenanceTaskDto } from './dto/create-maintenance-task.dto';
import { UpdateMaintenanceTaskDto } from './dto/update-maintenance-task.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectModel(MaintenanceTask.name)
    private taskModel: Model<MaintenanceTaskDocument>,
    @InjectModel(Firearm.name) private firearmModel: Model<FirearmDocument>,
  ) {}

  async findAll(userId: string, firearmId?: string) {
    const query: any = { userId: new Types.ObjectId(userId) };
    if (firearmId) query.firearmId = new Types.ObjectId(firearmId);

    const tasks = await this.taskModel.find(query).exec();
    // Enrich with isOverdue by comparing nextDueAtRounds vs firearm.totalRounds
    const firearmIds = [...new Set(tasks.map((t) => t.firearmId.toString()))];
    const firearms = await this.firearmModel
      .find({ _id: { $in: firearmIds } })
      .select('_id totalRounds')
      .exec();
    const roundMap = new Map(firearms.map((f) => [f._id.toString(), f.totalRounds]));

    return tasks.map((task) => {
      const totalRounds = roundMap.get(task.firearmId.toString()) ?? 0;
      return {
        ...task.toObject(),
        isOverdue: totalRounds >= task.nextDueAtRounds,
        roundsRemaining: Math.max(0, task.nextDueAtRounds - totalRounds),
      };
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Maintenance task not found');
    if (task.userId.toString() !== userId) throw new ForbiddenException();
    return task;
  }

  async create(userId: string, dto: CreateMaintenanceTaskDto) {
    const firearm = await this.firearmModel.findById(dto.firearmId).exec();
    if (!firearm) throw new NotFoundException('Firearm not found');
    if (firearm.userId.toString() !== userId) throw new ForbiddenException();

    return this.taskModel.create({
      userId: new Types.ObjectId(userId),
      firearmId: new Types.ObjectId(dto.firearmId),
      name: dto.name,
      intervalRounds: dto.intervalRounds,
      lastCompletedAt: null,
      roundsAtLastCompletion: 0,
      // Start counting from current totalRounds
      nextDueAtRounds: firearm.totalRounds + dto.intervalRounds,
    });
  }

  async update(id: string, userId: string, dto: UpdateMaintenanceTaskDto) {
    const task = await this.findOne(id, userId);
    const updates: any = {};
    if (dto.name) updates.name = dto.name;
    if (dto.intervalRounds) {
      updates.intervalRounds = dto.intervalRounds;
      updates.nextDueAtRounds = task.roundsAtLastCompletion + dto.intervalRounds;
    }
    return this.taskModel.findByIdAndUpdate(id, updates, { new: true }).exec();
  }

  async complete(id: string, userId: string) {
    const task = await this.findOne(id, userId);
    const firearm = await this.firearmModel.findById(task.firearmId).exec();
    if (!firearm) throw new NotFoundException('Firearm not found');

    const now = new Date();
    return this.taskModel
      .findByIdAndUpdate(
        id,
        {
          lastCompletedAt: now,
          roundsAtLastCompletion: firearm.totalRounds,
          nextDueAtRounds: firearm.totalRounds + task.intervalRounds,
        },
        { new: true },
      )
      .exec();
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.taskModel.findByIdAndDelete(id).exec();
    return { deleted: true };
  }
}
