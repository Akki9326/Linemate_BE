import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CohortDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	@IsOptional()
	public description: string;

	@IsArray()
	@IsOptional()
	public userIds: number[];

	@IsNumber()
	@IsNotEmpty()
	public tenantId: number;
}

export class AssignCohort {
	@IsArray()
	@IsOptional()
	public userIds: number[];

	@IsArray()
	@IsOptional()
	public cohortIds: number[];
}
