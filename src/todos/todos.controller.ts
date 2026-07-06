import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodoDto } from './dto/query-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodosService } from './todos.service';
import { GuestId } from '../common/decorators/guest-id.decorator';

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: 201,
    description: 'The todo has been successfully created.',
  })
  create(@Body() createTodoDto: CreateTodoDto, @GuestId() guestId: string) {
    return this.todosService.create(createTodoDto, guestId);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all todos with filter, search, sort, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'List of todos returned successfully.',
  })
  findAll(@Query() query: QueryTodoDto, @GuestId() guestId: string) {
    return this.todosService.findAll(query, guestId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get total, pending, and completed todo counts' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully.' })
  getStats(@Query() query: QueryTodoDto, @GuestId() guestId: string) {
    return this.todosService.getStats(query, guestId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a todo by ID' })
  @ApiResponse({ status: 200, description: 'Todo item returned successfully.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  findOne(@Param('id') id: string, @GuestId() guestId: string) {
    return this.todosService.findOne(id, guestId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a todo by ID (or toggle completion status)',
  })
  @ApiResponse({ status: 200, description: 'Todo updated successfully.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @GuestId() guestId: string,
  ) {
    return this.todosService.update(id, updateTodoDto, guestId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a todo by ID' })
  @ApiResponse({ status: 200, description: 'Todo deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Todo not found.' })
  remove(@Param('id') id: string, @GuestId() guestId: string) {
    return this.todosService.remove(id, guestId);
  }
}
