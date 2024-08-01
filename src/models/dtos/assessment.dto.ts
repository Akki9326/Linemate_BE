import { IsEnum, IsNumber, IsString } from 'class-validator';
import { ScoringType } from '../enums/assessment.enum';

export class assessmentDto {
	@IsString()
	public name: string;

	@IsString()
	public description: string;

	@IsNumber()
	public totalQuestion: number;

	@IsEnum(ScoringType)
	public scoring: ScoringType;

	@IsNumber()
	public contentId: number;

	@IsNumber()
	public timed: number;

	@IsNumber()
	public pass: number;
}
