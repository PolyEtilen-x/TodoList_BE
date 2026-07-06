import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodoListsService } from './todo-lists.service';
import { CreateTodoListDto, UpdateTodoListDto } from './dto/todo-list.dto';

@Controller('todo-lists')
export class TodoListsController {
  constructor(private readonly todoListsService: TodoListsService) {}

  @Post()
  create(@Body() createDto: CreateTodoListDto) {
    return this.todoListsService.create(createDto);
  }

  @Get()
  findAll() {
    return this.todoListsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.todoListsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateTodoListDto) {
    return this.todoListsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.todoListsService.remove(id);
  }
}
