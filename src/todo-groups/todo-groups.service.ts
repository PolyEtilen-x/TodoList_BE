import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoGroupDto } from './dto/create-todo-group.dto';

@Injectable()
export class TodoGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateTodoGroupDto, guestId: string) {
    const group = await this.prisma.todoGroup.create({
      data: {
        name: createDto.name.trim(),
        guestId,
      },
    });
    return { success: true, data: group };
  }

  async findAll(guestId: string) {
    const groups = await this.prisma.todoGroup.findMany({
      where: { guestId },
      include: {
        lists: {
          where: { guestId },
          include: {
            _count: {
              select: {
                todos: {
                  where: { guestId, completed: false },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: groups };
  }

  async findOne(id: string, guestId: string) {
    const group = await this.prisma.todoGroup.findUnique({
      where: { id },
      include: {
        lists: {
          where: { guestId },
          include: {
            _count: {
              select: {
                todos: {
                  where: { guestId, completed: false },
                },
              },
            },
          },
        },
      },
    });
    if (!group || group.guestId !== guestId) {
      throw new NotFoundException(`TodoGroup with ID "${id}" not found`);
    }
    return { success: true, data: group };
  }

  async update(id: string, updateDto: CreateTodoGroupDto, guestId: string) {
    await this.findOne(id, guestId);
    const group = await this.prisma.todoGroup.update({
      where: { id },
      data: { name: updateDto.name.trim() },
    });
    return { success: true, data: group };
  }

  async remove(id: string, guestId: string) {
    await this.findOne(id, guestId);
    await this.prisma.todoGroup.delete({ where: { id } });
    return { success: true, message: 'Group deleted successfully' };
  }
}
