import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { Firearm, FirearmSchema } from '../firearms/firearm.schema';
import { Session, SessionSchema } from '../sessions/session.schema';
import { MaintenanceTask, MaintenanceTaskSchema } from '../maintenance/maintenance-task.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Firearm.name, schema: FirearmSchema },
      { name: Session.name, schema: SessionSchema },
      { name: MaintenanceTask.name, schema: MaintenanceTaskSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
