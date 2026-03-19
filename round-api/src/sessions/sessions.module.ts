import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { Session, SessionSchema } from './session.schema';
import { Firearm, FirearmSchema } from '../firearms/firearm.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Firearm.name, schema: FirearmSchema },
    ]),
  ],
  controllers: [SessionsController],
  providers: [SessionsService],
})
export class SessionsModule {}
