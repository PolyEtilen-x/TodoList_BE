import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const GuestId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const guestId = request.headers['x-guest-id'];

    if (!guestId) {
      throw new BadRequestException('Missing x-guest-id header');
    }

    return String(guestId);
  },
);
