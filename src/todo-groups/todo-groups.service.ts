import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoGroupDto } from './dto/create-todo-group.dto';

@Injectable()
export class TodoGroupsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(createDto: CreateTodoGroupDto) {
    const group = await this.prisma.todoGroup.create({
      data: { name: createDto.name.trim() },
    });
    return { success: true, data: group };
  }

  async findAll() {
    const groups = await this.prisma.todoGroup.findMany({
      include: { lists: true },
      orderBy: { createdAt: 'asc' },
    });
    return { success: true, data: groups };
  }

  async findOne(id: string) {
    const group = await this.prisma.todoGroup.findUnique({
      where: { id },
      include: { lists: true },
    });
    if (!group) throw new NotFoundException(`TodoGroup with ID "${id}" not found`);
    return { success: true, data: group };
  }

  async update(id: string, updateDto: CreateTodoGroupDto) {
    await this.findOne(id);
    const group = await this.prisma.todoGroup.update({
      where: { id },
      data: { name: updateDto.name.trim() },
    });
    return { success: true, data: group };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.todoGroup.delete({ where: { id } });
    return { success: true, message: 'Group deleted successfully' };
  }
}
