"use client";

import { Search, UserPlus, X, Mail, Phone, Calendar, Activity, ChevronDown, Check, User, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Pagination } from '@/components/Pagination';

const API_BASE = 'http://localhost:3001';

interface Trainer {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'PT';
  status: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc';
  avatar: string;
  joinDate: string;
  attendanceRate: number;
  birthDate: string;
  gender: string;
}

// Status Dropdown Component with Portal
interface StatusDropdownProps {
  trainer: Trainer;
  onStatusChange: (trainerId: string, newStatus: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc') => void;
  getStatusBadge: (status: string) => string;
}

function StatusDropdown({ trainer, onStatusChange, getStatusBadge }: StatusDropdownProps) {
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
    onStatusChange(trainer.id, newStatus);
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
        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(trainer.status)} hover:opacity-80 transition-opacity flex items-center gap-1 cursor-pointer`}
      >
        {trainer.status}
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
            className="w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors flex items-center justify-between cursor-pointer text-slate-800"
          >
            <span className="text-emerald-700">Đang làm việc</span>
            {trainer.status === 'Đang làm việc' && <Check className="w-4 h-4 text-emerald-700" />}
          </button>
          <button
            onClick={() => handleStatusSelect('Nghỉ phép')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-yellow-50 transition-colors flex items-center justify-between cursor-pointer text-slate-800"
          >
            <span className="text-yellow-700">Nghỉ phép</span>
            {trainer.status === 'Nghỉ phép' && <Check className="w-4 h-4 text-yellow-700" />}
          </button>
          <button
            onClick={() => handleStatusSelect('Đã nghỉ việc')}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between cursor-pointer text-slate-800"
          >
            <span className="text-gray-700">Đã nghỉ việc</span>
            {trainer.status === 'Đã nghỉ việc' && <Check className="w-4 h-4 text-gray-700" />}
          </button>
        </div>,
        document.body
      )}
    </>
  );
}

export function TrainersPage() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'working' | 'leave' | 'quit'>('all');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('Thêm huấn luyện viên thành công!');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);



  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'PT' as 'PT',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    role: false,
    password: false,
    confirmPassword: false,
  });

  const fetchTrainers = useCallback(() => {
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
          throw new Error('Không thể tải danh sách huấn luyện viên từ máy chủ.');
        }
        return res.json();
      })
      .then(data => {
        const mapDbStatusToFrontend = (dbStatus: string): 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc' => {
          if (dbStatus === 'working') return 'Đang làm việc';
          if (dbStatus === 'leave') return 'Nghỉ phép';
          return 'Đã nghỉ việc';
        };

        const formatted: Trainer[] = data
          .filter((user: any) => user.role === 'PT') // Lọc chỉ lấy HLV (PT)
          .map((user: any) => {
            const mapGender = (g: string): string => {
              if (g === 'male') return 'Nam';
              if (g === 'female') return 'Nữ';
              if (g === 'other') return 'Khác';
              return 'Chưa cập nhật';
            };
            return {
              id: String(user.id),
              name: user.fullName || user.email,
              email: user.email,
              phone: user.phone || '',
              role: 'PT' as const,
              status: mapDbStatusToFrontend(user.status),
              avatar: user.avatar || 'PT',
              joinDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '',
              attendanceRate: 100,
              birthDate: user.birthDate ? new Date(user.birthDate).toLocaleDateString('vi-VN') : 'Chưa cập nhật',
              gender: mapGender(user.gender || ''),
            };
          });
        setTrainers(formatted);
      })
      .catch(err => {
        console.error('Error fetching trainers:', err);
      });
  }, []);

  useEffect(() => {
    fetchTrainers();
  }, [fetchTrainers]);

  const filteredTrainers = trainers.filter(pt => {
    const matchesSearch = pt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pt.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'working' ? pt.status === 'Đang làm việc' :
      activeTab === 'leave' ? pt.status === 'Nghỉ phép' :
      pt.status === 'Đã nghỉ việc';

    return matchesSearch && matchesTab;
  });

  const totalPages = Math.max(Math.ceil(filteredTrainers.length / pageSize), 1);
  const activePage = Math.min(currentPage, totalPages);
  const paginatedTrainers = filteredTrainers.slice((activePage - 1) * pageSize, activePage * pageSize);

  const handleAddTrainer = () => {
    // Validate form
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
      phone: !formData.phone.trim(),
      role: !formData.role,
      password: !formData.password || formData.password.length < 6,
      confirmPassword: !formData.confirmPassword || formData.confirmPassword !== formData.password,
    };

    setFormErrors(errors);

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
        role: 'PT', // Send PT role to backend
        password: formData.password,
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || 'Thêm huấn luyện viên thất bại');
          });
        }
        return res.json();
      })
      .then(() => {
        fetchTrainers();
        setShowAddModal(false);

        // Reset form
        setFormData({ name: '', email: '', phone: '', role: 'PT', password: '', confirmPassword: '' });
        setFormErrors({ name: false, email: false, phone: false, role: false, password: false, confirmPassword: false });

        // Show success notification
        setNotificationMessage('Thêm huấn luyện viên thành công!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      })
      .catch(err => {
        console.error('Lỗi khi thêm huấn luyện viên:', err);
        alert(err.message || 'Có lỗi xảy ra');
      });
  };

  const handleDeleteTrainer = (trainerId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa huấn luyện viên này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/staffs/${trainerId}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Xóa huấn luyện viên thất bại');
        }
        return res.json();
      })
      .then(() => {
        setSelectedTrainer(null);
        fetchTrainers();
        setNotificationMessage('Xóa huấn luyện viên thành công!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      })
      .catch(err => {
        console.error('Lỗi khi xóa huấn luyện viên:', err);
        alert(err.message || 'Có lỗi xảy ra');
      });
  };

  const handleStatusChange = (trainerId: string, newStatus: 'Đang làm việc' | 'Nghỉ phép' | 'Đã nghỉ việc') => {
    const token = localStorage.getItem('token');
    const dbStatus = newStatus === 'Đang làm việc' ? 'working' : newStatus === 'Nghỉ phép' ? 'leave' : 'quit';

    fetch(`${API_BASE}/staffs/${trainerId}`, {
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
        setTrainers(prev => prev.map(pt => {
          if (pt.id === trainerId) {
            const updatedPt = {
              ...pt,
              status: newStatus,
            };
            if (selectedTrainer && selectedTrainer.id === trainerId) {
              setSelectedTrainer(updatedPt);
            }
            return updatedPt;
          }
          return pt;
        }));
      })
      .catch(err => {
        console.error('Lỗi khi cập nhật trạng thái huấn luyện viên:', err);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Quản lý huấn luyện viên</h2>
          <p className="text-[var(--muted-foreground)]">Danh sách PT (Huấn luyện viên cá nhân) và thông tin hoạt động</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          Thêm huấn luyện viên
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[var(--card)] p-1 rounded-lg border border-[var(--border)] shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'all'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Tất cả ({trainers.length})
        </button>
        <button
          onClick={() => setActiveTab('working')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'working'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Đang làm việc ({trainers.filter(e => e.status === 'Đang làm việc').length})
        </button>
        <button
          onClick={() => setActiveTab('leave')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'leave'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Nghỉ phép ({trainers.filter(e => e.status === 'Nghỉ phép').length})
        </button>
        <button
          onClick={() => setActiveTab('quit')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${
            activeTab === 'quit'
              ? 'bg-[var(--primary)] text-white'
              : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)]'
          }`}
        >
          Đã nghỉ việc ({trainers.filter(e => e.status === 'Đã nghỉ việc').length})
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
                  Mã HLV
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
              {paginatedTrainers.map((trainer) => (
                <tr
                  key={trainer.id}
                  className="hover:bg-[var(--secondary)] transition-colors cursor-pointer"
                  onClick={() => setSelectedTrainer(trainer)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-[var(--foreground)]">PT{String(trainer.id).padStart(3, '0')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                        {trainer.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{trainer.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{trainer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-orange-50 text-orange-700 border-orange-200">
                      Huấn luyện viên
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-[var(--foreground)]">{trainer.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      trainer={trainer}
                      onStatusChange={handleStatusChange}
                      getStatusBadge={getStatusBadge}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-[var(--primary)] hover:text-[var(--primary-hover)] text-sm font-medium cursor-pointer">
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
        totalItems={filteredTrainers.length}
        pageSize={pageSize}
        currentPage={activePage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Slide-out Drawer */}
      {selectedTrainer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelectedTrainer(null)}
          ></div>

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 w-[400px] bg-[var(--card)] shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--card)] z-10">
              <h3 className="text-xl font-bold text-[var(--foreground)]">Thông tin huấn luyện viên</h3>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Avatar */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-bold text-3xl mb-3">
                  {selectedTrainer.avatar}
                </div>
                <h4 className="text-xl font-bold text-[var(--foreground)]">{selectedTrainer.name}</h4>
                <p className="text-sm text-[var(--muted-foreground)]">Huấn luyện viên cá nhân (PT)</p>
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                  <Mail className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Email</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{selectedTrainer.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                  <Phone className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Số điện thoại</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{selectedTrainer.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                  <User className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Giới tính</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{selectedTrainer.gender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                  <Calendar className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Ngày sinh</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{selectedTrainer.birthDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-[var(--background)] rounded-lg">
                  <Calendar className="w-5 h-5 text-[var(--primary)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">Ngày vào làm</p>
                    <p className="text-sm font-medium text-[var(--foreground)]">{selectedTrainer.joinDate}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[var(--border)]">
                <button
                  onClick={() => handleDeleteTrainer(selectedTrainer.id)}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer border border-red-200"
                >
                  <Trash2 className="w-5 h-5" />
                  Xóa huấn luyện viên
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Trainer Modal */}
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
                <h3 className="text-xl font-bold text-[var(--foreground)]">Thêm huấn luyện viên mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors cursor-pointer"
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
                    placeholder="VD: Nguyễn Văn PT"
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
                    placeholder="VD: pt@gympro.vn"
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
                    value="Huấn luyện viên cá nhân (PT)"
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
                    placeholder="VD: 0912345678"
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

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Mật khẩu khởi tạo (tối thiểu 6 ký tự)"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setFormErrors({ ...formErrors, password: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.password ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {formErrors.password && <p className="text-xs text-red-500 mt-1">Mật khẩu tối thiểu phải từ 6 ký tự</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu khởi tạo"
                    value={formData.confirmPassword}
                    onChange={(e) => {
                      setFormData({ ...formData, confirmPassword: e.target.value });
                      setFormErrors({ ...formErrors, confirmPassword: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {formErrors.confirmPassword && <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không trùng khớp</p>}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddTrainer}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors cursor-pointer"
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
