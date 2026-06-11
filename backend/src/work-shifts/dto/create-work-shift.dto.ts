export class CreateWorkShiftDto {
  employeeId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM or HH:MM:SS
  endTime: string; // HH:MM or HH:MM:SS
  roleShift?: string;
}
