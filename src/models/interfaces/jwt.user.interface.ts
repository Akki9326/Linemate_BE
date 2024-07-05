import { UserType } from '../enums/user-types.enum';

export interface JwtTokenData {
  email: string;
  firstName: string;
  lastName: string;
  id: number;
  userType: UserType;
}
