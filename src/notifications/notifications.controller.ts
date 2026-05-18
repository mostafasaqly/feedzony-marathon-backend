import { Controller, Get, Patch, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

type Filter = 'all' | 'unread' | 'read';

function parseFilter(raw: string | undefined): Filter {
  if (raw === 'unread' || raw === 'read' || raw === 'all') return raw;
  return 'all';
}

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('recent')
  getRecent(@Req() req: any) {
    return this.notificationsService.getRecent(req.user.id);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Get()
  getAll(@Req() req: any, @Query('filter') filter?: string) {
    return this.notificationsService.getAll(req.user.id, parseFilter(filter));
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Req() req: any, @Param('id') id: string) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }
}
