import { IsString, IsEmail, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { SortOrder } from '../enums/sort-order.enum';


export class ListRequestDto<T> {

    @IsNotEmpty()
    public page: number;

    @IsNotEmpty()
    public pageSize: number;

    @IsOptional()
    @IsString()
    public searchTerm: string;

    @IsOptional()
    @IsObject()
    public filter: any;

    @IsOptional()
    public sortField: string;

    @IsEnum(SortOrder)
    public sortOrder: SortOrder;

}

