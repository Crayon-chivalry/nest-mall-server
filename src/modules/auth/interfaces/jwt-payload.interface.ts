import { UserRole } from 'src/common/enums/user-role.enum';

export interface JwtPayload {
  sub: number;
  userId: string;
  nickname: string;
  phone: string;
  account?: string;
  role: UserRole;
  permissions: string[];
}
