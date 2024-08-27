import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CohortDto {
	@IsString()
	@IsNotEmpty()
	public name: string;

	@IsString()
	@IsOptional()
	public description: string;

	@IsArray()
	@IsNotEmpty()
	public userIds: number[];

	@IsNumber()
	@IsNotEmpty()
	public tenantId: number;

	@IsArray()
	@IsOptional()
	public rules: object[];
}

export class AssignCohort {
	@IsArray()
	@IsNotEmpty()
	public userIds: number[];

	@IsArray()
	@IsNotEmpty()
	public cohortIds: number[];
}
