import {
  Users,
  DollarSign,
  UserPlus,
  AlertCircle,
  TrendingUp,
  Calendar,
  Award,
  Activity
} from 'lucide-react';
import { StatCard } from './StatCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const revenueData = [
  { month: 'T1', revenue: 45000000, members: 120 },
  { month: 'T2', revenue: 52000000, members: 145 },
  { month: 'T3', revenue: 48000000, members: 138 },
  { month: 'T4', revenue: 61000000, members: 167 },
  { month: 'T5', revenue: 55000000, members: 156 },
  { month: 'T6', revenue: 67000000, members: 189 },
];

const packageData = [
  { name: 'Gói Tháng', value: 45, color: '#FF7A00' },
  { name: 'Gói Quý', value: 30, color: '#3b82f6' },
  { name: 'Gói Năm', value: 20, color: '#10b981' },
  { name: 'Gói VIP', value: 5, color: '#8b5cf6' },
];

const recentMembers = [
  { name: 'Nguyễn Văn A', package: 'Gói Năm', date: '10/05/2026', status: 'active' },
  { name: 'Trần Thị B', package: 'Gói Tháng', date: '09/05/2026', status: 'active' },
  { name: 'Lê Văn C', package: 'Gói Quý', date: '08/05/2026', status: 'active' },
  { name: 'Phạm Thị D', package: 'Gói VIP', date: '07/05/2026', status: 'active' },
];

const upcomingExpiries = [
  { name: 'Hoàng Văn E', package: 'Gói Tháng', expiryDate: '15/05/2026', days: 5 },
  { name: 'Vũ Thị F', package: 'Gói Quý', expiryDate: '18/05/2026', days: 8 },
  { name: 'Đặng Văn G', package: 'Gói Tháng', expiryDate: '20/05/2026', days: 10 },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu tháng này"
          value="67.000.000đ"
          change="12.5%"
          changeType="increase"
          icon={DollarSign}
          iconBg="bg-green-500"
        />
        <StatCard
          title="Tổng hội viên"
          value="189"
          change="8.2%"
          changeType="increase"
          icon={Users}
          iconBg="bg-blue-500"
        />
        <StatCard
          title="Hội viên mới tháng này"
          value="23"
          change="15.3%"
          changeType="increase"
          icon={UserPlus}
          iconBg="bg-[var(--accent)]"
        />
        <StatCard
          title="Gói sắp hết hạn"
          value="12"
          change="3.1%"
          changeType="decrease"
          icon={AlertCircle}
          iconBg="bg-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Biểu đồ doanh thu</h3>
              <p className="text-sm text-gray-500">6 tháng gần nhất</p>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData} id="revenue-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#FF7A00"
                strokeWidth={2}
                name="Doanh thu (VNĐ)"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Tăng trưởng hội viên</h3>
              <p className="text-sm text-gray-500">6 tháng gần nhất</p>
            </div>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData} id="members-chart">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar
                dataKey="members"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                name="Số hội viên"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Package Distribution & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Phân bổ gói tập</h3>
              <p className="text-sm text-gray-500">Theo số lượng hội viên</p>
            </div>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart id="package-chart">
              <Pie
                data={packageData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {packageData.map((entry) => (
                  <Cell key={`package-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Members */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Hội viên mới</h3>
              <p className="text-sm text-gray-500">Đăng ký gần đây</p>
            </div>
            <UserPlus className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div className="space-y-4">
            {recentMembers.map((member) => (
              <div key={`member-${member.name}-${member.date}`} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)] to-orange-600 flex items-center justify-center text-white font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-xs text-gray-500">{member.package}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{member.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Expiries */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sắp hết hạn</h3>
              <p className="text-sm text-gray-500">Cần gia hạn sớm</p>
            </div>
            <Calendar className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            {upcomingExpiries.map((member) => (
              <div key={`expiry-${member.name}-${member.expiryDate}`} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                <div>
                  <p className="font-medium text-gray-900">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.package}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-red-600">{member.days} ngày</p>
                  <p className="text-xs text-gray-400">{member.expiryDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[var(--accent)] to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Thao tác nhanh</h3>
            <p className="text-orange-100">Quản lý phòng tập của bạn hiệu quả hơn</p>
          </div>
          <div className="flex gap-3">
            <button className="px-6 py-3 bg-white text-[var(--accent)] rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Thêm hội viên mới
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
              Tạo gói tập
            </button>
            <button className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-lg font-medium hover:bg-white/30 transition-colors">
              Xem báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
