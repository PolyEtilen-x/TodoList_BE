import { Module } from '@nestjs/common';
import { TodoGroupsController } from './todo-groups.controller';
import { TodoGroupsService } from './todo-groups.service';

@Module({
  controllers: [TodoGroupsController],
  providers: [TodoGroupsService],
})
export class TodoGroupsModule {}
