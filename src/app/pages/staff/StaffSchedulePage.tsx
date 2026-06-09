import { useState } from 'react';
import { Bell, BellDot, ChevronLeft, ChevronRight } from 'lucide-react';

type ViewMode = 'month' | 'week';

interface ShiftDay { date: string; shift: string; type: 'morning' | 'afternoon' | 'off' }

// shifts keyed by YYYY-MM-DD
const ALL_SHIFTS: ShiftDay[] = [
  // June 2026
  { date: '2026-06-02', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-03', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-05', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-06-06', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-09', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-10', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-12', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-06-13', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-16', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-17', shift: 'Nghỉ phép', type: 'off' },
  { date: '2026-06-19', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-20', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-23', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-06-24', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-26', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-27', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-06-30', shift: '06:00–14:00', type: 'morning' },
  // July 2026
  { date: '2026-07-01', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-07-02', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-07-03', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-07-06', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-07-07', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-07-08', shift: 'Nghỉ phép', type: 'off' },
  { date: '2026-07-09', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-07-10', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-07-13', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-07-14', shift: '06:00–14:00', type: 'morning' },
  // May 2026
  { date: '2026-05-04', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-05', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-05-06', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-11', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-12', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-13', shift: 'Nghỉ phép', type: 'off' },
  { date: '2026-05-18', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-05-19', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-20', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-25', shift: '06:00–14:00', type: 'morning' },
  { date: '2026-05-26', shift: '14:00–22:00', type: 'afternoon' },
  { date: '2026-05-27', shift: '06:00–14:00', type: 'morning' },
];

const shiftStyle = {
  morning: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700' },
  afternoon: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
  off: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
};

interface Notice { id: number; title: string; body: string; time: string; tag: string; tagClass: string }

const NOTICES: Notice[] = [
  { id: 1, title: 'Chương trình khuyến mãi lễ 30/4 – 1/5', body: 'Giảm 20% tất cả gói tập từ 28/4 đến 02/5. Áp dụng mã HOLIDAY20 tại quầy.', time: '05/06', tag: 'Khuyến mãi', tagClass: 'bg-orange-100 text-orange-700' },
  { id: 2, title: 'Nội quy mới về đồng phục nhân viên', body: 'Từ ngày 10/06, toàn bộ nhân viên phải mặc áo polo xanh có logo GymPro khi làm việc.', time: '04/06', tag: 'Nội quy', tagClass: 'bg-blue-100 text-blue-700' },
  { id: 3, title: 'Đào tạo kỹ năng bán hàng tháng 6', body: 'Buổi đào tạo kỹ năng sales sẽ tổ chức vào 14/06 lúc 09:00 tại phòng họp. Bắt buộc tham dự.', time: '03/06', tag: 'Đào tạo', tagClass: 'bg-purple-100 text-purple-700' },
  { id: 4, title: 'Cập nhật quy trình xử lý check-in', body: 'Từ hôm nay, mọi trường hợp gói hết hạn cần báo Admin ngay thay vì tự xử lý.', time: '01/06', tag: 'Quy trình', tagClass: 'bg-emerald-100 text-emerald-700' },
  { id: 5, title: 'Kết quả thi đua tháng 5/2026', body: 'Nguyễn Văn A dẫn đầu với 42 giao dịch. Chúc mừng!', time: '31/05', tag: 'Thông báo', tagClass: 'bg-slate-100 text-slate-600' },
];

const DAYS_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTH_NAMES = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

function toKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

function startOfWeek(d: Date) {
  const r = new Date(d);
  const day = r.getDay(); // 0=Sun
  r.setDate(r.getDate() - day);
  return r;
}

export function StaffSchedulePage() {
  const TODAY = new Date(2026, 5, 6); // June 6 2026
  const [view, setView] = useState<ViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1)); // June 2026
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(TODAY));
  const [readSet, setReadSet] = useState<Set<number>>(new Set([4, 5]));
  const [selectedDate, setSelectedDate] = useState<string | null>(toKey(TODAY));

  const shiftMap = new Map(ALL_SHIFTS.map(s => [s.date, s]));
  const unreadCount = NOTICES.filter(n => !readSet.has(n.id)).length;

  // ---- MONTH VIEW ----
  const renderMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div>
        {/* nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentMonth(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
          <span className="font-bold text-[var(--foreground)] text-sm">{MONTH_NAMES[month]} {year}</span>
          <button onClick={() => setCurrentMonth(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* day headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-[var(--muted-foreground)] py-1 uppercase">{d}</div>
          ))}
        </div>

        {/* cells */}
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((date, i) => {
            if (!date) return <div key={i} className="min-h-[48px]" />;
            const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
            const shift = shiftMap.get(key);
            const isToday = key === toKey(TODAY);
            const isSelected = key === selectedDate;
            const style = shift ? shiftStyle[shift.type] : null;
            return (
              <button key={i} onClick={() => setSelectedDate(key)}
                className={`min-h-[48px] p-1 rounded-lg border text-left transition-all ${isSelected ? 'border-orange-400 ring-1 ring-orange-300' : isToday ? 'border-orange-300' : 'border-[var(--border)] hover:border-slate-300'}`}>
                <span className={`text-[10px] font-bold block mb-0.5 ${isToday ? 'text-orange-500' : 'text-[var(--muted-foreground)]'}`}>{date}</span>
                {shift && style && (
                  <div className={`text-[9px] font-semibold px-1 py-0.5 rounded leading-tight ${style.bg} ${style.text}`}>
                    {shift.type === 'off' ? 'Nghỉ' : shift.shift.split('–')[0]}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- WEEK VIEW ----
  const renderWeek = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
    const weekStart = days[0];
    const weekEnd = days[6];
    const fmt = (d: Date) => `${d.getDate()}/${d.getMonth() + 1}`;

    return (
      <div>
        {/* nav */}
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
          <span className="font-bold text-[var(--foreground)] text-sm">
            {fmt(weekStart)} – {fmt(weekEnd)}/{weekEnd.getFullYear()}
          </span>
          <button onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
        </div>

        <div className="space-y-2">
          {days.map((day) => {
            const key = toKey(day);
            const shift = shiftMap.get(key);
            const isToday = key === toKey(TODAY);
            const isSelected = key === selectedDate;
            const style = shift ? shiftStyle[shift.type] : null;
            const dayName = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][day.getDay()];
            return (
              <button key={key} onClick={() => setSelectedDate(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-left ${isSelected ? 'border-orange-400 bg-orange-50' : isToday ? 'border-orange-300 bg-orange-50/50' : 'border-[var(--border)] bg-[var(--background)] hover:border-slate-300'}`}>
                <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center flex-shrink-0 ${isToday ? 'bg-orange-500' : 'bg-[var(--secondary)]'}`}>
                  <span className={`text-[10px] font-bold leading-none ${isToday ? 'text-white' : 'text-[var(--muted-foreground)]'}`}>{DAYS_SHORT[day.getDay()]}</span>
                  <span className={`text-sm font-bold leading-none mt-0.5 ${isToday ? 'text-white' : 'text-[var(--foreground)]'}`}>{day.getDate()}</span>
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isToday ? 'text-orange-600' : 'text-[var(--foreground)]'}`}>{dayName}{isToday ? ' (Hôm nay)' : ''}</span>
                  {shift && style ? (
                    <span className={`ml-2 text-xs font-semibold px-2 py-0.5 rounded-full ${style.badge}`}>{shift.shift}</span>
                  ) : (
                    <span className="ml-2 text-xs text-[var(--muted-foreground)]">Không có ca</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // ---- selected date detail ----
  const selectedShift = selectedDate ? shiftMap.get(selectedDate) : null;

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* Calendar */}
      <div className="col-span-3 space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          {/* View toggle */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[var(--foreground)]">Lịch cá nhân</h2>
            <div className="flex gap-1 bg-[var(--secondary)] p-0.5 rounded-lg">
              {(['month', 'week'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${view === v ? 'bg-white text-[var(--foreground)] shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
                  {v === 'month' ? 'Tháng' : 'Tuần'}
                </button>
              ))}
            </div>
          </div>

          {view === 'month' ? renderMonth() : renderWeek()}

          {/* Legend */}
          <div className="flex gap-4 mt-3 pt-3 border-t border-[var(--border)]">
            {[
              { label: 'Ca sáng 06–14h', cls: 'bg-orange-500' },
              { label: 'Ca chiều 14–22h', cls: 'bg-blue-500' },
              { label: 'Nghỉ phép', cls: 'bg-emerald-500' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.cls}`} />
                <span className="text-xs text-[var(--muted-foreground)]">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected date detail */}
        {selectedDate && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">
              Chi tiết ngày {selectedDate.split('-').reverse().join('/')}
              {selectedDate === toKey(TODAY) && <span className="ml-2 text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Hôm nay</span>}
            </h3>
            {selectedShift ? (
              <div className={`rounded-lg p-3 ${shiftStyle[selectedShift.type].bg}`}>
                <p className={`font-bold text-base ${shiftStyle[selectedShift.type].text}`}>{selectedShift.shift}</p>
                <p className={`text-xs mt-0.5 ${shiftStyle[selectedShift.type].text} opacity-75`}>
                  {selectedShift.type === 'morning' ? 'Ca sáng' : selectedShift.type === 'afternoon' ? 'Ca chiều' : 'Ngày nghỉ phép'}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Không có ca làm việc trong ngày này.</p>
            )}
          </div>
        )}
      </div>

      {/* Notice Board */}
      <div className="col-span-2">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {unreadCount > 0 ? <BellDot className="w-4 h-4 text-orange-500" /> : <Bell className="w-4 h-4 text-[var(--muted-foreground)]" />}
              <h2 className="text-sm font-bold text-[var(--foreground)]">Bảng tin nội bộ</h2>
            </div>
            {unreadCount > 0 && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadCount} mới</span>
            )}
          </div>
          <div className="space-y-2">
            {NOTICES.map(notice => {
              const isRead = readSet.has(notice.id);
              return (
                <button key={notice.id} onClick={() => setReadSet(prev => new Set([...prev, notice.id]))}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${isRead ? 'border-[var(--border)] bg-[var(--background)]' : 'border-orange-200 bg-orange-50'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${notice.tagClass}`}>{notice.tag}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)]">{notice.time}</span>
                  </div>
                  <p className={`text-xs font-semibold mb-0.5 ${isRead ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>{notice.title}</p>
                  <p className="text-[10px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">{notice.body}</p>
                  {!isRead && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
