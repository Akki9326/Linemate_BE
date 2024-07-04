import { UserType } from "../enums/user-types.enum";

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  lastLoggedInAt: Date;
  userType: UserType;
  mobileNumber: string;
  failedLoginAttempts: number;
  tenantIds: string[];
}
