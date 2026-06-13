import { IsNotEmpty, IsInt, IsString, IsOptional } from 'class-validator';

export class CreateWorkShiftDto {
  @IsNotEmpty()
  @IsInt()
  employeeId: number;

  @IsNotEmpty()
  @IsString()
  date: string; // YYYY-MM-DD

  @IsNotEmpty()
  @IsString()
  startTime: string; // HH:MM or HH:MM:SS

  @IsNotEmpty()
  @IsString()
  endTime: string; // HH:MM or HH:MM:SS

  @IsOptional()
  @IsString()
  roleShift?: string;
}
