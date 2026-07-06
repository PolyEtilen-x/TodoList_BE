import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { GuestId } from './common/decorators/guest-id.decorator';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('search')
  async globalSearch(@Query('q') query: string, @GuestId() guestId: string) {
    if (!query || query.trim() === '') {
      return { success: true, data: { groups: [], lists: [], todos: [] } };
    }

    const pattern = query.trim();

    const [groups, lists, todos] = await Promise.all([
      this.prisma.todoGroup.findMany({
        where: {
          guestId,
          name: { contains: pattern, mode: 'insensitive' },
        },
        take: 5,
      }),
      this.prisma.todoList.findMany({
        where: {
          guestId,
          name: { contains: pattern, mode: 'insensitive' },
        },
        take: 10,
      }),
      this.prisma.todo.findMany({
        where: {
          guestId,
          OR: [
            { title: { contains: pattern, mode: 'insensitive' } },
            { description: { contains: pattern, mode: 'insensitive' } },
          ],
        },
        include: { list: true }, // Include the list info so UI knows where the task belongs
        take: 20,
      }),
    ]);

    return { success: true, data: { groups, lists, todos } };
  }
}
