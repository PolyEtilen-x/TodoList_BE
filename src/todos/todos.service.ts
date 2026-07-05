import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto) {
    const todo = await this.prisma.todo.create({
      data: {
        title: createTodoDto.title.trim(),
        description: createTodoDto.description?.trim(),
      },
    });

    return {
      success: true,
      data: todo,
    };
  }

  async findAll(query: QueryTodoDto) {
    const { search, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 10 } = query;

    const where: Prisma.TodoWhereInput = {};

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

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        orderBy: {
          [sortBy]: order,
        },
        skip,
        take: limit,
      }),
      this.prisma.todo.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: {
        items,
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  }

  async findOne(id: string) {
    const todo = await this.prisma.todo.findUnique({
      where: { id },
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID "${id}" not found`);
    }

    return {
      success: true,
      data: todo,
    };
  }

  async update(id: string, updateTodoDto: UpdateTodoDto) {
    // Verify that todo exists
    await this.findOne(id);

    const updateData: Prisma.TodoUpdateInput = {};
    if (updateTodoDto.title !== undefined) {
      updateData.title = updateTodoDto.title.trim();
    }
    if (updateTodoDto.description !== undefined) {
      updateData.description = updateTodoDto.description?.trim();
    }
    if (updateTodoDto.completed !== undefined) {
      updateData.completed = updateTodoDto.completed;
    }

    const todo = await this.prisma.todo.update({
      where: { id },
      data: updateData,
    });

    return {
      success: true,
      data: todo,
    };
  }

  async remove(id: string) {
    // Verify that todo exists
    await this.findOne(id);

    await this.prisma.todo.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Todo with ID "${id}" has been deleted successfully.`,
    };
  }

  async getStats() {
    const [total, pending, completed] = await Promise.all([
      this.prisma.todo.count(),
      this.prisma.todo.count({ where: { completed: false } }),
      this.prisma.todo.count({ where: { completed: true } }),
    ]);

    return {
      success: true,
      data: {
        total,
        pending,
        completed,
      },
    };
  }
}
