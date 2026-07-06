import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TodoGroupsService } from './todo-groups.service';
import { CreateTodoGroupDto } from './dto/create-todo-group.dto';
import { GuestId } from '../common/decorators/guest-id.decorator';

@Controller('todo-groups')
export class TodoGroupsController {
  constructor(private readonly todoGroupsService: TodoGroupsService) { }

  @Post()
  create(@Body() createDto: CreateTodoGroupDto, @GuestId() guestId: string) {
    return this.todoGroupsService.create(createDto, guestId);
  }

  @Get()
  findAll(@GuestId() guestId: string) {
    return this.todoGroupsService.findAll(guestId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GuestId() guestId: string) {
    return this.todoGroupsService.findOne(id, guestId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: CreateTodoGroupDto,
    @GuestId() guestId: string,
  ) {
    return this.todoGroupsService.update(id, updateDto, guestId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GuestId() guestId: string) {
    return this.todoGroupsService.remove(id, guestId);
  }
}
