import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Prisma, Todo } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateTodoDto, guestId: string) {
    if (createDto.listId) {
      const list = await this.prisma.todoList.findUnique({
        where: { id: createDto.listId },
      });
      if (!list) throw new BadRequestException('Invalid listId');
      if (!list.isSystem && list.guestId !== guestId) {
        throw new BadRequestException('Invalid listId');
      }
    }

    if (createDto.startTime && createDto.endTime) {
      const start = new Date(createDto.startTime);
      const end = new Date(createDto.endTime);
      if (end < start) {
        throw new BadRequestException('endTime must be after startTime');
      }
    }

    const todo = await this.prisma.todo.create({
      data: {
        title: createDto.title.trim(),
        description: createDto.description?.trim() || null,
        isImportant: createDto.isImportant || false,
        isMyDay: createDto.isMyDay || false,
        listId: createDto.listId || null,
        startTime: createDto.startTime ? new Date(createDto.startTime) : null,
        endTime: createDto.endTime ? new Date(createDto.endTime) : null,
        guestId,
      },
    });

    return { success: true, data: todo };
  }

  async findAll(query: QueryTodoDto, guestId: string) {
    const {
      search,
      status,
      sortBy = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      listId,
      isImportant,
      isMyDay,
    } = query;

    const where: Prisma.TodoWhereInput = { guestId };

    if (search && search.trim() !== '') {
      const searchPattern = search.trim();
      where.OR = [
        { title: { contains: searchPattern, mode: 'insensitive' } },
        { description: { contains: searchPattern, mode: 'insensitive' } },
      ];
    }

    if (status === 'completed') {
      where.completed = true;
    } else if (status === 'pending') {
      where.completed = false;
    }

    if (listId) where.listId = listId;
    if (isImportant === 'true') where.isImportant = true;
    if (isMyDay === 'true') where.isMyDay = true;

    // Convert page/limit logic correctly
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const [items, totalItems] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        orderBy: { [sortBy]: order },
        skip,
        take: limitNum,
      }),
      this.prisma.todo.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limitNum);

    return {
      success: true,
      data: {
        items,
        totalItems,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    };
  }

  async findOne(
    id: string,
    guestId: string,
  ): Promise<{ success: boolean; data: Todo }> {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo || todo.guestId !== guestId) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }
    return { success: true, data: todo };
  }

  async update(id: string, updateDto: UpdateTodoDto, guestId: string) {
    const todoResult = await this.findOne(id, guestId); // verify ownership and existence
    const existingTodo = todoResult.data;

    if (updateDto.listId) {
      const list = await this.prisma.todoList.findUnique({
        where: { id: updateDto.listId },
      });
      if (!list) throw new BadRequestException('Invalid listId');
      if (!list.isSystem && list.guestId !== guestId) {
        throw new BadRequestException('Invalid listId');
      }
    }

    const start =
      updateDto.startTime !== undefined
        ? updateDto.startTime
          ? new Date(updateDto.startTime)
          : null
        : existingTodo.startTime;

    const end =
      updateDto.endTime !== undefined
        ? updateDto.endTime
          ? new Date(updateDto.endTime)
          : null
        : existingTodo.endTime;

    if (start && end && end < start) {
      throw new BadRequestException('endTime must be after startTime');
    }

    const updateData: Prisma.TodoUncheckedUpdateInput = {};
    if (updateDto.title !== undefined)
      updateData.title = updateDto.title.trim();
    if (updateDto.description !== undefined)
      updateData.description = updateDto.description?.trim() || null;
    if (updateDto.completed !== undefined)
      updateData.completed = updateDto.completed;
    if (updateDto.isImportant !== undefined)
      updateData.isImportant = updateDto.isImportant;
    if (updateDto.isMyDay !== undefined) updateData.isMyDay = updateDto.isMyDay;
    if (updateDto.listId !== undefined)
      updateData.listId = updateDto.listId || null;
    if (updateDto.startTime !== undefined)
      updateData.startTime = updateDto.startTime
        ? new Date(updateDto.startTime)
        : null;
    if (updateDto.endTime !== undefined)
      updateData.endTime = updateDto.endTime
        ? new Date(updateDto.endTime)
        : null;

    const todo = await this.prisma.todo.update({
      where: { id },
      data: updateData,
    });

    return { success: true, data: todo };
  }

  async remove(id: string, guestId: string) {
    await this.findOne(id, guestId); // verify ownership
    await this.prisma.todo.delete({ where: { id } });
    return { success: true, message: `Todo deleted successfully.` };
  }

  async getStats(query: QueryTodoDto, guestId: string) {
    const { listId, isImportant, isMyDay } = query;
    const baseWhere: Prisma.TodoWhereInput = { guestId };

    if (listId) baseWhere.listId = listId;
    if (isImportant === 'true') baseWhere.isImportant = true;
    if (isMyDay === 'true') baseWhere.isMyDay = true;

    const [total, pending, completed] = await Promise.all([
      this.prisma.todo.count({ where: baseWhere }),
      this.prisma.todo.count({ where: { ...baseWhere, completed: false } }),
      this.prisma.todo.count({ where: { ...baseWhere, completed: true } }),
    ]);

    return { success: true, data: { total, pending, completed } };
  }
}
