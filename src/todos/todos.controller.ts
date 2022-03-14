import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  Delete,
  Query,
  Patch,
} from '@nestjs/common';
import { Prisma } from '.prisma/client';
import { Todo, TodosService } from './todos.service';

@Controller('todos')
export class TodosController {
  constructor(private todosService: TodosService) {}

  @Post()
  createNewTodo(
    @Body() createTodoDto: Prisma.TodoCreateInput,
  ): Promise<Todo | Error> {
    return this.todosService.createTodo(createTodoDto);
  }

  @Get()
  getAllTodos(@Query('userId') userId: string): Promise<Todo[] | Error> {
    return this.todosService.getAllTodo(userId);
  }

  @Get(':id')
  getTodoById(@Param('id', ParseIntPipe) id: number): Promise<Todo | Error> {
    return this.todosService.getTodoById({ id });
  }

  @Patch(':id')
  updateTodoById(
    @Param('id', ParseIntPipe) id: number,
    @Body() todoUpdateInput: Prisma.TodoUpdateInput,
  ): Promise<Todo | Error> {
    return this.todosService.updateTodoById(id, todoUpdateInput);
  }

  @Delete()
  deleteAllTodos(): Promise<void> {
    return this.todosService.deleteAllTodos();
  }
}
