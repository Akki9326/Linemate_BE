import { AppPermission } from '../enums/app-access.enum';
import { UserType } from '../enums/user-types.enum';

export interface JwtTokenData {
  email: string;
  username: string;
  id: number;
  sessionId: string;
  roleIds?: number[];
  userType: UserType;
  orgId: number;
}
