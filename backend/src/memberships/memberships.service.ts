import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';
import { Membership } from './entities/membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Package)
    private readonly packageRepository: Repository<Package>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
  ) { }

  // --- Package CRUD ---
  async createPackage(createPackageDto: CreatePackageDto) {
    const existing = await this.packageRepository.findOne({ where: { id: createPackageDto.id } });
    if (existing) {
      throw new BadRequestException(`Gói tập với mã #${createPackageDto.id} đã tồn tại!`);
    }
    const pkg = this.packageRepository.create(createPackageDto);
    return this.packageRepository.save(pkg);
  }

  async findAllPackages() {
    return this.packageRepository.find({
      relations: { memberships: true },
      order: { id: 'ASC' },
    });
  }

  async findOnePackage(id: string) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException(`Không tìm thấy gói tập với ID #${id}`);
    }
    return pkg;
  }

  async updatePackage(id: string, updatePackageDto: UpdatePackageDto) {
    await this.findOnePackage(id);
    await this.packageRepository.update(id, updatePackageDto);
    return this.findOnePackage(id);
  }

  async removePackage(id: string) {
    const pkg = await this.packageRepository.findOne({
      where: { id },
      relations: { memberships: true },
    });
    if (!pkg) {
      throw new NotFoundException(`Không tìm thấy gói tập với ID #${id}`);
    }
    if (pkg.memberships && pkg.memberships.length > 0) {
      pkg.isVisible = false;
      await this.packageRepository.save(pkg);
      return { message: 'Gói tập đã có hội viên sử dụng nên hệ thống đã tự động chuyển sang trạng thái ẩn (ngừng cung cấp mới) thay vì xóa hoàn toàn.' };
    }
    await this.packageRepository.remove(pkg);
    return { message: 'Xóa gói tập thành công' };
  }

  // --- Membership CRUD ---
  async create(createMembershipDto: CreateMembershipDto) {
    // Validate package exists
    const pkg = await this.findOnePackage(createMembershipDto.packageId);
    if (!pkg.isVisible) {
      throw new BadRequestException(`Gói tập #${createMembershipDto.packageId} đã ngừng cung cấp và không thể đăng ký mới!`);
    }

    if (createMembershipDto.totalSessions === undefined || createMembershipDto.totalSessions === null) {
      const totalSessions = pkg.ptSessions || 0;
      createMembershipDto.totalSessions = totalSessions;
      createMembershipDto.remainingSessions = totalSessions;
    }

    // Check if there is an active membership for this user
    const activeMembership = await this.findActiveByUserId(createMembershipDto.userId);
    let extraDays = 0;
    
    // Only expire active memberships if the new membership is active immediately
    const isNewActive = createMembershipDto.status === 'active' || !createMembershipDto.status;
    
    if (activeMembership && isNewActive) {
      const remainingTime = new Date(activeMembership.endDate).getTime() - Date.now();
      if (remainingTime > 0) {
        extraDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
      }

      const carryoverSessions = activeMembership.remainingSessions || 0;
      if (carryoverSessions > 0) {
        createMembershipDto.totalSessions = (createMembershipDto.totalSessions || 0) + carryoverSessions;
        createMembershipDto.remainingSessions = (createMembershipDto.remainingSessions || 0) + carryoverSessions;
      }

      // Expire/deactivate the old active membership
      activeMembership.status = 'expired';
      await this.membershipRepository.save(activeMembership);
    }

    // Calculate start date and end date
    if (extraDays > 0 && isNewActive) {
      const endDate = new Date(createMembershipDto.endDate);
      endDate.setDate(endDate.getDate() + extraDays);

      const y = endDate.getFullYear();
      const m = String(endDate.getMonth() + 1).padStart(2, '0');
      const d = String(endDate.getDate()).padStart(2, '0');
      createMembershipDto.endDate = `${y}-${m}-${d}`;
    }

    const membership = this.membershipRepository.create(createMembershipDto);
    return this.membershipRepository.save(membership);
  }

  async findAll() {
    return this.membershipRepository.find({
      relations: { user: true, package: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const membership = await this.membershipRepository.findOne({
      where: { id },
      relations: { user: true, package: true },
    });
    if (!membership) {
      throw new NotFoundException(`Không tìm thấy đăng ký hội viên với ID #${id}`);
    }
    return membership;
  }

  async update(id: number, updateMembershipDto: UpdateMembershipDto) {
    const existing = await this.findOne(id);
    if (updateMembershipDto.packageId) {
      await this.findOnePackage(updateMembershipDto.packageId);
    }

    // Check if we are activating a pending membership
    if (existing.status === 'paused' && updateMembershipDto.status === 'active') {
      // 1. Deactivate old active membership and calculate carryover days
      const activeMembership = await this.findActiveByUserId(existing.userId);
      let extraDays = 0;
      let carryoverSessions = 0;
      if (activeMembership && activeMembership.id !== existing.id) {
        const remainingTime = new Date(activeMembership.endDate).getTime() - Date.now();
        if (remainingTime > 0) {
          extraDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
        }
        carryoverSessions = activeMembership.remainingSessions || 0;
        activeMembership.status = 'expired';
        await this.membershipRepository.save(activeMembership);
      }

      // 2. Adjust sessions if there are carryover sessions
      if (carryoverSessions > 0) {
        updateMembershipDto.totalSessions = (existing.totalSessions || 0) + carryoverSessions;
        updateMembershipDto.remainingSessions = (existing.remainingSessions || 0) + carryoverSessions;
      }

      // 3. Adjust end date of the approved membership if there are carryover days
      if (extraDays > 0) {
        const currentEndDate = new Date(existing.endDate);
        currentEndDate.setDate(currentEndDate.getDate() + extraDays);
        
        const y = currentEndDate.getFullYear();
        const m = String(currentEndDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentEndDate.getDate()).padStart(2, '0');
        updateMembershipDto.endDate = `${y}-${m}-${d}`;
      }
    }

    await this.membershipRepository.update(id, updateMembershipDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const membership = await this.findOne(id);
    await this.membershipRepository.remove(membership);
    return { message: 'Xóa thông tin đăng ký hội viên thành công' };
  }

  async findActiveByUserId(userId: number) {
    return this.membershipRepository.findOne({
      where: { userId, status: 'active' },
      relations: { package: true },
      order: { endDate: 'DESC' },
    });
  }

  async findAllByUserId(userId: number) {
    return this.membershipRepository.find({
      where: { userId },
      relations: { package: true },
      order: { endDate: 'DESC' },
    });
  }

  async findMostRecentByUserId(userId: number) {
    return this.membershipRepository.findOne({
      where: { userId },
      relations: { package: true },
      order: { endDate: 'DESC' },
    });
  }
}
