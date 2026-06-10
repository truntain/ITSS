"use client";

import { Search, UserPlus, ChevronRight, AlertCircle, DollarSign, Calendar, X, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
}

const customers: Customer[] = [
  {
    id: 'KH001',
    name: 'Nguyễn Văn An',
    email: 'an.nv@email.com',
    phone: '0901234567',
    packageName: 'Gói 1 năm',
    packageExpiry: '15/12/2026',
    daysLeft: 215,
    packageDuration: 365,
    status: 'Active',
    debt: 0,
    lastCheckIn: '13/05/2026',
    bmiHistory: [
      { id: 'bmi1-1', month: 'T1', bmi: 28.5 },
      { id: 'bmi1-2', month: 'T2', bmi: 27.2 },
      { id: 'bmi1-3', month: 'T3', bmi: 26.1 },
      { id: 'bmi1-4', month: 'T4', bmi: 25.3 },
      { id: 'bmi1-5', month: 'T5', bmi: 24.8 },
    ]
  },
  {
    id: 'KH002',
    name: 'Trần Thị Bình',
    email: 'binh.tt@email.com',
    phone: '0902345678',
    packageName: 'Gói 3 tháng',
    packageExpiry: '20/05/2026',
    daysLeft: 6,
    packageDuration: 90,
    status: 'Expiring',
    debt: 0,
    lastCheckIn: '12/05/2026',
    bmiHistory: [
      { id: 'bmi2-1', month: 'T1', bmi: 24.2 },
      { id: 'bmi2-2', month: 'T2', bmi: 23.8 },
      { id: 'bmi2-3', month: 'T3', bmi: 23.5 },
      { id: 'bmi2-4', month: 'T4', bmi: 23.1 },
      { id: 'bmi2-5', month: 'T5', bmi: 22.9 },
    ]
  },
  {
    id: 'KH003',
    name: 'Lê Minh Cường',
    email: 'cuong.lm@email.com',
    phone: '0903456789',
    packageName: 'Gói 1 tháng',
    packageExpiry: '10/05/2026',
    daysLeft: -4,
    packageDuration: 30,
    status: 'Expired',
    debt: 500000,
    lastCheckIn: '25/04/2026',
    bmiHistory: [
      { id: 'bmi3-1', month: 'T1', bmi: 26.8 },
      { id: 'bmi3-2', month: 'T2', bmi: 26.5 },
      { id: 'bmi3-3', month: 'T3', bmi: 26.2 },
      { id: 'bmi3-4', month: 'T4', bmi: 25.9 },
      { id: 'bmi3-5', month: 'T5', bmi: 25.6 },
    ]
  },
  {
    id: 'KH004',
    name: 'Phạm Thu Dung',
    email: 'dung.pt@email.com',
    phone: '0904567890',
    packageName: 'Gói VIP',
    packageExpiry: '18/05/2026',
    daysLeft: 4,
    packageDuration: 90,
    status: 'Expiring',
    debt: 0,
    lastCheckIn: '01/05/2026',
    bmiHistory: [
      { id: 'bmi4-1', month: 'T1', bmi: 22.5 },
      { id: 'bmi4-2', month: 'T2', bmi: 22.0 },
      { id: 'bmi4-3', month: 'T3', bmi: 21.8 },
      { id: 'bmi4-4', month: 'T4', bmi: 21.5 },
      { id: 'bmi4-5', month: 'T5', bmi: 21.2 },
    ]
  },
];

export function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'expiring' | 'debt' | 'inactive'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

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
              {filteredCustomers.map((customer) => (
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
                      onClick={() => setSelectedCustomer(customer)}
                      className="inline-flex items-center gap-1 text-[var(--primary)] hover:text-[#E66E00] text-sm font-medium transition-colors"
                    >
                      Xem chi tiết
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                          domain={[20, 30]}
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
                </div>

                {/* Check-in History */}
                <div>
                  <h4 className="text-lg font-bold text-[var(--foreground)] mb-4">Lịch sử Check-in gần đây</h4>
                  <div className="space-y-2">
                    {[
                      { date: '13/05/2026', time: '18:30', duration: '2h 15p' },
                      { date: '11/05/2026', time: '19:00', duration: '1h 45p' },
                      { date: '09/05/2026', time: '18:15', duration: '2h 30p' },
                      { date: '07/05/2026', time: '17:45', duration: '2h 00p' },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{item.date}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">Check-in: {item.time}</p>
                        </div>
                        <span className="text-sm font-medium text-[var(--primary)]">{item.duration}</span>
                      </div>
                    ))}
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
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    placeholder="VD: 0901234567"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Gói tập
                  </label>
                  <select className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent">
                    <option value="">-- Chọn gói tập --</option>
                    <option value="Gói 1 tháng">Gói 1 tháng</option>
                    <option value="Gói 3 tháng">Gói 3 tháng</option>
                    <option value="Gói 6 tháng">Gói 6 tháng</option>
                    <option value="Gói 1 năm">Gói 1 năm</option>
                    <option value="Gói VIP">Gói VIP</option>
                  </select>
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
                <button className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors">
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
