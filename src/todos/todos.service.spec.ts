import { Test, TestingModule } from '@nestjs/testing';
import { TodosService } from './todos.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TodosService', () => {
  let service: TodosService;
  let prisma: PrismaService;

  const mockPrismaService = {
    todo: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TodosService>(TodosService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a todo successfully', async () => {
      const createTodoDto = { title: 'Test Todo', description: 'Test Description' };
      const createdTodo = { id: 'uuid-1', ...createTodoDto, completed: false, createdAt: new Date(), updatedAt: new Date() };
      mockPrismaService.todo.create.mockResolvedValue(createdTodo);

      const result = await service.create(createTodoDto);

      expect(prisma.todo.create).toHaveBeenCalledWith({
        data: { title: 'Test Todo', description: 'Test Description' },
      });
      expect(result).toEqual({ success: true, data: createdTodo });
    });
  });

  describe('findOne', () => {
    it('should return a todo if found', async () => {
      const todo = { id: 'uuid-1', title: 'Test Todo', description: 'Test', completed: false, createdAt: new Date(), updatedAt: new Date() };
      mockPrismaService.todo.findUnique.mockResolvedValue(todo);

      const result = await service.findOne('uuid-1');

      expect(prisma.todo.findUnique).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual({ success: true, data: todo });
    });

    it('should throw NotFoundException if todo not found', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a todo successfully', async () => {
      const todo = { id: 'uuid-1', title: 'Test Todo', description: 'Test', completed: false, createdAt: new Date(), updatedAt: new Date() };
      const updateTodoDto = { completed: true };
      const updatedTodo = { ...todo, completed: true };

      // mock findOne check inside update
      mockPrismaService.todo.findUnique.mockResolvedValue(todo);
      mockPrismaService.todo.update.mockResolvedValue(updatedTodo);

      const result = await service.update('uuid-1', updateTodoDto);

      expect(prisma.todo.update).toHaveBeenCalledWith({
        where: { id: 'uuid-1' },
        data: { completed: true },
      });
      expect(result).toEqual({ success: true, data: updatedTodo });
    });

    it('should throw NotFoundException when updating a non-existent todo', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.update('invalid-uuid', { completed: true })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a todo successfully', async () => {
      const todo = { id: 'uuid-1', title: 'Test Todo', description: 'Test', completed: false, createdAt: new Date(), updatedAt: new Date() };
      mockPrismaService.todo.findUnique.mockResolvedValue(todo);
      mockPrismaService.todo.delete.mockResolvedValue(todo);

      const result = await service.remove('uuid-1');

      expect(prisma.todo.delete).toHaveBeenCalledWith({ where: { id: 'uuid-1' } });
      expect(result).toEqual({ success: true, message: 'Todo with ID "uuid-1" has been deleted successfully.' });
    });

    it('should throw NotFoundException when deleting a non-existent todo', async () => {
      mockPrismaService.todo.findUnique.mockResolvedValue(null);

      await expect(service.remove('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStats', () => {
    it('should return correct counts', async () => {
      mockPrismaService.todo.count.mockImplementation((args?: { where?: { completed?: boolean } }) => {
        if (!args || !args.where) return Promise.resolve(10);
        if (args.where.completed === false) return Promise.resolve(6);
        if (args.where.completed === true) return Promise.resolve(4);
        return Promise.resolve(0);
      });

      const result = await service.getStats();

      expect(result).toEqual({
        success: true,
        data: {
          total: 10,
          pending: 6,
          completed: 4,
        },
      });
    });
  });
});
