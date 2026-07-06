import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      success: true,
      service: 'Todo Manager API',
      status: 'ok',
    };
  }
}
