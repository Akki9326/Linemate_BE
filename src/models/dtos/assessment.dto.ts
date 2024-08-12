import { IsArray, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionType, ScoringType } from '../enums/assessment.enum';
import { Type } from 'class-transformer';

export class questionData {
	@IsString()
	public question: string;

	@IsEnum(QuestionType)
	public type: QuestionType;

	@IsArray()
	public options: string[];

	@IsString()
	@IsOptional()
	public answer: string;

	@IsNumber()
	@IsOptional()
	public score: number;
}

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

	@IsOptional()
	@IsNumber()
	public score: number;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => questionData)
	public questions: questionData[];
}
