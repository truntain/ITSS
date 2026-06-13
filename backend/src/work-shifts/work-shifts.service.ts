import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { WorkShift } from './entities/work-shift.entity';
import { User } from '../users/entities/user.entity';
import { CreateWorkShiftDto } from './dto/create-work-shift.dto';

@Injectable()
export class WorkShiftsService {
  constructor(
    @InjectRepository(WorkShift)
    private readonly workShiftRepository: Repository<WorkShift>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createWorkShiftDto: CreateWorkShiftDto): Promise<WorkShift> {
    const { employeeId, date, startTime, endTime, roleShift } = createWorkShiftDto;

    // Verify employee exists
    const employee = await this.userRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const shift = this.workShiftRepository.create({
      employeeId,
      date,
      startTime,
      endTime,
      roleShift,
    });

    const savedShift = await this.workShiftRepository.save(shift);
    savedShift.employee = employee;
    return savedShift;
  }

  async bulkCreate(createDtos: CreateWorkShiftDto[]): Promise<WorkShift[]> {
    const shifts: WorkShift[] = [];

    for (const dto of createDtos) {
      const { employeeId, date, startTime, endTime, roleShift } = dto;
      
      const employee = await this.userRepository.findOne({ where: { id: employeeId } });
      if (!employee) {
        throw new NotFoundException(`Employee with ID ${employeeId} not found`);
      }

      const shift = this.workShiftRepository.create({
        employeeId,
        date,
        startTime,
        endTime,
        roleShift,
      });
      shifts.push(shift);
    }

    const savedShifts = await this.workShiftRepository.save(shifts);
    
    // Load employee details for each saved shift
    for (const shift of savedShifts) {
      const emp = await this.userRepository.findOne({ where: { id: shift.employeeId } });
      if (emp) {
        shift.employee = emp;
      }
    }

    return savedShifts;
  }

  async findBetweenDates(
    startDate: string,
    endDate: string,
    employeeId?: number,
  ): Promise<WorkShift[]> {
    const whereCondition: any = {
      date: Between(startDate, endDate),
    };

    if (employeeId) {
      whereCondition.employeeId = employeeId;
    }

    return this.workShiftRepository.find({
      where: whereCondition,
      relations: { employee: true },
      order: {
        date: 'ASC',
        startTime: 'ASC',
      },
    });
  }

  async remove(id: number): Promise<void> {
    const result = await this.workShiftRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Work shift with ID ${id} not found`);
    }
  }
}
