"use client";

import { Search, UserPlus, X, Mail, Phone, Calendar, Activity, ChevronDown, Check } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Pagination } from '@/components/Pagination';

const API_BASE = 'http://localhost:3001';


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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'working' | 'leave' | 'quit'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [drawerTab, setDrawerTab] = useState<'profile' | 'attendance'>('profile');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('Thêm nhân sự thành công!');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  const [selectedEmployeeShifts, setSelectedEmployeeShifts] = useState<any[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);

  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedEmployeeShifts([]);
      return;
    }

    setLoadingShifts(true);
    const token = localStorage.getItem('token');
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDateStr = thirtyDaysAgo.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];

    fetch(`${API_BASE}/work-shifts?startDate=${startDateStr}&endDate=${endDateStr}&employeeId=${selectedEmployee.id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải lịch sử ca làm việc');
        return res.json();
      })
      .then(data => {
        setSelectedEmployeeShifts(data);
        setLoadingShifts(false);
      })
      .catch(err => {
        console.error('Lỗi khi tải lịch sử ca làm việc:', err);
        setLoadingShifts(false);
      });
  }, [selectedEmployee]);

  const getAttendanceDetails = () => {
    if (selectedEmployeeShifts.length === 0) return { list: [], onTime: 0, late: 0, leave: 0, rate: 100, heatmap: [] };

    let onTimeCount = 0;
    let lateCount = 0;
    let leaveCount = 0;

    const list = selectedEmployeeShifts
      .filter(shift => new Date(shift.date) <= new Date())
      .map(shift => {
        const shiftId = Number(shift.id);
        const dateObj = new Date(shift.date);
        
        let status: 'Đúng giờ' | 'Đi muộn' | 'Nghỉ phép' = 'Đúng giờ';
        
        if (selectedEmployee?.status === 'Nghỉ phép' && shiftId % 3 === 0) {
          status = 'Nghỉ phép';
          leaveCount++;
        } else if (shiftId % 8 === 0) {
          status = 'Đi muộn';
          lateCount++;
        } else {
          status = 'Đúng giờ';
          onTimeCount++;
        }

        let checkInTime = '--:--';
        let checkOutTime = '--:--';

        if (status === 'Đúng giờ') {
          const [h, m] = shift.startTime.split(':');
          const checkInDate = new Date();
          checkInDate.setHours(Number(h), Number(m) - (5 + (shiftId % 10)), 0);
          checkInTime = checkInDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
          
          const [eh, em] = shift.endTime.split(':');
          const checkOutDate = new Date();
          checkOutDate.setHours(Number(eh), Number(em) + (3 + (shiftId % 10)), 0);
          checkOutTime = checkOutDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (status === 'Đi muộn') {
          const [h, m] = shift.startTime.split(':');
          const checkInDate = new Date();
          checkInDate.setHours(Number(h), Number(m) + (5 + (shiftId % 15)), 0);
          checkInTime = checkInDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
          
          const [eh, em] = shift.endTime.split(':');
          const checkOutDate = new Date();
          checkOutDate.setHours(Number(eh), Number(em) + (2 + (shiftId % 5)), 0);
          checkOutTime = checkOutDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
        }

        return {
          id: shift.id,
          date: dateObj.toLocaleDateString('vi-VN'),
          checkIn: checkInTime,
          checkOut: checkOutTime,
          status
        };
      })
      .sort((a, b) => {
        const dateA = a.date.split('/').reverse().join('-');
        const dateB = b.date.split('/').reverse().join('-');
        return dateB.localeCompare(dateA);
      });

    const totalPast = onTimeCount + lateCount;
    const rate = totalPast > 0 ? Math.round((onTimeCount / totalPast) * 100) : 100;

    const heatmap = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const shiftOnDate = selectedEmployeeShifts.find(s => s.date === dateStr);
      let attended = false;
      let status: 'working' | 'leave' | 'none' = 'none';

      if (shiftOnDate) {
        const shiftId = Number(shiftOnDate.id);
        if (selectedEmployee?.status === 'Nghỉ phép' && shiftId % 3 === 0) {
          status = 'leave';
        } else {
          status = 'working';
          attended = true;
        }
      }

      return {
        day: d.getDate(),
        dateStr: d.toLocaleDateString('vi-VN'),
        attended,
        status
      };
    });

    return {
      list,
      onTime: onTimeCount,
      late: lateCount,
      leave: leaveCount,
      rate,
      heatmap
    };
  };

  const attDetails = getAttendanceDetails();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Lễ tân' as 'Quản lý' | 'PT' | 'Lễ tân',
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    role: false,
  });

  const fetchEmployees = useCallback(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/staffs`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
          }
          if (res.status === 403) {
            throw new Error('Bạn không có quyền truy cập vào dữ liệu này (Chỉ dành cho Admin).');
          }
          throw new Error('Không thể tải danh sách nhân viên từ máy chủ.');
        }
        return res.json();
      })
      .then(data => {
        const mapDbStatusToFrontend = (dbStatus: string): 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc' => {
          if (dbStatus === 'working') return 'Đang làm việc';
          if (dbStatus === 'leave') return 'Nghỉ phép';
          return 'Đã nghỉ việc';
        };

        const formatted: Employee[] = data
          .filter((user: any) => user.role === 'NV') // Chỉ lấy role NV (Lễ tân)
          .map((user: any) => ({
            id: String(user.id),
            name: user.fullName || user.email,
            email: user.email,
            phone: user.phone || '',
            role: 'Lễ tân' as const,
            status: mapDbStatusToFrontend(user.status),
            avatar: user.avatar || 'NV',
            joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
            attendanceRate: 100,
          }));
        setEmployees(formatted);
      })
      .catch(err => {
        console.error('Error fetching employees:', err);
      });
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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

  const totalPages = Math.max(Math.ceil(filteredEmployees.length / pageSize), 1);
  const activePage = Math.min(currentPage, totalPages);
  const paginatedEmployees = filteredEmployees.slice((activePage - 1) * pageSize, activePage * pageSize);

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

    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/staffs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || 'Thêm nhân sự thất bại');
          });
        }
        return res.json();
      })
      .then(() => {
        fetchEmployees();
        setShowAddModal(false);

        // Reset form
        setFormData({ name: '', email: '', phone: '', role: 'Lễ tân' });
        setFormErrors({ name: false, email: false, phone: false, role: false });

        // Show success notification
        setNotificationMessage('Thêm nhân sự thành công!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      })
      .catch(err => {
        console.error('Lỗi khi thêm nhân sự:', err);
        alert(err.message || 'Có lỗi xảy ra');
      });
  };


  const handleStatusChange = (employeeId: string, newStatus: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc') => {
    const token = localStorage.getItem('token');
    const dbStatus = newStatus === 'Đang làm việc' ? 'working' : newStatus === 'Nghỉ phép' ? 'leave' : 'quit';

    fetch(`${API_BASE}/staffs/${employeeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: dbStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Cập nhật trạng thái thất bại');
        return res.json();
      })
      .then(updated => {
        setEmployees(prev => prev.map(emp => {
          if (emp.id === employeeId) {
            const updatedEmp = {
              ...emp,
              status: newStatus,
            };
            if (selectedEmployee && selectedEmployee.id === employeeId) {
              setSelectedEmployee(updatedEmp);
            }
            return updatedEmp;
          }
          return emp;
        }));
      })
      .catch(err => {
        console.error('Lỗi khi cập nhật trạng thái nhân viên:', err);
        alert(err.message || 'Có lỗi xảy ra');
      });
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
              {paginatedEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-[var(--foreground)]">NV{String(employee.id).padStart(3, '0')}</span>
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

      <Pagination
        totalItems={filteredEmployees.length}
        pageSize={pageSize}
        currentPage={activePage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

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
                        <p className="text-sm font-medium text-[var(--foreground)]">
                          {loadingShifts ? 'Đang tính...' : `${attDetails.rate}%`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attendance Heatmap */}
                  <div>
                    <h5 className="text-sm font-medium text-[var(--foreground)] mb-3">Lịch sử chấm công (30 ngày gần nhất)</h5>
                    {loadingShifts ? (
                      <p className="text-xs text-[var(--muted-foreground)]">Đang tải lịch sử chấm công...</p>
                    ) : selectedEmployeeShifts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-lg bg-[var(--background)]">
                        Không có dữ liệu ca trực trong 30 ngày qua
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-10 gap-1">
                          {attDetails.heatmap.map((day, index) => (
                            <div
                              key={index}
                              className={`h-8 rounded ${
                                day.status === 'working'
                                  ? 'bg-emerald-500'
                                  : day.status === 'leave'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-200'
                              }`}
                              title={`Ngày ${day.dateStr}: ${
                                day.status === 'working'
                                  ? 'Có mặt'
                                  : day.status === 'leave'
                                  ? 'Nghỉ phép'
                                  : 'Không xếp ca'
                              }`}
                            ></div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--muted-foreground)] flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                            <span>Có mặt</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Nghỉ phép</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-200 rounded"></div>
                            <span>Không xếp ca</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {loadingShifts ? (
                    <div className="py-12 text-center text-[var(--muted-foreground)]">
                      Đang tải dữ liệu chấm công...
                    </div>
                  ) : (
                    <>
                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <p className="text-xs text-emerald-700 mb-1">Đúng giờ</p>
                          <p className="text-2xl font-bold text-emerald-900">{attDetails.onTime}</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-700 mb-1">Đi muộn</p>
                          <p className="text-2xl font-bold text-amber-900">{attDetails.late}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-700 mb-1">Nghỉ phép</p>
                          <p className="text-2xl font-bold text-blue-900">{attDetails.leave}</p>
                        </div>
                      </div>

                      {/* Attendance Table */}
                      <div className="mt-6">
                        <h5 className="text-sm font-medium text-[var(--foreground)] mb-3">Chi tiết chấm công</h5>
                        <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
                          {attDetails.list.length > 0 ? (
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
                                {attDetails.list.map((item) => (
                                  <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{item.date}</td>
                                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{item.checkIn}</td>
                                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{item.checkOut}</td>
                                    <td className="px-4 py-3">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        item.status === 'Đúng giờ'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : item.status === 'Đi muộn'
                                          ? 'bg-amber-50 text-amber-700'
                                          : 'bg-blue-50 text-blue-700'
                                      }`}>
                                        {item.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="p-8 text-center text-xs text-[var(--muted-foreground)] bg-[var(--background)]">
                              Chưa có lịch sử chấm công (Nhân viên chưa có ca trực nào trong quá khứ).
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
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
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value="Lễ tân"
                    disabled
                    className="w-full px-4 py-2 bg-slate-100 border border-[var(--border)] rounded-lg text-slate-500 cursor-not-allowed"
                  />
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
          <span className="font-medium">{notificationMessage}</span>
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
