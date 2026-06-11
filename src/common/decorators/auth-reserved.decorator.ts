import { applyDecorators } from '@nestjs/common';

// Placeholder decorator for future auth guards/permissions.
// Keep route signatures stable now and swap in guards later.
export function AuthReserved() {
  return applyDecorators();
}
