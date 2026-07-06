import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryTodoDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['all', 'completed', 'pending'])
  status?: 'all' | 'completed' | 'pending';

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @IsString()
  isImportant?: string; // 'true' or 'false'

  @IsOptional()
  @IsString()
  isMyDay?: string; // 'true' or 'false'
}
