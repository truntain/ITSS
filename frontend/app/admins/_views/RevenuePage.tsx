"use client";

import { TrendingUp, TrendingDown, Download, DollarSign, CreditCard, Users, Package } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { useState } from 'react';

const monthlyData = [
  { id: 'rev1', month: 'T1', revenue: 45000000, target: 50000000, members: 120 },
  { id: 'rev2', month: 'T2', revenue: 52000000, target: 50000000, members: 135 },
  { id: 'rev3', month: 'T3', revenue: 48000000, target: 50000000, members: 128 },
  { id: 'rev4', month: 'T4', revenue: 61000000, target: 55000000, members: 152 },
  { id: 'rev5', month: 'T5', revenue: 58000000, target: 55000000, members: 148 },
  { id: 'rev6', month: 'T6', revenue: 64000000, target: 60000000, members: 165 },
];

interface Transaction {
  id: string;
  date: string;
  customerName: string;
  package: string;
  amount: number;
  method: string;
  staff: string;
}

const transactions: Transaction[] = [
  { id: 'TX001', date: '13/05/2026 14:30', customerName: 'Nguyễn Văn An', package: 'Gói VIP 6 tháng', amount: 2500000, method: 'Chuyển khoản', staff: 'Mai Linh' },
  { id: 'TX002', date: '13/05/2026 12:15', customerName: 'Trần Thị Bình', package: 'Gói Tiêu Chuẩn 3 tháng', amount: 1350000, method: 'Tiền mặt', staff: 'Hoàng Nam' },
  { id: 'TX003', date: '12/05/2026 18:45', customerName: 'Lê Minh Cường', package: 'Gói Premium 12 tháng', amount: 4200000, method: 'Chuyển khoản', staff: 'Mai Linh' },
  { id: 'TX004', date: '12/05/2026 16:20', customerName: 'Phạm Thu Dung', package: 'Gói Khởi Động 1 tháng', amount: 500000, method: 'Tiền mặt', staff: 'Hoàng Nam' },
  { id: 'TX005', date: '11/05/2026 19:00', customerName: 'Hoàng Văn Em', package: 'Gói VIP 6 tháng', amount: 2500000, method: 'Thẻ tín dụng', staff: 'Mai Linh' },
  { id: 'TX006', date: '11/05/2026 15:30', customerName: 'Vũ Thị Phương', package: 'Gói Tiêu Chuẩn 3 tháng', amount: 1350000, method: 'Chuyển khoản', staff: 'Hoàng Nam' },
  { id: 'TX007', date: '10/05/2026 17:45', customerName: 'Đỗ Văn Giang', package: 'Gói Khởi Động 1 tháng', amount: 500000, method: 'Tiền mặt', staff: 'Mai Linh' },
  { id: 'TX008', date: '10/05/2026 14:10', customerName: 'Bùi Thị Hoa', package: 'Gói Premium 12 tháng', amount: 4200000, method: 'Chuyển khoản', staff: 'Hoàng Nam' },
  { id: 'TX009', date: '09/05/2026 20:00', customerName: 'Ngô Văn Inh', package: 'Gói VIP 6 tháng', amount: 2500000, method: 'Thẻ tín dụng', staff: 'Mai Linh' },
  { id: 'TX010', date: '09/05/2026 16:45', customerName: 'Trương Thị Kim', package: 'Gói Tiêu Chuẩn 3 tháng', amount: 1350000, method: 'Tiền mặt', staff: 'Hoàng Nam' },
];

const sparklineData = {
  thisMonth: [45, 52, 48, 55, 61, 58, 62, 59, 65, 63, 68, 71, 67, 72],
  lastMonth: [38, 42, 45, 41, 48, 52, 49, 54, 51, 56, 58, 55, 59, 61],
  newMembers: [3, 5, 2, 4, 6, 3, 7, 5, 4, 6, 5, 8, 6, 7],
  packages: [8, 10, 7, 9, 12, 10, 11, 9, 13, 11, 14, 12, 13, 15],
};

export function RevenuePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.revenue, 0);
  const currentMonthRevenue = monthlyData[monthlyData.length - 1].revenue;
  const lastMonthRevenue = monthlyData[monthlyData.length - 2].revenue;
  const revenueChange = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

  const handleExport = () => {
    const csvContent = [
      ['Mã GD', 'Ngày', 'Khách hàng', 'Gói tập', 'Số tiền', 'Phương thức', 'Nhân viên'].join(','),
      ...transactions.map(t => [t.id, t.date, t.customerName, t.package, t.amount, t.method, t.staff].join(','))
    ].join('\n');

    const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `revenue_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const MiniSparkline = ({ data, color }: { data: number[]; color: string }) => (
    <svg width="80" height="30" className="inline-block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={data
          .map((value, index) => {
            const x = (index / (data.length - 1)) * 80;
            const y = 30 - (value / Math.max(...data)) * 30;
            return `${x},${y}`;
          })
          .join(' ')}
      />
    </svg>
  );

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
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {(currentMonthRevenue / 1000000).toFixed(0)}M
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

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Doanh thu tháng trước</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {(lastMonthRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">So sánh</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <MiniSparkline data={sparklineData.lastMonth} color="#A855F7" />
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Hội viên mới</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {sparklineData.newMembers.reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-sm text-emerald-500 mt-1 font-medium">+12% so với T4</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <MiniSparkline data={sparklineData.newMembers} color="#10B981" />
        </div>

        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-[var(--muted-foreground)] mb-1">Gói bán được</p>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {sparklineData.packages.reduce((a, b) => a + b, 0)}
              </p>
              <p className="text-sm text-orange-500 mt-1 font-medium">+18% so với T4</p>
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
            data={monthlyData}
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
            />
            <Tooltip
              key="tooltip-revenue"
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
              }}
              formatter={(value: number) => `${(value / 1000000).toFixed(1)}M`}
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
                    <span className="font-mono text-sm font-medium text-[var(--foreground)]">{transaction.id}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{transaction.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-[var(--foreground)]">{transaction.customerName}</td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{transaction.package}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-[var(--foreground)]">
                      {transaction.amount.toLocaleString('vi-VN')}đ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        transaction.method === 'Tiền mặt'
                          ? 'bg-emerald-100 text-emerald-700'
                          : transaction.method === 'Chuyển khoản'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {transaction.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{transaction.staff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, transactions.length)} trong tổng số {transactions.length} giao dịch
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>

            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPage === index + 1
                    ? 'bg-[var(--primary)] text-white'
                    : 'border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)]'
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
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
