import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '.prisma/client';
export type Todo = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  todo: string;
  completed: boolean;
};

@Injectable()
export class TodosService {
  constructor(private prisma: PrismaService) {}

  async createTodo(
    todoCreateInput: Prisma.TodoCreateInput,
  ): Promise<Todo | Error> {
    try {
      const todo = await this.prisma.todo.create({
        data: todoCreateInput,
      });
      return todo;
    } catch (error) {
      throw error;
    }
  }

  async getAllTodo(userId: string): Promise<Todo[] | Error> {
    try {
      const todos = await this.prisma.todo.findMany();
      if (userId) return todos.filter((todo) => todo.userId === Number(userId));
      return todos;
    } catch (error) {
      throw error;
    }
  }

  async getTodoById(
    todoWhereUniqueInput: Prisma.TodoWhereUniqueInput,
  ): Promise<Todo | Error> {
    try {
      const todo = await this.prisma.todo.findUnique({
        where: todoWhereUniqueInput,
      });
      if (!todo) {
        return new HttpException('Index out of range.', HttpStatus.BAD_REQUEST);
      }
      return todo;
    } catch (error) {
      throw error;
    }
  }

  async updateTodoById(
    id: number,
    todoUpdateInput: Prisma.TodoUpdateInput,
  ): Promise<Todo | Error> {
    try {
      const user = await this.prisma.todo.update({
        where: { id },
        data: todoUpdateInput,
      });
      return user;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async deleteAllTodos(): Promise<void> {
    try {
      await this.prisma.todo.deleteMany();
    } catch (error) {
      throw error;
    }
  }
}
