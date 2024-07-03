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
