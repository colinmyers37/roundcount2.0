import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceTaskDto } from './dto/create-maintenance-task.dto';
import { UpdateMaintenanceTaskDto } from './dto/update-maintenance-task.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private maintenanceService: MaintenanceService) {}

  @Get()
  findAll(@CurrentUser() user: any, @Query('firearmId') firearmId?: string) {
    return this.maintenanceService.findAll(user._id.toString(), firearmId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.maintenanceService.findOne(id, user._id.toString());
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateMaintenanceTaskDto) {
    return this.maintenanceService.create(user._id.toString(), dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateMaintenanceTaskDto,
  ) {
    return this.maintenanceService.update(id, user._id.toString(), dto);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.maintenanceService.complete(id, user._id.toString());
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.maintenanceService.remove(id, user._id.toString());
  }
}
