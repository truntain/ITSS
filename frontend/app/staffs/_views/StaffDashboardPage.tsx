import { useState, useEffect } from 'react';
import { Users, DollarSign, MessageSquare, ShoppingCart, Wrench, RefreshCw, Clock, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:3001';

interface StaffDashboardPageProps {
  onMenuClick: (menu: string) => void;
}

export function StaffDashboardPage({ onMenuClick }: StaffDashboardPageProps) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [todayCheckins, setTodayCheckins] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [myShift, setMyShift] = useState<any>(null);
  const [ptOnShift, setPtOnShift] = useState<{ name: string; shift: string; color: string }[]>([]);

  // Load current user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) setCurrentUser(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Lấy check-ins hôm nay (từ API checkins)
    const fetchCheckins = fetch(`${API_BASE}/checkins`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then((data: any[]) => {
        const todayCheckinList = data.filter((c: any) => {
          const d = new Date(c.checkedInAt);
          return d.toISOString().split('T')[0] === todayStr;
        });
        setTodayCheckins(todayCheckinList.length);
      })
      .catch(() => {});

    // 2. Lấy ca làm việc hôm nay của bản thân và PT
    const fetchShifts = fetch(
      `${API_BASE}/work-shifts?startDate=${todayStr}&endDate=${todayStr}`,
      { headers }
    )
      .then(res => res.ok ? res.json() : [])
      .then((data: any[]) => {
        // Tìm ca của user hiện tại
        const myShiftData = data.find((s: any) => s.employeeId === currentUser.id);
        setMyShift(myShiftData || null);

        // PT cùng ca
        const PT_COLORS = ['#FF7A00', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];
        const ptShifts = data.filter((s: any) =>
          s.employee?.role === 'PT' && s.employeeId !== currentUser.id
        );
        setPtOnShift(ptShifts.map((s: any, i: number) => ({
          name: s.employee?.fullName || 'PT',
          shift: `${s.startTime?.slice(0, 5)} – ${s.endTime?.slice(0, 5)}`,
          color: PT_COLORS[i % PT_COLORS.length],
        })));
      })
      .catch(() => {});

    Promise.all([fetchCheckins, fetchShifts]).finally(() => setLoading(false));
  }, [currentUser]);

  function formatRevenue(amount: number): string {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
    return String(amount);
  }

  function getElapsedAndRemaining(startTime: string, endTime: string): { elapsed: string; remaining: string } {
    const now = new Date();
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);

    const startMs = sh * 3600000 + sm * 60000;
    const endMs = eh * 3600000 + em * 60000;
    const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000;

    const elapsedMs = Math.max(0, nowMs - startMs);
    const remainMs = Math.max(0, endMs - nowMs);

    const fmtH = (ms: number) => `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}p`;
    return { elapsed: fmtH(elapsedMs), remaining: fmtH(remainMs) };
  }

  const todayFormatted = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="ml-3 text-[var(--muted-foreground)]">Đang tải dữ liệu...</span>
      </div>
    );
  }

  const shiftTimes = myShift
    ? getElapsedAndRemaining(myShift.startTime, myShift.endTime)
    : { elapsed: '--', remaining: '--' };

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: 'Khách check-in hôm nay',
            value: String(todayCheckins),
            sub: 'Tổng trong ngày',
            icon: Users,
            color: 'text-orange-500',
          },
          {
            label: 'Doanh thu hôm nay',
            value: formatRevenue(todayRevenue),
            sub: 'VNĐ',
            icon: DollarSign,
            color: 'text-emerald-500',
          },
          {
            label: 'Ca trực hiện tại',
            value: myShift ? `${myShift.startTime?.slice(0,5)} – ${myShift.endTime?.slice(0,5)}` : 'Chưa có ca',
            sub: myShift?.roleShift || 'Không có thông tin',
            icon: Clock,
            color: 'text-blue-500',
          },
        ].map((s) => (
          <div key={s.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)] font-medium">{s.label}</span>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{s.value}</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
        <h2 className="text-sm font-bold text-[var(--foreground)] mb-3">Thao tác nhanh</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onMenuClick('sales')}
            className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200 hover:bg-orange-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Bán gói tập mới</p>
              <p className="text-xs text-slate-500">Đăng ký hội viên</p>
            </div>
          </button>
          <button
            onClick={() => onMenuClick('sales')}
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Gia hạn gói</p>
              <p className="text-xs text-slate-500">Hội viên cũ</p>
            </div>
          </button>
          <button
            onClick={() => onMenuClick('checkin')}
            className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Báo máy hỏng</p>
              <p className="text-xs text-slate-500">Sự cố thiết bị</p>
            </div>
          </button>
        </div>
      </div>

      {/* Shift Info */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Shift */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-bold text-[var(--foreground)]">Ca làm việc hôm nay</h3>
          </div>
          {myShift ? (
            <>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-orange-600 font-medium mb-0.5">Ca của bạn</p>
                <p className="text-xl font-bold text-orange-600">
                  {myShift.startTime?.slice(0, 5)} – {myShift.endTime?.slice(0, 5)}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{todayFormatted}</p>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 bg-[var(--secondary)] rounded-lg p-2 text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Đã làm</p>
                  <p className="text-base font-bold text-[var(--foreground)]">{shiftTimes.elapsed}</p>
                </div>
                <div className="flex-1 bg-[var(--secondary)] rounded-lg p-2 text-center">
                  <p className="text-xs text-[var(--muted-foreground)] mb-0.5">Còn lại</p>
                  <p className="text-base font-bold text-[var(--foreground)]">{shiftTimes.remaining}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-[var(--muted-foreground)] text-sm">
              Không có ca trực được xếp cho hôm nay
            </div>
          )}
        </div>

        {/* PT on shift */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">PT đang làm ca cùng</h3>
          {ptOnShift.length === 0 ? (
            <div className="py-6 text-center text-[var(--muted-foreground)] text-sm">
              Không có PT nào xếp ca hôm nay
            </div>
          ) : (
            <div className="space-y-2">
              {ptOnShift.map((pt) => (
                <div key={pt.name} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: pt.color }}
                    >
                      {pt.name.split(' ').pop()?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground)]">{pt.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{pt.shift}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
