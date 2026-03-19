import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { FirearmsService } from './firearms.service';
import { CreateFirearmDto } from './dto/create-firearm.dto';
import { UpdateFirearmDto } from './dto/update-firearm.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('firearms')
export class FirearmsController {
  constructor(private firearmsService: FirearmsService) {}

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.firearmsService.findAll(user._id.toString());
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.firearmsService.findOne(id, user._id.toString());
  }

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateFirearmDto) {
    return this.firearmsService.create(user._id.toString(), dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateFirearmDto,
  ) {
    return this.firearmsService.update(id, user._id.toString(), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.firearmsService.remove(id, user._id.toString());
  }
}
