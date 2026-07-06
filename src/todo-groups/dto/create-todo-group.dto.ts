import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTodoGroupDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;
}
