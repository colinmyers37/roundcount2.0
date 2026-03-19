import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FirearmsService } from './firearms.service';
import { FirearmsController } from './firearms.controller';
import { Firearm, FirearmSchema } from './firearm.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Firearm.name, schema: FirearmSchema }])],
  controllers: [FirearmsController],
  providers: [FirearmsService],
  exports: [FirearmsService],
})
export class FirearmsModule {}
