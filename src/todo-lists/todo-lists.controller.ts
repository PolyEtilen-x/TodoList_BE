import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { TodoListsService } from './todo-lists.service';
import { CreateTodoListDto, UpdateTodoListDto } from './dto/todo-list.dto';
import { GuestId } from '../common/decorators/guest-id.decorator';

@Controller('todo-lists')
export class TodoListsController {
  constructor(private readonly todoListsService: TodoListsService) {}

  @Post()
  create(@Body() createDto: CreateTodoListDto, @GuestId() guestId: string) {
    return this.todoListsService.create(createDto, guestId);
  }

  @Get()
  findAll(@GuestId() guestId: string) {
    return this.todoListsService.findAll(guestId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GuestId() guestId: string) {
    return this.todoListsService.findOne(id, guestId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTodoListDto,
    @GuestId() guestId: string,
  ) {
    return this.todoListsService.update(id, updateDto, guestId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GuestId() guestId: string) {
    return this.todoListsService.remove(id, guestId);
  }
}
