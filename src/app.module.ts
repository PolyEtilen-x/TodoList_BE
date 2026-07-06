import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { TodosModule } from './todos/todos.module';
import { TodoGroupsModule } from './todo-groups/todo-groups.module';
import { TodoListsModule } from './todo-lists/todo-lists.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TodosModule,
    TodoGroupsModule,
    TodoListsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
