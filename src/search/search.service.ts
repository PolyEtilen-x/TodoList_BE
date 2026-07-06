import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(query: string, guestId: string) {
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
        include: { list: true },
        take: 20,
      }),
    ]);

    return { success: true, data: { groups, lists, todos } };
  }
}
