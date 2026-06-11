import { Controller, Get, Post, Body, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { WorkShiftsService } from './work-shifts.service';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('work-shifts')
export class WorkShiftsController {
  constructor(private readonly workShiftsService: WorkShiftsService) {}

  @Post()
  create(@Body() createWorkShiftDto: CreateWorkShiftDto) {
    return this.workShiftsService.create(createWorkShiftDto);
  }

  @Post('bulk')
  bulkCreate(@Body() createWorkShiftDtos: CreateWorkShiftDto[]) {
    return this.workShiftsService.bulkCreate(createWorkShiftDtos);
  }

  @Get()
  findBetweenDates(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('employeeId') employeeId?: string,
  ) {
    const empId = employeeId ? parseInt(employeeId, 10) : undefined;
    return this.workShiftsService.findBetweenDates(startDate, endDate, empId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.workShiftsService.remove(id);
  }
}
