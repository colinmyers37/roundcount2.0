import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FirearmDocument = Firearm & Document;

@Schema({ timestamps: true })
export class Firearm {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  make: string;

  @Prop({ required: true, trim: true })
  model: string;

  @Prop({ required: true, trim: true })
  caliber: string;

  @Prop({ default: null })
  serialNumber: string | null;

  @Prop({ default: 0, min: 0 })
  totalRounds: number;

  @Prop({ default: null })
  notes: string | null;
}

export const FirearmSchema = SchemaFactory.createForClass(Firearm);
