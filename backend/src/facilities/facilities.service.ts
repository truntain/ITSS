import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Facility } from './entities/facility.entity';
import { Equipment } from './entities/equipment.entity';
import { EquipmentReport } from './entities/equipment-report.entity';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateEquipmentReportDto } from './dto/create-equipment-report.dto';
import { UpdateEquipmentReportDto } from './dto/update-equipment-report.dto';

@Injectable()
export class FacilitiesService {
  constructor(
    @InjectRepository(Facility)
    private readonly facilityRepository: Repository<Facility>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(EquipmentReport)
    private readonly equipmentReportRepository: Repository<EquipmentReport>,
  ) {}

  // ==========================================
  // 1. NGHIỆP VỤ FACILITY (PHÒNG TẬP)
  // ==========================================
  async createFacility(createFacilityDto: CreateFacilityDto) {
    const facility = this.facilityRepository.create(createFacilityDto);
    return this.facilityRepository.save(facility);
  }

  async findAllFacilities() {
    return this.facilityRepository.find({
      relations: { equipment: true },
      order: { name: 'ASC' },
    });
  }

  async findOneFacility(id: number) {
    const facility = await this.facilityRepository.findOne({
      where: { id },
      relations: { equipment: true },
    });
    if (!facility) {
      throw new NotFoundException(`Không tìm thấy phòng tập với ID #${id}`);
    }
    return facility;
  }

  async updateFacility(id: number, updateFacilityDto: UpdateFacilityDto) {
    await this.findOneFacility(id);
    await this.facilityRepository.update(id, updateFacilityDto);
    return this.findOneFacility(id);
  }

  async removeFacility(id: number) {
    const facility = await this.findOneFacility(id);
    await this.facilityRepository.remove(facility);
    return { message: 'Xóa phòng tập thành công' };
  }

  // ==========================================
  // 2. NGHIỆP VỤ EQUIPMENT (THIẾT BỊ)
  // ==========================================
  async createEquipment(createEquipmentDto: CreateEquipmentDto) {
    const equipment = this.equipmentRepository.create(createEquipmentDto);
    return this.equipmentRepository.save(equipment);
  }

  async findAllEquipment() {
    return this.equipmentRepository.find({
      relations: { facility: true, reports: true },
      order: { code: 'ASC' },
    });
  }

  async findOneEquipment(id: number) {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: { facility: true, reports: true },
    });
    if (!equipment) {
      throw new NotFoundException(`Không tìm thấy thiết bị với ID #${id}`);
    }
    return equipment;
  }

  async updateEquipment(id: number, updateEquipmentDto: UpdateEquipmentDto) {
    await this.findOneEquipment(id);
    await this.equipmentRepository.update(id, updateEquipmentDto);
    return this.findOneEquipment(id);
  }

  async removeEquipment(id: number) {
    const equipment = await this.findOneEquipment(id);
    await this.equipmentRepository.remove(equipment);
    return { message: 'Xóa thiết bị thành công' };
  }

  // ==========================================
  // 3. NGHIỆP VỤ EQUIPMENT REPORT (BÁO CÁO HỎNG)
  // ==========================================
  async createEquipmentReport(createEquipmentReportDto: CreateEquipmentReportDto) {
    const report = this.equipmentReportRepository.create(createEquipmentReportDto);
    return this.equipmentReportRepository.save(report);
  }

  async findAllEquipmentReports() {
    return this.equipmentReportRepository.find({
      relations: { equipment: true, reporter: true },
      order: { reportedAt: 'DESC' },
    });
  }

  async findOneEquipmentReport(id: number) {
    const report = await this.equipmentReportRepository.findOne({
      where: { id },
      relations: { equipment: true, reporter: true },
    });
    if (!report) {
      throw new NotFoundException(`Không tìm thấy báo cáo hỏng thiết bị với ID #${id}`);
    }
    return report;
  }

  async updateEquipmentReport(id: number, updateEquipmentReportDto: UpdateEquipmentReportDto) {
    await this.findOneEquipmentReport(id);
    await this.equipmentReportRepository.update(id, updateEquipmentReportDto);
    return this.findOneEquipmentReport(id);
  }

  async removeEquipmentReport(id: number) {
    const report = await this.findOneEquipmentReport(id);
    await this.equipmentReportRepository.remove(report);
    return { message: 'Xóa báo cáo thành công' };
  }
}
