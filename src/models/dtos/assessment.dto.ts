import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { QuestionType, ScoringType } from '../enums/assessment.enum';
import { Type } from 'class-transformer';

export class optionsDto {
	@IsString()
	@IsNotEmpty()
	public option: string;

	@IsBoolean()
	public isCorrectAnswer: boolean;

	@IsNumber()
	@IsOptional()
	public optionId: number;
}

export class questionData {
	@IsNumber()
	@IsOptional()
	public questionId: number;

	@IsString()
	@IsNotEmpty()
	public question: string;

	@IsEnum(QuestionType)
	public type: QuestionType;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => optionsDto)
	public options: optionsDto[];

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
	@IsNotEmpty()
	public tenantId: number;

	@IsNumber()
	public timed: number;

	@IsNumber()
	public pass: number;

	@IsOptional()
	@IsNumber()
	public score: number;

	@IsOptional()
	@IsArray()
	public skill: string[];

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => questionData)
	public questions: questionData[];
}

export class questionsBank {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => questionData)
	public questions: questionData[];
}
