import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Firearm', required: true, index: true })
  firearmId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, min: 1 })
  roundsFired: number;

  @Prop({ default: null })
  location: string | null;

  @Prop({ default: null })
  notes: string | null;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
