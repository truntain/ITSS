import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: LucideIcon;
  iconBg: string;
}

export function StatCard({ title, value, change, changeType, icon: Icon, iconBg }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{value}</h3>
          {change && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↑' : '↓'} {change}
              </span>
              <span className="text-xs text-gray-500">so với tháng trước</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
