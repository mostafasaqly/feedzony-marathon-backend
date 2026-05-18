import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { ServicesModule } from '../services/services.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ServicesModule, NotificationsModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
})
export class FeedbackModule {}
