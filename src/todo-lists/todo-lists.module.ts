import { Module } from '@nestjs/common';
import { TodoListsController } from './todo-lists.controller';
import { TodoListsService } from './todo-lists.service';

@Module({
  controllers: [TodoListsController],
  providers: [TodoListsService]
})
export class TodoListsModule {}
