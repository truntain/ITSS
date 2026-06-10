import { DollarSign, Users, UserPlus, AlertCircle, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data
const memberGrowthData = [
  { id: 'mg1', month: 'T1', members: 120 },
  { id: 'mg2', month: 'T2', members: 145 },
  { id: 'mg3', month: 'T3', members: 138 },
  { id: 'mg4', month: 'T4', members: 167 },
  { id: 'mg5', month: 'T5', members: 156 },
  { id: 'mg6', month: 'T6', members: 189 },
  { id: 'mg7', month: 'T7', members: 201 },
  { id: 'mg8', month: 'T8', members: 225 },
  { id: 'mg9', month: 'T9', members: 242 },
  { id: 'mg10', month: 'T10', members: 268 },
  { id: 'mg11', month: 'T11', members: 285 },
  { id: 'mg12', month: 'T12', members: 310 },
];

const packageDistribution = [
  { id: 'pkg1', name: 'Gói 1 tháng', value: 45, color: '#3b82f6' },
  { id: 'pkg2', name: 'Gói 3 tháng', value: 30, color: '#FF7A00' },
  { id: 'pkg3', name: 'Gói 1 năm', value: 25, color: '#10b981' },
];

const recentActivities = [
  { id: 1, name: 'Nguyễn Văn An', avatar: 'NA', action: 'Mua gói 1 năm', time: '5 phút trước', type: 'purchase' },
  { id: 2, name: 'Trần Thị Bình', avatar: 'TB', action: 'Check-in lúc 18:30', time: '12 phút trước', type: 'checkin' },
  { id: 3, name: 'Lê Minh Cường', avatar: 'LC', action: 'Mua gói 3 tháng', time: '25 phút trước', type: 'purchase' },
  { id: 4, name: 'Phạm Thu Dung', avatar: 'PD', action: 'Check-in lúc 18:15', time: '30 phút trước', type: 'checkin' },
  { id: 5, name: 'Hoàng Văn Em', avatar: 'HE', action: 'Gia hạn gói tập', time: '1 giờ trước', type: 'renewal' },
];

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

export function NewDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng doanh thu"
          value="67.000.000đ"
          change="+12.5%"
          isIncrease={true}
          icon={DollarSign}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Hội viên mới"
          value="23"
          change="+8.2%"
          isIncrease={true}
          icon={UserPlus}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Đang hoạt động"
          value="189"
          change="+5.1%"
          isIncrease={true}
          icon={Users}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatCard
          title="Sắp hết hạn"
          value="12"
          change="-3.2%"
          isIncrease={false}
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
                name="Số hội viên"
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
                {packageDistribution.map((entry) => (
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
          <div className="space-y-2 mt-4">
            {packageDistribution.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-[var(--foreground)]">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-[var(--foreground)]">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--foreground)]">Hoạt động gần nhất</h3>
          <p className="text-sm text-[var(--muted-foreground)]">Danh sách check-in và giao dịch mới nhất</p>
        </div>
        <div className="overflow-x-auto">
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
              {recentActivities.map((activity) => (
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
                    {activity.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
