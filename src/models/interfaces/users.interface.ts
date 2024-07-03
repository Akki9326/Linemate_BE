export interface User {
  id: number;
  email: string;
  password: string;
  username:string,
  userType:string;
  tenantId?:number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}
