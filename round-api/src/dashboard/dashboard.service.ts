import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Firearm, FirearmDocument } from '../firearms/firearm.schema';
import { Session, SessionDocument } from '../sessions/session.schema';
import { MaintenanceTask, MaintenanceTaskDocument } from '../maintenance/maintenance-task.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Firearm.name) private firearmModel: Model<FirearmDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(MaintenanceTask.name)
    private taskModel: Model<MaintenanceTaskDocument>,
  ) {}

  async getDashboard(userId: string) {
    const uid = new Types.ObjectId(userId);

    const [firearms, recentSessions, allTasks] = await Promise.all([
      this.firearmModel.find({ userId: uid }).sort({ updatedAt: -1 }).exec(),
      this.sessionModel
        .find({ userId: uid })
        .sort({ date: -1 })
        .limit(5)
        .populate('firearmId', 'name make model')
        .exec(),
      this.taskModel.find({ userId: uid }).exec(),
    ]);

    const totalRoundsAllTime = firearms.reduce((sum, f) => sum + f.totalRounds, 0);

    const roundMap = new Map(firearms.map((f) => [f._id.toString(), f.totalRounds]));
    const overdueTasks = allTasks.filter((task) => {
      const totalRounds = roundMap.get(task.firearmId.toString()) ?? 0;
      return totalRounds >= task.nextDueAtRounds;
    });

    return {
      totalRoundsAllTime,
      totalFirearms: firearms.length,
      firearms: firearms.map((f) => ({
        _id: f._id,
        name: f.name,
        make: f.make,
        model: f.model,
        caliber: f.caliber,
        totalRounds: f.totalRounds,
      })),
      recentSessions,
      overdueMaintenanceCount: overdueTasks.length,
      overdueTasks: overdueTasks.slice(0, 5),
    };
  }
}
