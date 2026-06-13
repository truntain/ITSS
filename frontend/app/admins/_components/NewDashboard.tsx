"use client";

import { useState, useEffect } from 'react';
import { DollarSign, Users, UserPlus, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isIncrease: boolean;
  icon?: React.ElementType;
  iconText?: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ title, value, change, isIncrease, icon: Icon, iconText, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-5 border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-[var(--muted-foreground)] mb-1.5">{title}</p>
          <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">{value}</h3>
          <div className="flex items-center gap-1">
            {isIncrease ? (
              <ArrowUpRight className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-[var(--destructive)]" />
            )}
            <span className={`text-sm font-medium ${isIncrease ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
              {change}
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">so với tháng trước</span>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {iconText ? (
            <span className={`text-2xl font-bold ${iconColor}`}>{iconText}</span>
          ) : Icon ? (
            <Icon className={`w-5 h-5 ${iconColor}`} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

// Format numbers to currency format (1.000.000đ)
function formatRevenue(value: number): string {
  return value.toLocaleString('vi-VN') + 'đ';
}

// Convert ISO string date to relative time
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) {
    return 'Vừa xong';
  }
  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  }
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function NewDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/admin/dashboard/summary', { headers })
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
          }
          if (res.status === 403) {
            throw new Error('Bạn không có quyền truy cập vào dữ liệu này (Chỉ dành cho Admin).');
          }
          const text = await res.text().catch(() => '');
          let msg = '';
          try {
            const parsed = JSON.parse(text);
            msg = parsed.message || '';
          } catch (e) {}
          throw new Error(msg || `Lỗi máy chủ (${res.status}): Không thể tải dữ liệu tổng hợp Admin`);
        }
        return res.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin dashboard summary:', err);
        setError(err.message || 'Có lỗi xảy ra khi kết nối máy chủ');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Stats Cards Row Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-5 border border-[var(--border)] shadow-sm h-32 flex flex-col justify-between animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
          ))}
        </div>

        {/* Charts Row Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-[var(--border)] shadow-sm h-[380px] flex flex-col justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            </div>
            <div className="h-56 bg-gray-100 rounded w-full"></div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-[var(--border)] shadow-sm h-[380px] flex flex-col justify-between">
            <div>
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-28 mb-6"></div>
            </div>
            <div className="h-40 bg-gray-100 rounded-full w-40 mx-auto mb-6"></div>
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isUnauthorized = error.includes('Phiên đăng nhập đã hết hạn') || error.includes('401');
    return (
      <div className="bg-red-50 rounded-xl p-8 border border-red-200 shadow-sm text-center max-w-lg mx-auto my-12">
        <h3 className="text-xl font-bold text-red-700 mb-2">Đã xảy ra lỗi khi tải dữ liệu</h3>
        <p className="text-red-500 mb-6">{error}</p>
        <div className="flex gap-4 justify-center">
          {isUnauthorized ? (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
              }}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition"
            >
              Đăng nhập lại
            </button>
          ) : (
            <>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  window.location.reload();
                }}
                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Thử lại
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('currentUser');
                  window.location.href = '/login';
                }}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                Đăng nhập lại
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  const { stats, memberGrowthData, packageDistribution, recentActivities } = data;

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value={formatRevenue(stats.totalRevenue.value)}
          change={stats.totalRevenue.change}
          isIncrease={stats.totalRevenue.isIncrease}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Hội viên mới"
          value={stats.newMembers.value.toString()}
          change={stats.newMembers.change}
          isIncrease={stats.newMembers.isIncrease}
          icon={UserPlus}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Đang hoạt động"
          value={stats.activeMembers.value.toString()}
          change={stats.activeMembers.change}
          isIncrease={stats.activeMembers.isIncrease}
          icon={Users}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Sắp hết hạn"
          value={stats.expiringMemberships.value.toString()}
          change={stats.expiringMemberships.change}
          isIncrease={stats.expiringMemberships.isIncrease}
          icon={AlertCircle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Growth Chart - 70% */}
        <div key="area-chart-container" className="lg:col-span-2 bg-white rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)]">Tăng trưởng hội viên</h3>
              <p className="text-sm text-[var(--muted-foreground)]">12 tháng gần nhất</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[var(--success)]" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={memberGrowthData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              id="member-growth-chart"
            >
              <defs>
                <linearGradient id="dashboard-colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid key="grid-members" strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis
                key="xaxis-members"
                dataKey="month"
                stroke="#64748B"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                key="yaxis-members"
                stroke="#64748B"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                key="tooltip-members"
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Area
                key="area-members"
                type="monotone"
                dataKey="members"
                stroke="#FF7A00"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#dashboard-colorMembers)"
                name="Số hội viên mới"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Package Distribution Pie Chart - 30% */}
        <div key="pie-chart-container" className="bg-white rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Phân bổ gói tập</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Theo tỷ lệ đăng ký</p>
          </div>
          {packageDistribution && packageDistribution.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    key="pie-packages"
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={false}
                  >
                    {packageDistribution.map((entry: any) => (
                      <Cell key={`pie-cell-${entry.id}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    key="tooltip-packages"
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4 max-h-[120px] overflow-y-auto pr-1">
                {packageDistribution.map((item: any) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-[var(--foreground)] truncate max-w-[150px]">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-[var(--foreground)]">{item.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-[var(--muted-foreground)] text-sm">
              Chưa có dữ liệu phân bổ
            </div>
          )}
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Hoạt động gần nhất</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Danh sách check-in và giao dịch mới nhất</p>
        </div>
        <div className="overflow-x-auto">
          {recentActivities && recentActivities.length > 0 ? (
            <table className="w-full">
              <thead className="bg-[var(--secondary)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Hội viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Hành động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    Thời gian
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {recentActivities.map((activity: any) => (
                  <tr key={activity.id} className="hover:bg-[var(--secondary)] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                          {activity.avatar}
                        </div>
                        <span className="font-medium text-[var(--foreground)]">{activity.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.type === 'purchase' ? 'bg-emerald-100 text-emerald-700' :
                        activity.type === 'checkin' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {activity.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted-foreground)]">
                      {formatRelativeTime(activity.time)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-[var(--muted-foreground)] text-sm">
              Không có hoạt động gần đây
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
