import { UserType } from "../enums/user-types.enum";

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  lastLoggedInAt: Date;
  userType: UserType;
  failedLoginAttempts: number;
}
