import { IsOptional, IsString, IsIn, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryTodoDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['all', 'completed', 'pending'])
  status?: 'all' | 'completed' | 'pending';

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title'])
  sortBy?: 'createdAt' | 'updatedAt' | 'title';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @Transform(({ value }) => value === undefined ? undefined : (value === 'true' || value === true))
  @IsBoolean()
  isImportant?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === undefined ? undefined : (value === 'true' || value === true))
  @IsBoolean()
  isMyDay?: boolean;
}
