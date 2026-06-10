"use client";

import { Search, UserPlus, X, Mail, Phone, Calendar, Activity, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Quản lý' | 'PT' | 'Lễ tân';
  status: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc';
  avatar: string;
  joinDate: string;
  attendanceRate: number;
}

const initialEmployees: Employee[] = [
  { id: 'NV001', name: 'Nguyễn Văn An', email: 'an.nv@gympro.vn', phone: '0901234567', role: 'Quản lý', status: 'Đang làm việc', avatar: 'NA', joinDate: '01/01/2024', attendanceRate: 98 },
  { id: 'NV002', name: 'Trần Thị Bình', email: 'binh.tt@gympro.vn', phone: '0902345678', role: 'PT', status: 'Đang làm việc', avatar: 'TB', joinDate: '15/02/2024', attendanceRate: 95 },
  { id: 'NV003', name: 'Lê Minh Cường', email: 'cuong.lm@gympro.vn', phone: '0903456789', role: 'Lễ tân', status: 'Đang làm việc', avatar: 'LC', joinDate: '10/03/2024', attendanceRate: 92 },
  { id: 'NV004', name: 'Phạm Thu Dung', email: 'dung.pt@gympro.vn', phone: '0904567890', role: 'PT', status: 'Nghỉ phép', avatar: 'PD', joinDate: '20/03/2024', attendanceRate: 88 },
  { id: 'NV005', name: 'Hoàng Văn Em', email: 'em.hv@gympro.vn', phone: '0905678901', role: 'Quản lý', status: 'Đã nghỉ việc', avatar: 'HE', joinDate: '05/01/2023', attendanceRate: 85 },
];

// Mock attendance heatmap data (30 days)
const attendanceHeatmap = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  attended: Math.random() > 0.15 // 85% attendance rate
}));

// Status Dropdown Component with Portal
interface StatusDropdownProps {
  employee: Employee;
  onStatusChange: (employeeId: string, newStatus: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc') => void;
  getStatusBadge: (status: string) => string;
}

function StatusDropdown({ employee, onStatusChange, getStatusBadge }: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, openUpward: false });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 130; // Approximate height of dropdown menu
      const spaceBelow = window.innerHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownPosition({
        top: openUpward ? buttonRect.top - dropdownHeight : buttonRect.bottom + 4,
        left: buttonRect.left,
        openUpward,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInsideButton = buttonRef.current?.contains(target);
      const isClickInsideDropdown = dropdownRef.current?.contains(target);

      if (!isClickInsideButton && !isClickInsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (newStatus: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc') => {
    onStatusChange(employee.id, newStatus);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(employee.status)} hover:opacity-80 transition-opacity flex items-center gap-1`}
      >
        {employee.status}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-white border border-slate-200 rounded-lg shadow-lg z-[100] min-w-[140px] py-1 animate-dropdown-in"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            transformOrigin: dropdownPosition.openUpward ? 'bottom left' : 'top left',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleStatusSelect('Đang làm việc')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between"
          >
            <span className="text-emerald-700">Đang làm việc</span>
            {employee.status === 'Đang làm việc' && <Check className="w-4 h-4 text-emerald-700" />}
          </button>
          <button
            onClick={() => handleStatusSelect('Nghỉ phép')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-50 transition-colors flex items-center justify-between"
          >
            <span className="text-yellow-700">Nghỉ phép</span>
            {employee.status === 'Nghỉ phép' && <Check className="w-4 h-4 text-yellow-700" />}
          </button>
          <button
            onClick={() => handleStatusSelect('Đã nghỉ việc')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between"
          >
            <span className="text-gray-700">Đã nghỉ việc</span>
            {employee.status === 'Đã nghỉ việc' && <Check className="w-4 h-4 text-gray-700" />}
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [activeTab, setActiveTab] = useState<'all' | 'working' | 'leave' | 'quit'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerTab, setDrawerTab] = useState<'profile' | 'attendance'>('profile');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as '' | 'Quản lý' | 'PT' | 'Lễ tân',
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    role: false,
  });

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'working' ? emp.status === 'Đang làm việc' :
      activeTab === 'leave' ? emp.status === 'Nghỉ phép' :
      emp.status === 'Đã nghỉ việc';

    return matchesSearch && matchesTab;
  });

  const handleAddEmployee = () => {
    // Validate form
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
      phone: !formData.phone.trim(),
      role: !formData.role,
    };

    setFormErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(error => error)) {
      return;
    }

    // Generate employee ID
    const newId = `NV${String(employees.length + 1).padStart(3, '0')}`;

    // Generate avatar initials
    const nameParts = formData.name.trim().split(' ');
    const avatar = nameParts.length >= 2
      ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
      : formData.name.slice(0, 2);

    const newEmployee: Employee = {
      id: newId,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role as 'Quản lý' | 'PT' | 'Lễ tân',
      status: 'Đang làm việc', // Default status
      avatar: avatar.toUpperCase(),
      joinDate: new Date().toLocaleDateString('vi-VN'),
      attendanceRate: 100,
    };

    setEmployees([...employees, newEmployee]);
    setShowAddModal(false);

    // Reset form
    setFormData({ name: '', email: '', phone: '', role: '' });
    setFormErrors({ name: false, email: false, phone: false, role: false });

    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleStatusChange = (employeeId: string, newStatus: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc') => {
    setEmployees(employees.map(emp =>
      emp.id === employeeId ? { ...emp, status: newStatus } : emp
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Đang làm việc':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Nghỉ phép':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Đã nghỉ việc':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getRoleBadge = (role: string) => {
    return 'bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)]';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Quản lý nhân sự</h2>
          <p className="text-[var(--muted-foreground)]">Danh sách nhân viên và thông tin chi tiết</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          Thêm nhân sự
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)] shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Tất cả ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('working')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'working'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Đang làm việc ({employees.filter(e => e.status === 'Đang làm việc').length})
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'leave'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Nghỉ phép ({employees.filter(e => e.status === 'Nghỉ phép').length})
        </button>
        <button
          onClick={() => setActiveTab('quit')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'quit'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Đã nghỉ việc ({employees.filter(e => e.status === 'Đã nghỉ việc').length})
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--secondary)] border-b border-[var(--border)] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Mã NV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Họ và tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Chức vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-[var(--foreground)]">{employee.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                        {employee.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{employee.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(employee.role)}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-[var(--foreground)]">{employee.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      employee={employee}
                      onStatusChange={handleStatusChange}
                      getStatusBadge={getStatusBadge}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium">
                      Xem chi tiết →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Drawer */}
      {selectedEmployee && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedEmployee(null)}
          ></div>

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[var(--card)] shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--card)] z-10">
              <h3 className="text-xl font-bold text-[var(--foreground)]">Thông tin nhân viên</h3>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--border)]">
              <button
                onClick={() => setDrawerTab('profile')}
                className={`flex-1 px-4 py-3 font-medium transition-all ${
                  drawerTab === 'profile'
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-[#64748B] hover:text-[var(--foreground)]'
                }`}
              >
                Hồ sơ cá nhân
              </button>
              <button
                onClick={() => setDrawerTab('attendance')}
                className={`flex-1 px-4 py-3 font-medium transition-all ${
                  drawerTab === 'attendance'
                    ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                    : 'text-[#64748B] hover:text-[var(--foreground)]'
                }`}
              >
                Lịch sử chấm công
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {drawerTab === 'profile' ? (
                <>
                  {/* Avatar */}
                  <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-bold text-3xl mb-3">
                      {selectedEmployee.avatar}
                    </div>
                    <h4 className="text-xl font-bold text-[var(--foreground)]">{selectedEmployee.name}</h4>
                    <p className="text-sm text-[var(--muted-foreground)]">{selectedEmployee.role}</p>
                  </div>

                  {/* Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                      <Mail className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{selectedEmployee.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                      <Phone className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Số điện thoại</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{selectedEmployee.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                      <Calendar className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Ngày vào làm</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{selectedEmployee.joinDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                      <Activity className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <p className="text-xs text-[var(--muted-foreground)]">Tỷ lệ chấm công</p>
                        <p className="text-sm font-medium text-[var(--foreground)]">{selectedEmployee.attendanceRate}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Heatmap */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--foreground)] mb-3">Lịch sử chấm công (30 ngày gần nhất)</h5>
                    <div className="grid grid-cols-10 gap-1">
                      {attendanceHeatmap.map((day, index) => (
                        <div
                          key={index}
                          className={`h-8 rounded ${
                            day.attended
                              ? 'bg-emerald-500'
                              : 'bg-gray-200'
                          }`}
                          title={`Ngày ${day.day}: ${day.attended ? 'Có mặt' : 'Vắng'}`}
                        ></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                        <span>Có mặt</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-200 rounded"></div>
                        <span>Vắng mặt</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-700 mb-1">Đúng giờ</p>
                      <p className="text-2xl font-bold text-emerald-900">18</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-700 mb-1">Đi muộn</p>
                      <p className="text-2xl font-bold text-amber-900">3</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 mb-1">Nghỉ phép</p>
                      <p className="text-2xl font-bold text-blue-900">2</p>
                    </div>
                  </div>

                  {/* Attendance Table */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--foreground)] mb-3">Chi tiết chấm công</h5>
                    <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-[var(--secondary)]">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--foreground)]">Ngày</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--foreground)]">Check-in</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--foreground)]">Check-out</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-[var(--foreground)]">Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                          <tr>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">13/05/2026</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">08:00</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">17:30</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                Đúng giờ
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">12/05/2026</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">08:15</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">17:45</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                                Đi muộn
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">11/05/2026</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">07:55</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">17:20</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                Đúng giờ
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">10/05/2026</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">08:00</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">17:30</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                Đúng giờ
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">09/05/2026</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">08:20</td>
                            <td className="px-4 py-3 text-sm text-[var(--foreground)]">17:35</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                                Đi muộn
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowAddModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Thêm nhân sự mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setFormErrors({ ...formErrors, name: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {formErrors.name && <p className="text-xs text-red-500 mt-1">Vui lòng nhập họ và tên</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="VD: employee@gympro.vn"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setFormErrors({ ...formErrors, email: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {formErrors.email && <p className="text-xs text-red-500 mt-1">Vui lòng nhập email hợp lệ</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Chức vụ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => {
                      setFormData({ ...formData, role: e.target.value as 'Quản lý' | 'PT' | 'Lễ tân' });
                      setFormErrors({ ...formErrors, role: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.role ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  >
                    <option value="">-- Chọn chức vụ --</option>
                    <option value="Quản lý">Quản lý</option>
                    <option value="PT">PT</option>
                    <option value="Lễ tân">Lễ tân</option>
                  </select>
                  {formErrors.role && <p className="text-xs text-red-500 mt-1">Vui lòng chọn chức vụ</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="VD: 0901234567"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setFormErrors({ ...formErrors, phone: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.phone ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {formErrors.phone && <p className="text-xs text-red-500 mt-1">Vui lòng nhập số điện thoại</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddEmployee}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn">
          <Check className="w-5 h-5" />
          <span className="font-medium">Thêm nhân sự thành công!</span>
        </div>
      )}

      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        @keyframes dropdown-in {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-4px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-dropdown-in {
          animation: dropdown-in 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}
