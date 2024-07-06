import { Request } from 'express';
import { JwtTokenData } from './jwt.user.interface';
import { AppPermission } from '../enums/app-access.enum';

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: JwtTokenData;
  userAccess: AppPermission[]
}
export interface UserData {
  access: AppPermission[];
  email: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  tenantIds: number[];
  countryCode: string;
}

export class LoginResponseData {
  token: string;
  userData: UserData
}
