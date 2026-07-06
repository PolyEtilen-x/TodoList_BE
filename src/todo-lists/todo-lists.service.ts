import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoListDto, UpdateTodoListDto } from './dto/todo-list.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodoListsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) { }

  async onModuleInit() {
    const defaultLists = [
      { name: 'My Day', icon: 'Sun', isSystem: true },
      { name: 'Important', icon: 'Star', isSystem: true },
      { name: 'Tasks', icon: 'Home', isSystem: true },
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

  async create(createDto: CreateTodoListDto) {
    if (createDto.groupId) {
      const group = await this.prisma.todoGroup.findUnique({ where: { id: createDto.groupId } });
      if (!group) throw new BadRequestException('Invalid groupId');
    }

    const list = await this.prisma.todoList.create({
      data: {
        name: createDto.name.trim(),
        icon: createDto.icon?.trim() || null,
        groupId: createDto.groupId || null,
        isSystem: createDto.isSystem || false,
      },
    });
    return { success: true, data: list };
  }

  async findAll() {
    const lists = await this.prisma.todoList.findMany({
      include: {
        _count: {
          select: { todos: true }
        }
      },
      orderBy: [
        { isSystem: 'desc' },
        { createdAt: 'asc' },
      ],
    });
    return { success: true, data: lists };
  }

  async findOne(id: string) {
    const list = await this.prisma.todoList.findUnique({
      where: { id },
      include: { todos: true },
    });
    if (!list) throw new NotFoundException(`TodoList with ID "${id}" not found`);
    return { success: true, data: list };
  }

  async update(id: string, updateDto: UpdateTodoListDto) {
    await this.findOne(id); // verify existence

    if (updateDto.groupId) {
      const group = await this.prisma.todoGroup.findUnique({ where: { id: updateDto.groupId } });
      if (!group) throw new BadRequestException('Invalid groupId');
    }

    const updateData: Prisma.TodoListUncheckedUpdateInput = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name.trim();
    if (updateDto.icon !== undefined) updateData.icon = updateDto.icon?.trim() || null;
    if (updateDto.groupId !== undefined) updateData.groupId = updateDto.groupId || null;

    const list = await this.prisma.todoList.update({
      where: { id },
      data: updateData,
    });
    return { success: true, data: list };
  }

  async remove(id: string) {
    const list = (await this.findOne(id)).data;
    if (list.isSystem) {
      throw new BadRequestException('Cannot delete system lists');
    }

    await this.prisma.todoList.delete({ where: { id } });
    return { success: true, message: 'List deleted successfully' };
  }
}
