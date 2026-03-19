import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MaintenanceTaskDocument = MaintenanceTask & Document;

@Schema({ timestamps: true })
export class MaintenanceTask {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Firearm', required: true, index: true })
  firearmId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, min: 1 })
  intervalRounds: number;

  @Prop({ default: null })
  lastCompletedAt: Date | null;

  @Prop({ default: 0 })
  roundsAtLastCompletion: number;

  @Prop({ required: true })
  nextDueAtRounds: number;
}

export const MaintenanceTaskSchema = SchemaFactory.createForClass(MaintenanceTask);
