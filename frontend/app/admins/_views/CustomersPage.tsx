"use client";

import { Search, UserPlus, ChevronRight, AlertCircle, DollarSign, Calendar, X, TrendingUp, Check } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Pagination } from '@/components/Pagination';

const API_BASE = 'http://localhost:3001';


interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  packageName: string;
  packageExpiry: string;
  daysLeft: number;
  packageDuration: number;
  status: 'Active' | 'Expiring' | 'Expired';
  debt: number;
  lastCheckIn: string;
  bmiHistory: { id: string; month: string; bmi: number }[];
  checkinHistory?: { date: string; time: string; duration: string }[];
}

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring' | 'debt' | 'inactive'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('Thêm hội viên thành công!');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male' as 'male' | 'female' | 'other',
    birthDate: '',
    height: '',
    packageId: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    phone: false,
    packageId: false,
    password: false,
    confirmPassword: false,
  });

  const fetchCustomers = useCallback(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/customers`, {
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
          throw new Error('Không thể tải danh sách khách hàng từ máy chủ.');
        }
        return res.json();
      })
      .then(data => {
        setCustomers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ');
        setLoading(false);
      });
  }, []);

  const fetchPackages = useCallback(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/memberships/packages`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải danh sách gói tập');
        return res.json();
      })
      .then(data => {
        setPackages(data.filter((p: any) => p.isVisible));
      })
      .catch(err => console.error('Error fetching packages:', err));
  }, []);

  useEffect(() => {
    fetchCustomers();
    fetchPackages();
  }, [fetchCustomers, fetchPackages]);

  const handleViewDetails = (customerId: string) => {
    setDetailLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/customers/${customerId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải thông tin chi tiết hội viên');
        return res.json();
      })
      .then(data => {
        setSelectedCustomer(data);
        setDetailLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert(err.message || 'Có lỗi xảy ra');
        setDetailLoading(false);
      });
  };

  const handleAddCustomer = () => {
    const errors = {
      name: !formData.name.trim(),
      email: !formData.email.trim() || !formData.email.includes('@'),
      phone: !formData.phone.trim(),
      packageId: !formData.packageId,
      password: !formData.password || formData.password.length < 6,
      confirmPassword: !formData.confirmPassword || formData.confirmPassword !== formData.password,
    };

    setFormErrors(errors);

    if (Object.values(errors).some(error => error)) {
      return;
    }

    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        birthDate: formData.birthDate || undefined,
        height: formData.height ? Number(formData.height) : undefined,
        packageId: formData.packageId,
        password: formData.password,
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(errData => {
            throw new Error(errData.message || 'Thêm hội viên thất bại');
          });
        }
        return res.json();
      })
      .then(() => {
        fetchCustomers();
        setShowAddModal(false);

        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          gender: 'male',
          birthDate: '',
          height: '',
          packageId: '',
          password: '',
          confirmPassword: '',
        });
        setFormErrors({
          name: false,
          email: false,
          phone: false,
          packageId: false,
          password: false,
          confirmPassword: false,
        });

        setNotificationMessage('Thêm hội viên thành công!');
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      })
      .catch(err => {
        console.error('Lỗi khi thêm hội viên:', err);
        alert(err.message || 'Có lỗi xảy ra');
      });
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);

    const matchesFilter =
      activeFilter === 'all' ? true :
      activeFilter === 'expiring' ? customer.daysLeft > 0 && customer.daysLeft <= 7 :
      activeFilter === 'debt' ? customer.debt > 0 :
      customer.daysLeft < -14; // Không đi tập > 14 ngày

    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.max(Math.ceil(filteredCustomers.length / pageSize), 1);
  const activePage = Math.min(currentPage, totalPages);
  const paginatedCustomers = filteredCustomers.slice((activePage - 1) * pageSize, activePage * pageSize);

  const getProgressColor = (daysLeft: number, duration: number) => {
    const percentage = (daysLeft / duration) * 100;
    if (percentage > 20) return 'bg-emerald-500';
    if (percentage > 0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressPercentage = (daysLeft: number, duration: number) => {
    if (daysLeft < 0) return 0;
    return Math.min((daysLeft / duration) * 100, 100);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="h-12 bg-gray-200 rounded-lg w-full max-w-md"></div>
        <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm h-64 flex items-center justify-center">
          <div className="text-[var(--muted-foreground)]">Đang tải danh sách hội viên...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-md mx-auto my-12">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-red-950 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-red-700 text-sm mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchCustomers();
              fetchPackages();
            }}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-md"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Quản lý khách hàng</h2>
          <p className="text-[var(--muted-foreground)]">Danh sách hội viên và thông tin gói tập</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          <UserPlus className="w-5 h-5" />
          Thêm hội viên
        </button>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-[var(--foreground)]">Lọc nhanh:</span>
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === 'all'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'bg-[var(--secondary)] text-[var(--foreground)] hover:bg-[var(--muted)]'
          }`}
        >
          Tất cả ({customers.length})
        </button>
        <button
          onClick={() => setActiveFilter('expiring')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            activeFilter === 'expiring'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Sắp hết hạn (&lt;7 ngày)
        </button>
        <button
          onClick={() => setActiveFilter('debt')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            activeFilter === 'debt'
              ? 'bg-red-500 text-white shadow-md'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Nợ cước
        </button>
        <button
          onClick={() => setActiveFilter('inactive')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
            activeFilter === 'inactive'
              ? 'bg-gray-500 text-white shadow-md'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Không đi tập &gt;14 ngày
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc SĐT..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Hội viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  SĐT
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Gói tập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Thời hạn gói
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Check-in gần nhất
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[var(--secondary)] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{customer.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm text-[var(--foreground)]">{customer.phone}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{customer.packageName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">HSD: {customer.packageExpiry}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--muted-foreground)]">
                          {customer.daysLeft > 0 ? `Còn ${customer.daysLeft} ngày` : 'Đã hết hạn'}
                        </span>
                        <span className="font-medium text-[var(--foreground)]">
                          {getProgressPercentage(customer.daysLeft, customer.packageDuration).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressColor(customer.daysLeft, customer.packageDuration)} transition-all`}
                          style={{ width: `${getProgressPercentage(customer.daysLeft, customer.packageDuration)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-[var(--foreground)]">{customer.lastCheckIn}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetails(customer.id)}
                      disabled={detailLoading}
                      className="inline-flex items-center gap-1 text-[var(--primary)] hover:text-[#E66E00] text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      {detailLoading && selectedCustomer?.id === customer.id ? 'Đang tải...' : 'Xem chi tiết'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        currentPage={activePage}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedCustomer(null)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--card)] z-10">
                <div>
                  <h3 className="text-2xl font-bold text-[var(--foreground)]">{selectedCustomer.name}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{selectedCustomer.email}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Gói tập hiện tại</p>
                    <p className="text-lg font-bold text-[var(--foreground)]">{selectedCustomer.packageName}</p>
                  </div>
                  <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Còn lại</p>
                    <p className="text-lg font-bold text-[var(--primary)]">
                      {selectedCustomer.daysLeft > 0 ? `${selectedCustomer.daysLeft} ngày` : 'Hết hạn'}
                    </p>
                  </div>
                  <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted-foreground)] mb-1">Nợ cước</p>
                    <p className={`text-lg font-bold ${selectedCustomer.debt > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {selectedCustomer.debt > 0 ? `${selectedCustomer.debt.toLocaleString('vi-VN')}đ` : '0đ'}
                    </p>
                  </div>
                </div>

                {/* BMI Chart */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                    <h4 className="text-lg font-bold text-[var(--foreground)]">Biểu đồ chỉ số BMI</h4>
                  </div>
                  {selectedCustomer.bmiHistory && selectedCustomer.bmiHistory.length > 0 ? (
                    <div className="bg-[var(--background)] rounded-lg p-4 border border-[var(--border)]">
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart
                          data={selectedCustomer.bmiHistory}
                          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis
                            dataKey="month"
                            stroke="#64748B"
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis
                            stroke="#64748B"
                            tick={{ fontSize: 12 }}
                            domain={[15, 35]}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #E2E8F0',
                              borderRadius: '8px'
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="bmi"
                            stroke="#FF7A00"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#FF7A00' }}
                            name="BMI"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-lg bg-[var(--card)]">
                      Chưa có dữ liệu chỉ số BMI (Cần cập nhật Chiều cao & Cân nặng của hội viên).
                    </div>
                  )}
                </div>

                {/* Check-in History */}
                <div>
                  <h4 className="text-lg font-bold text-[var(--foreground)] mb-4">Lịch sử Check-in gần đây</h4>
                  <div className="space-y-2">
                    {selectedCustomer.checkinHistory && selectedCustomer.checkinHistory.length > 0 ? (
                      selectedCustomer.checkinHistory.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                          <div>
                            <p className="font-medium text-[var(--foreground)]">{item.date}</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Check-in: {item.time}</p>
                          </div>
                          <span className="text-sm font-medium text-[var(--primary)]">{item.duration}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-[var(--muted-foreground)] border border-dashed border-[var(--border)] rounded-lg">
                        Chưa có lịch sử check-in.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowAddModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--foreground)]">Thêm hội viên mới</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
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
                    placeholder="VD: email@gmail.com"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Giới tính
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Chiều cao (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="VD: 170"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Gói tập <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.packageId}
                    onChange={(e) => {
                      setFormData({ ...formData, packageId: e.target.value });
                      setFormErrors({ ...formErrors, packageId: false });
                    }}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent ${
                      formErrors.packageId ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  >
                    <option value="">-- Chọn gói tập --</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} ({Number(pkg.price).toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                  {formErrors.packageId && <p className="text-xs text-red-500 mt-1">Vui lòng chọn gói tập</p>}
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
                  className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddCustomer}
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
