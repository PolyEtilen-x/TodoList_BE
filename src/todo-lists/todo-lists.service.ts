import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoListDto, UpdateTodoListDto } from './dto/todo-list.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodoListsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    // Clean up old default system lists if they exist
    await this.prisma.todoList.deleteMany({
      where: {
        isSystem: true,
        name: { in: ['My Day', 'Tasks'] },
      },
    });

    const defaultLists = [
      { name: 'Important', icon: 'Star', isSystem: true },
    ];

    for (const list of defaultLists) {
      const exists = await this.prisma.todoList.findFirst({
        where: { name: list.name, isSystem: true },
      });
      if (!exists) {
        await this.prisma.todoList.create({
          data: {
            name: list.name,
            icon: list.icon,
            isSystem: true,
          },
        });
      }
    }
  }

  async create(createDto: CreateTodoListDto, guestId: string) {
    if (createDto.groupId) {
      const group = await this.prisma.todoGroup.findUnique({ where: { id: createDto.groupId } });
      if (!group || (group.guestId && group.guestId !== guestId)) {
        throw new BadRequestException('Invalid groupId');
      }
    }

    const list = await this.prisma.todoList.create({
      data: {
        name: createDto.name.trim(),
        icon: createDto.icon?.trim() || null,
        groupId: createDto.groupId || null,
        isSystem: false,
        guestId,
      },
    });
    return { success: true, data: list };
  }

  async findAll(guestId: string) {
    const lists = await this.prisma.todoList.findMany({
      where: {
        OR: [
          { isSystem: true },
          { guestId },
        ],
      },
      include: {
        _count: {
          select: {
            todos: {
              where: { guestId },
            },
          },
        },
      },
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'asc' },
      ],
    });

    // Tính toán lại chính xác số lượng công việc quan trọng cho danh sách hệ thống "Important"
    const mappedLists = await Promise.all(
      lists.map(async (list) => {
        if (list.isSystem && list.name === 'Important') {
          const importantCount = await this.prisma.todo.count({
            where: { guestId, isImportant: true },
          });
          return {
            ...list,
            _count: {
              todos: importantCount,
            },
          };
        }
        return list;
      })
    );

    return { success: true, data: mappedLists };
  }

  async findOne(id: string, guestId: string) {
    const list = await this.prisma.todoList.findUnique({
      where: { id },
      include: {
        todos: {
          where: { guestId },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!list) throw new NotFoundException(`TodoList with ID "${id}" not found`);
    if (!list.isSystem && list.guestId !== guestId) {
      throw new NotFoundException(`TodoList with ID "${id}" not found`);
    }

    return { success: true, data: list };
  }

  async update(id: string, updateDto: UpdateTodoListDto, guestId: string) {
    const list = (await this.findOne(id, guestId)).data;

    if (list.isSystem) {
      throw new BadRequestException('Cannot update system lists');
    }

    if (updateDto.groupId) {
      const group = await this.prisma.todoGroup.findUnique({ where: { id: updateDto.groupId } });
      if (!group || (group.guestId && group.guestId !== guestId)) {
        throw new BadRequestException('Invalid groupId');
      }
    }

    const updateData: Prisma.TodoListUncheckedUpdateInput = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name.trim();
    if (updateDto.icon !== undefined) updateData.icon = updateDto.icon?.trim() || null;
    if (updateDto.groupId !== undefined) updateData.groupId = updateDto.groupId || null;

    const updatedList = await this.prisma.todoList.update({
      where: { id },
      data: updateData,
    });
    return { success: true, data: updatedList };
  }

  async remove(id: string, guestId: string) {
    const list = (await this.findOne(id, guestId)).data;
    if (list.isSystem) {
      throw new BadRequestException('Cannot delete system lists');
    }

    await this.prisma.todoList.delete({ where: { id } });
    return { success: true, message: 'List deleted successfully' };
  }
}
