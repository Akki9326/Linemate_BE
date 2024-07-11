import { IsArray, IsEmail, IsEnum, IsMobilePhone, IsNumber, IsOptional, IsString } from 'class-validator';
import { UserType } from '../enums/user-types.enum';

export class UserDto {

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

  @IsEnum(UserType)
  public userType: UserType;

  @IsMobilePhone()
  public mobileNumber: string;
  
  @IsArray()
  @IsOptional()
  public tenantIds: number[];

  @IsString()
  public countyCode: string;

  @IsString()
  @IsOptional()
  public employeeId: string;
  
  @IsString()
  @IsOptional()
  public profilePhoto: string;

  @IsArray()
  @IsOptional()
  public tenantVariable: TenantVariables[];

}

export class AdminDto {

  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

    @IsMobilePhone()
  public mobileNumber: string;  

  @IsString()
  public password: string;

}

export class UserActionDto{

  @IsArray()
  public userIds:number[]
}

export class UserVariableDto{

  @IsNumber()
  public tenantId:number
}

export class changePasswordDto{

  @IsArray()
  public userIds:number[]

   @IsNumber()
  public tenantId:number
}





