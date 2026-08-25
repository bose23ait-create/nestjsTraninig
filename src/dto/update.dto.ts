import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }: TransformFnParams): string[] =>
    Array.isArray(value) ? (value as string[]) : [value as string],
  )
  existingImages?: string[];
}
