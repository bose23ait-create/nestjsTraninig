import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	@Transform(({ value }) => Array.isArray(value) ? value : [value])
	existingImages?: string[];
}
