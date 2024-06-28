import { IsNumber, IsOptional, IsString } from 'class-validator';

export class userTypeDto {

  @IsString()
  public type: string;

  @IsNumber()
  @IsOptional()
  public roleId: number;
}
