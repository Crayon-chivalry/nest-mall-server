import { UserRole } from 'src/common/enums/user-role.enum';

export interface RequestUser {
  id: number;
  userId: string;
  nickname: string;
  phone: string;
  role: UserRole;
  permissions: string[];
}
