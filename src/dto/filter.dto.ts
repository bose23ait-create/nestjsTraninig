import {
  IsBooleanString,
  IsDateString,
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductFilterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  createdDate?: string;

  @IsOptional()
  @IsBooleanString()
  stockAvailable?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit = 8;

  @IsOptional()
  @IsIn(['name', 'price', 'stock'])
  sortBy: 'name' | 'price' | 'stock' = 'name';
}
