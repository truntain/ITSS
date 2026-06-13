"use client";

import { TrendingUp, TrendingDown, Download, DollarSign, CreditCard, Users, Package } from 'lucide-react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useCallback } from 'react';

interface Transaction {
  id: number;
  receiptNo: string;
  userId: number;
  membershipId: number;
  packageId: string;
  voucherId?: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod: string;
  cashierId?: number;
  transactionDate: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  package?: {
    id: string;
    name: string;
  };
  cashier?: {
    id: number;
    fullName: string;
  };
}

export function RevenuePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const getToken = () => localStorage.getItem('token') || '';

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/payments/transactions`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách giao dịch');
      const data = await res.json();
      setTransactions(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  // --- LOGIC TÍNH TOÁN DOANH THU & CHỈ SỐ ĐỘNG ---
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // 1. Phân loại giao dịch theo tháng
  const thisMonthTxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthTxs = transactions.filter(t => {
    const d = new Date(t.transactionDate);
    return d.getFullYear() === lastMonthDate.getFullYear() && d.getMonth() === lastMonthDate.getMonth();
  });

  // 2. Tính doanh thu
  const currentMonthRevenue = thisMonthTxs.reduce((sum, t) => sum + Number(t.finalAmount), 0);
  const lastMonthRevenue = lastMonthTxs.reduce((sum, t) => sum + Number(t.finalAmount), 0);
  const revenueChange = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 100;

  // 3. Tính số hội viên mới & gói bán được trong tháng
  const newMembersCount = new Set(thisMonthTxs.map(t => t.userId)).size;
  const packagesSold = thisMonthTxs.length;

  // 4. Gom nhóm doanh thu 6 tháng gần nhất để vẽ biểu đồ lớn
  const getPastMonthsData = () => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth();
      
      const monthTxs = transactions.filter(t => {
        const txDate = new Date(t.transactionDate);
        return txDate.getFullYear() === mYear && txDate.getMonth() === mMonth;
      });
      
      const revenue = monthTxs.reduce((sum, t) => sum + Number(t.finalAmount), 0);
      result.push({
        month: `T${mMonth + 1}`,
        revenue: revenue,
        target: 40000000 + (mMonth % 3) * 10000000, // Mục tiêu giả lập từ 40M - 65M
      });
    }
    return result;
  };

  const monthlyChartData = getPastMonthsData();

  // 5. Gom nhóm Sparkline động (14 mốc ngày)
  const getSparklineData = (txs: Transaction[], isRevenue = true) => {
    const result = Array(14).fill(0);
    if (txs.length === 0) return [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]; // Fallback vẽ đường thẳng
    
    // Gom nhóm giao dịch theo ngày
    const sorted = [...txs].sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
    const minTime = new Date(sorted[0].transactionDate).getTime();
    const maxTime = new Date(sorted[sorted.length - 1].transactionDate).getTime();
    const range = maxTime - minTime || 1;

    sorted.forEach(t => {
      const tTime = new Date(t.transactionDate).getTime();
      const index = Math.min(Math.floor(((tTime - minTime) / range) * 14), 13);
      if (isRevenue) {
        result[index] += Number(t.finalAmount);
      } else {
        result[index] += 1; // Đếm số lượng giao dịch / hội viên
      }
    });

    return result;
  };

  const sparklineData = {
    thisMonth: getSparklineData(thisMonthTxs, true),
    lastMonth: getSparklineData(lastMonthTxs, true),
    newMembers: getSparklineData(thisMonthTxs, false),
    packages: getSparklineData(thisMonthTxs, false),
  };

  // --- PHÂN TRANG CHO BẢNG GIAO DỊCH ---
  const totalPages = Math.max(Math.ceil(transactions.length / itemsPerPage), 1);
  const activePage = Math.min(currentPage, totalPages);
  const paginatedTransactions = transactions.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('Không có dữ liệu giao dịch để xuất báo cáo.');
      return;
    }

    // Tạo nội dung HTML cho báo cáo PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Vui lòng cho phép mở popup trên trình duyệt để xuất PDF.');
      return;
    }

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const tableRows = transactions.map((t, idx) => `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td style="font-family: monospace;">${t.receiptNo}</td>
        <td>${formatDateTime(t.transactionDate)}</td>
        <td>${t.user?.fullName || 'Hội viên'}</td>
        <td>${t.package?.name || 'Gói tập'}</td>
        <td style="text-align: right; font-weight: bold;">${Number(t.finalAmount).toLocaleString('vi-VN')}đ</td>
        <td style="text-align: center;">${t.paymentMethod}</td>
        <td>${t.cashier?.fullName || 'Hệ thống'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Bao_cao_doanh_thu_${new Date().toISOString().split('T')[0]}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
            body {
              font-family: 'Roboto', sans-serif;
              padding: 40px;
              color: #1e293b;
              margin: 0;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #FF7A00;
              padding-bottom: 15px;
            }
            .logo {
              font-size: 24px;
              font-weight: 700;
              color: #FF7A00;
            }
            .title {
              text-align: center;
              margin-bottom: 40px;
            }
            .title h1 {
              margin: 0 0 10px 0;
              font-size: 26px;
              color: #0f172a;
              text-transform: uppercase;
            }
            .title p {
              margin: 0;
              color: #64748b;
              font-size: 14px;
            }
            .summary {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 40px;
            }
            .summary-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
            }
            .summary-card p {
              margin: 0 0 5px 0;
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
            }
            .summary-card h3 {
              margin: 0;
              font-size: 16px;
              color: #0f172a;
              font-weight: 700;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 12px 10px;
              font-size: 13px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              color: #0f172a;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              padding: 0 50px;
            }
            .signature-box {
              text-align: center;
              width: 200px;
            }
            .signature-box p {
              margin: 0 0 70px 0;
              font-size: 14px;
              font-weight: 500;
            }
            .signature-box span {
              display: block;
              border-top: 1px dashed #cbd5e1;
              padding-top: 8px;
              font-size: 13px;
              color: #64748b;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">GymPro Fitness</div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Ngày lập báo cáo: ${todayStr}
            </div>
          </div>
          
          <div class="title">
            <h1>Báo cáo doanh thu & Giao dịch</h1>
            <p>Hệ thống quản lý GymPro Fitness Club</p>
          </div>

          <div class="summary">
            <div class="summary-card">
              <p>Doanh thu tháng này</p>
              <h3>${(currentMonthRevenue).toLocaleString('vi-VN')}đ</h3>
            </div>
            <div class="summary-card">
              <p>Doanh thu tháng trước</p>
              <h3>${(lastMonthRevenue).toLocaleString('vi-VN')}đ</h3>
            </div>
            <div class="summary-card">
              <p>Hội viên phát sinh GD</p>
              <h3>${newMembersCount}</h3>
            </div>
            <div class="summary-card">
              <p>Gói bán được</p>
              <h3>${packagesSold}</h3>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">STT</th>
                <th style="width: 15%;">Mã GD</th>
                <th style="width: 18%;">Thời gian</th>
                <th style="width: 17%;">Khách hàng</th>
                <th style="width: 15%;">Gói tập</th>
                <th style="width: 15%; text-align: right;">Số tiền</th>
                <th style="width: 15%; text-align: center;">Phương thức</th>
                <th style="width: 10%;">Nhân viên</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="signatures">
            <div class="signature-box">
              <p>Người lập báo cáo</p>
              <span>(Ký và ghi rõ họ tên)</span>
            </div>
            <div class="signature-box">
              <p>Ban giám đốc</p>
              <span>(Ký tên và đóng dấu)</span>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => {
    const maxVal = Math.max(...data) || 1;
    return (
      <svg width="80" height="30" className="inline-block">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={data
            .map((value, index) => {
              const x = (index / (data.length - 1)) * 80;
              const y = 30 - (value / maxVal) * 25 - 2; // Offset nhẹ để không chạm đỉnh
              return `${x},${y}`;
            })
            .join(' ')}
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Không thể tải dữ liệu</h3>
        <p className="text-[var(--muted-foreground)] text-sm mb-6">{error}</p>
        <button
          onClick={fetchTransactions}
          className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-md"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Báo cáo doanh thu</h2>
          <p className="text-[var(--muted-foreground)]">Theo dõi và phân tích doanh thu phòng tập</p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
      </div>

      {/* Stats with Sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Doanh thu tháng này */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {(currentMonthRevenue / 1000000).toFixed(1)}M
              </p>
              <div className="flex items-center gap-1 mt-1">
                {revenueChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${revenueChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {Math.abs(revenueChange).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <MiniSparkline data={sparklineData.thisMonth} color="#3B82F6" />
        </div>

        {/* Doanh thu tháng trước */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Doanh thu tháng trước</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {(lastMonthRevenue / 1000000).toFixed(1)}M
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">So sánh</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <MiniSparkline data={sparklineData.lastMonth} color="#A855F7" />
        </div>

        {/* Hội viên mới */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Hội viên mới tháng này</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {newMembersCount}
              </p>
              <p className="text-sm text-emerald-500 mt-1 font-medium">Khách hàng phát sinh GD</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <MiniSparkline data={sparklineData.newMembers} color="#10B981" />
        </div>

        {/* Gói bán được */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Gói bán được</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {packagesSold}
              </p>
              <p className="text-sm text-orange-500 mt-1 font-medium">Lượt giao dịch mua gói</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <MiniSparkline data={sparklineData.packages} color="#F97316" />
        </div>
      </div>

      {/* Composed Chart */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Doanh thu & Chỉ tiêu 6 tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={monthlyChartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            id="revenue-chart"
          >
            <CartesianGrid key="grid-revenue" strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              key="xaxis-revenue"
              dataKey="month"
              stroke="#64748B"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              key="yaxis-revenue"
              stroke="#64748B"
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number) => `${(value / 1000000).toFixed(0)}M`}
            />
            <Tooltip
              key="tooltip-revenue"
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M VNĐ`]}
            />
            <Legend key="legend-revenue" iconType="circle" />
            <Bar
              key="bar-revenue"
              dataKey="revenue"
              fill="#FF7A00"
              name="Doanh thu thực tế"
              radius={[8, 8, 0, 0]}
            />
            <Line
              key="line-target"
              type="monotone"
              dataKey="target"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Chỉ tiêu"
              dot={{ fill: '#3B82F6', r: 4 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Transaction Table with Pagination */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Lịch sử giao dịch</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--secondary)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Mã GD</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Thời gian</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Khách hàng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Gói tập</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-[var(--foreground)]">Số tiền</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Phương thức</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Nhân viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[var(--secondary)] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-medium text-[var(--foreground)]">{transaction.receiptNo}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{formatDateTime(transaction.transactionDate)}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">{transaction.user?.fullName || 'Hội viên'}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{transaction.package?.name || 'Gói tập'}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[var(--foreground)]">
                      {Number(transaction.finalAmount).toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.paymentMethod === 'Tiền mặt'
                          ? 'bg-emerald-100 text-emerald-700'
                          : transaction.paymentMethod === 'Chuyển khoản'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {transaction.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{transaction.cashier?.fullName || 'Hệ thống'}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--muted-foreground)] text-sm">
                    Chưa có giao dịch thanh toán nào được thực hiện.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Hiển thị {(activePage - 1) * itemsPerPage + 1} - {Math.min(activePage * itemsPerPage, transactions.length)} trong tổng số {transactions.length} giao dịch
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  activePage === index + 1
                    ? 'bg-[var(--primary)] text-white'
                    : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
