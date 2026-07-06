import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  let prismaService: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    prismaService = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/todos (CRUD and validations)', () => {
    const guestId = 'e2e-guest-' + Math.random().toString(36).substring(2, 9);

    it('should perform complete CRUD lifecycle and validation', async () => {
      // 1. POST /todos - create
      const createRes = await request(app.getHttpServer())
        .post('/todos')
        .set('x-guest-id', guestId)
        .send({
          title: 'E2E Test Task',
          description: 'E2E Description',
          isImportant: true,
        })
        .expect(201);

      expect(createRes.body.success).toBe(true);
      const createdTodoId = createRes.body.data.id;
      expect(createdTodoId).toBeDefined();

      // 2. POST /todos - reject invalid times
      await request(app.getHttpServer())
        .post('/todos')
        .set('x-guest-id', guestId)
        .send({
          title: 'Invalid Time Task',
          startTime: '2026-07-06T12:00:00.000Z',
          endTime: '2026-07-06T10:00:00.000Z',
        })
        .expect(400);

      // 3. GET /todos - list
      const listRes = await request(app.getHttpServer())
        .get('/todos')
        .set('x-guest-id', guestId)
        .expect(200);

      expect(listRes.body.success).toBe(true);
      expect(listRes.body.data.items.length).toBe(1);
      expect(listRes.body.data.items[0].id).toBe(createdTodoId);

      // 4. GET /todos - isolation check (different guest)
      const listResOther = await request(app.getHttpServer())
        .get('/todos')
        .set('x-guest-id', 'guest-other-different')
        .expect(200);
      expect(listResOther.body.data.items.length).toBe(0);

      // 5. PATCH /todos/:id - update completed
      const updateRes = await request(app.getHttpServer())
        .patch(`/todos/${createdTodoId}`)
        .set('x-guest-id', guestId)
        .send({ completed: true })
        .expect(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.completed).toBe(true);

      // 6. GET /todos/stats - check stats
      const statsRes = await request(app.getHttpServer())
        .get('/todos/stats')
        .set('x-guest-id', guestId)
        .expect(200);
      expect(statsRes.body.success).toBe(true);
      expect(statsRes.body.data.total).toBe(1);
      expect(statsRes.body.data.completed).toBe(1);
      expect(statsRes.body.data.pending).toBe(0);

      // 7. DELETE /todos/:id - remove
      await request(app.getHttpServer())
        .delete(`/todos/${createdTodoId}`)
        .set('x-guest-id', guestId)
        .expect(200);

      // 8. GET /todos - verify empty
      const verifyRes = await request(app.getHttpServer())
        .get('/todos')
        .set('x-guest-id', guestId)
        .expect(200);
      expect(verifyRes.body.data.items.length).toBe(0);
    });
  });
});
