import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceTask, MaintenanceTaskSchema } from './maintenance-task.schema';
import { Firearm, FirearmSchema } from '../firearms/firearm.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MaintenanceTask.name, schema: MaintenanceTaskSchema },
      { name: Firearm.name, schema: FirearmSchema },
    ]),
  ],
  controllers: [MaintenanceController],
  providers: [MaintenanceService],
})
export class MaintenanceModule {}
