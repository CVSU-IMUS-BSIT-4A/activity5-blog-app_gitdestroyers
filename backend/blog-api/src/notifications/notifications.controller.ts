import { Controller, Get, Post, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.notificationsService.getUserNotifications(
      req.user?.userId,
      page || 1,
      pageSize || 10,
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user?.userId);
    return { count };
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: number, @Request() req: any) {
    return this.notificationsService.markAsRead(id, req.user?.userId);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req: any) {
    await this.notificationsService.markAllAsRead(req.user?.userId);
    return { message: 'All notifications marked as read' };
  }

  @Post(':id/unread')
  async markAsUnread(@Param('id') id: number, @Request() req: any) {
    return this.notificationsService.markAsUnread(id, req.user?.userId);
  }

  @Post(':id/delete')
  async deleteNotification(@Param('id') id: number, @Request() req: any) {
    await this.notificationsService.deleteNotification(id, req.user?.userId);
    return { message: 'Notification deleted successfully' };
  }
}
