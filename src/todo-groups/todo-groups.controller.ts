import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodoGroupsService } from './todo-groups.service';
import { CreateTodoGroupDto } from './dto/create-todo-group.dto';

@Controller('todo-groups')
export class TodoGroupsController {
  constructor(private readonly todoGroupsService: TodoGroupsService) { }

  @Post()
  create(@Body() createDto: CreateTodoGroupDto) {
    return this.todoGroupsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.todoGroupsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoGroupsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: CreateTodoGroupDto) {
    return this.todoGroupsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoGroupsService.remove(id);
  }
}
