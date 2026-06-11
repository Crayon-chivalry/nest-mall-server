import { SetMetadata } from '@nestjs/common';
import { SUCCESS_MESSAGE_KEY } from '../constants/success-message.constants';

export function SuccessMessage(message: string) {
  return SetMetadata(SUCCESS_MESSAGE_KEY, message);
}
