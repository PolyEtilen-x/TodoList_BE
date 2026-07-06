import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

import { Request } from 'express';

export const GuestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const guestId = request.headers['x-guest-id'];

    if (!guestId) {
      throw new BadRequestException('Missing x-guest-id header');
    }

    return String(guestId);
  },
);
