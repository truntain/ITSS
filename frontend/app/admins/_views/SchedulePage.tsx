"use client";

import { ChevronLeft, ChevronRight, Copy, MapPin, Plus, X, Trash } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { addWeeks, startOfWeek, format, isSameDay, addDays, differenceInWeeks } from 'date-fns';

interface ShiftEvent {
  id: string;
  staffName: string;
  role: 'manager' | 'pt' | 'receptionist';
  time: string;
  location: string;
}

interface DaySchedule {
  date: Date;
  shifts: ShiftEvent[];
}

const locations = [
  'Khu vực Tạ',
  'Khu Cardio',
  'Phòng Yoga',
  'Lễ tân',
  'Toàn bộ',
];

const shiftPresets = [
  { label: 'Ca sáng', value: '06:00 - 14:00' },
  { label: 'Ca chiều', value: '14:00 - 22:00' },
  { label: 'Ca hành chính', value: '08:00 - 17:00' },
];

const getRoleColor = (role: string) => {
  switch (role) {
    case 'manager':
      return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'pt':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'receptionist':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'manager':
      return 'Quản lý';
    case 'pt':
      return 'PT';
    case 'receptionist':
      return 'Lễ tân';
    default:
      return '';
  }
};

const monthsList = [
  { value: 0, label: 'Tháng 1' },
  { value: 1, label: 'Tháng 2' },
  { value: 2, label: 'Tháng 3' },
  { value: 3, label: 'Tháng 4' },
  { value: 4, label: 'Tháng 5' },
  { value: 5, label: 'Tháng 6' },
  { value: 6, label: 'Tháng 7' },
  { value: 7, label: 'Tháng 8' },
  { value: 8, label: 'Tháng 9' },
  { value: 9, label: 'Tháng 10' },
  { value: 10, label: 'Tháng 11' },
  { value: 11, label: 'Tháng 12' },
];

const getFirstWeekOfMonth = (year: number, month: number): Date => {
  let d = new Date(year, month, 1);
  while (d.getDay() !== 1) {
    d.setDate(d.getDate() + 1);
  }
  const firstMonday = new Date(d);
  const prevMonday = new Date(firstMonday);
  prevMonday.setDate(prevMonday.getDate() - 7);
  if (prevMonday.getMonth() === month || (firstMonday.getDate() > 1 && firstMonday.getDate() <= 7)) {
    return prevMonday;
  }
  return firstMonday;
};

export function SchedulePage() {
  const [hoveredShift, setHoveredShift] = useState<string | null>(null);
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(today, { weekStartsOn: 1 }) // Monday as first day
  );

  const [shifts, setShifts] = useState<Record<string, ShiftEvent[]>>({});
  const [staffsList, setStaffsList] = useState<{ id: string; name: string; role: 'manager' | 'pt' | 'receptionist'; dbRole: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Form state
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [customStartTime, setCustomStartTime] = useState('');
  const [customEndTime, setCustomEndTime] = useState('');

  // Month & Week selection states
  const [selectedMonth, setSelectedMonth] = useState(currentWeekStart.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentWeekStart.getFullYear());
  const [weeksInMonth, setWeeksInMonth] = useState<Date[]>([]);



  useEffect(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const mondays: Date[] = [];
    
    let d = new Date(year, month, 1);
    while (d.getDay() !== 1) {
      d.setDate(d.getDate() + 1);
    }
    
    const firstMonday = new Date(d);
    const prevMonday = new Date(firstMonday);
    prevMonday.setDate(prevMonday.getDate() - 7);
    if (prevMonday.getMonth() === month || (firstMonday.getDate() > 1 && firstMonday.getDate() <= 7)) {
      mondays.push(prevMonday);
    }
    
    while (d.getMonth() === month) {
      mondays.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
    
    setWeeksInMonth(mondays);
  }, [selectedMonth, selectedYear]);

  const mapDbRoleToFrontend = (dbRole: string): 'manager' | 'pt' | 'receptionist' => {
    if (dbRole === 'PT') return 'pt';
    if (dbRole === 'AD') return 'manager';
    return 'receptionist';
  };

  const fetchStaffs = useCallback(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/staffs', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((user: any) => ({
          id: String(user.id),
          name: user.fullName || user.email,
          role: mapDbRoleToFrontend(user.role),
          dbRole: user.role,
        }));
        setStaffsList(formatted);
      })
      .catch(err => console.error('Error fetching staffs:', err));
  }, []);

  const fetchShifts = useCallback(() => {
    const startDate = format(currentWeekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(currentWeekStart, 6), 'yyyy-MM-dd');
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`http://localhost:3001/work-shifts?startDate=${startDate}&endDate=${endDate}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        const grouped: Record<string, ShiftEvent[]> = {};
        data.forEach((item: any) => {
          const dateKey = item.date;
          if (!grouped[dateKey]) {
            grouped[dateKey] = [];
          }
          const frontendRole = mapDbRoleToFrontend(item.employee?.role || 'NV');
          const startTime = item.startTime.slice(0, 5);
          const endTime = item.endTime.slice(0, 5);
          
          grouped[dateKey].push({
            id: String(item.id),
            staffName: item.employee?.fullName || 'N/A',
            role: frontendRole,
            time: `${startTime} - ${endTime}`,
            location: item.roleShift || '',
          });
        });
        setShifts(grouped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching shifts:', err);
        setLoading(false);
      });
  }, [currentWeekStart]);

  useEffect(() => {
    fetchStaffs();
  }, [fetchStaffs]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  // Generate 7 days for the current week
  const generateWeekDays = (weekStart: Date): DaySchedule[] => {
    return Array.from({ length: 7 }, (_, index) => {
      const currentDay = addDays(weekStart, index);
      const dateKey = format(currentDay, 'yyyy-MM-dd');

      return {
        date: currentDay,
        shifts: shifts[dateKey] || [],
      };
    });
  };

  const currentWeekSchedule = generateWeekDays(currentWeekStart);

  const getWeekLabel = () => {
    const weekEnd = addDays(currentWeekStart, 6);
    const startStr = format(currentWeekStart, 'dd/MM');
    const endStr = format(weekEnd, 'dd/MM');

    // Check if it's current week
    const todayWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    if (isSameDay(currentWeekStart, todayWeekStart)) {
      return `Tuần này (${startStr} - ${endStr})`;
    }

    return `Tuần (${startStr} - ${endStr})`;
  };

  const goToPreviousWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, -1);
    setCurrentWeekStart(nextWeek);
    const middleOfWeek = addDays(nextWeek, 3);
    setSelectedMonth(middleOfWeek.getMonth());
    setSelectedYear(middleOfWeek.getFullYear());
  };

  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(nextWeek);
    const middleOfWeek = addDays(nextWeek, 3);
    setSelectedMonth(middleOfWeek.getMonth());
    setSelectedYear(middleOfWeek.getFullYear());
  };

  // Check if at 4-week limit
  const isAtWeekLimit = () => {
    return false;
  };

  // Check if current week is beyond 4-week limit (should show blank)
  const isBeyondLimit = () => {
    return false;
  };

  const openAddShiftModal = (date: Date) => {
    setSelectedDate(date);
    setShowAddModal(true);
    // Reset form
    setSelectedStaff('');
    setSelectedLocation('');
    setSelectedPreset('');
    setCustomStartTime('');
    setCustomEndTime('');
  };

  const handleAddShift = () => {
    if (!selectedDate || !selectedStaff || !selectedLocation) return;

    let startTimeStr = '';
    let endTimeStr = '';

    if (selectedPreset) {
      const [start, end] = selectedPreset.split(' - ');
      startTimeStr = start;
      endTimeStr = end;
    } else if (customStartTime && customEndTime) {
      startTimeStr = customStartTime;
      endTimeStr = customEndTime;
    } else {
      return; // Invalid time
    }

    const payload = {
      employeeId: parseInt(selectedStaff, 10),
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: startTimeStr,
      endTime: endTimeStr,
      roleShift: selectedLocation,
    };

    const token = localStorage.getItem('token');
    fetch('http://localhost:3001/work-shifts', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => null);
          const message = errData?.message || 'Failed to create shift';
          throw new Error(Array.isArray(message) ? message.join(', ') : message);
        }
        return res.json();
      })
      .then(() => {
        fetchShifts();
        setShowAddModal(false);
      })
      .catch(err => {
        console.error(err);
        alert(`Lỗi khi lưu ca trực: ${err.message}`);
      });
  };

  const handleDeleteShift = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ca trực này không?')) return;

    const token = localStorage.getItem('token');
    fetch(`http://localhost:3001/work-shifts/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete shift');
        fetchShifts();
      })
      .catch(err => {
        console.error(err);
        alert('Lỗi khi xóa ca trực');
      });
  };

  const copyLastWeekSchedule = () => {
    const lastWeekStart = addWeeks(currentWeekStart, -1);
    const startDate = format(lastWeekStart, 'yyyy-MM-dd');
    const endDate = format(addDays(lastWeekStart, 6), 'yyyy-MM-dd');
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3001/work-shifts?startDate=${startDate}&endDate=${endDate}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    })
      .then(res => res.json())
      .then(data => {
        if (data.length === 0) {
          alert('Tuần trước không có ca trực nào để copy!');
          return;
        }

        const payload = data.map((item: any) => {
          const originalDate = new Date(item.date);
          const newDate = addDays(originalDate, 7);
          return {
            employeeId: item.employeeId,
            date: format(newDate, 'yyyy-MM-dd'),
            startTime: item.startTime,
            endTime: item.endTime,
            roleShift: item.roleShift,
          };
        });

        return fetch('http://localhost:3001/work-shifts/bulk', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        });
      })
      .then(res => {
        if (res) {
          if (!res.ok) throw new Error('Bulk copy failed');
          return res.json();
        }
      })
      .then(saved => {
        if (saved) {
          fetchShifts();
          alert('Copy lịch tuần trước thành công!');
        }
      })
      .catch(err => {
        console.error(err);
        alert('Lỗi khi copy lịch trực');
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Lịch làm việc</h2>
          <p className="text-[var(--muted-foreground)]">Quản lý ca trực nhân viên</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Chọn Năm */}
          <select
            value={selectedYear}
            onChange={(e) => {
              const newYear = parseInt(e.target.value, 10);
              setSelectedYear(newYear);
              const firstWeek = getFirstWeekOfMonth(newYear, selectedMonth);
              setCurrentWeekStart(firstWeek);
            }}
            className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
          >
            {[2025, 2026, 2027, 2028].map(y => (
              <option key={y} value={y}>Năm {y}</option>
            ))}
          </select>

          {/* Chọn Tháng */}
          <select
            value={selectedMonth}
            onChange={(e) => {
              const newMonth = parseInt(e.target.value, 10);
              setSelectedMonth(newMonth);
              const firstWeek = getFirstWeekOfMonth(selectedYear, newMonth);
              setCurrentWeekStart(firstWeek);
            }}
            className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
          >
            {monthsList.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          {/* Chọn Tuần */}
          <select
            value={format(currentWeekStart, 'yyyy-MM-dd')}
            onChange={(e) => {
              const selectedDateObj = new Date(e.target.value);
              setCurrentWeekStart(selectedDateObj);
            }}
            className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] min-w-[220px] cursor-pointer"
          >
            {weeksInMonth.map((week, idx) => {
              const end = addDays(week, 6);
              const val = format(week, 'yyyy-MM-dd');
              return (
                <option key={val} value={val}>
                  Tuần {idx + 1} ({format(week, 'dd/MM')} - {format(end, 'dd/MM')})
                </option>
              );
            })}
            {!weeksInMonth.some(w => format(w, 'yyyy-MM-dd') === format(currentWeekStart, 'yyyy-MM-dd')) && (
              <option value={format(currentWeekStart, 'yyyy-MM-dd')}>
                Tuần đang chọn ({format(currentWeekStart, 'dd/MM')} - {format(addDays(currentWeekStart, 6), 'dd/MM')})
              </option>
            )}
          </select>

          {/* Nút Điều Hướng */}
          <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] shadow-sm">
            <button
              onClick={goToPreviousWeek}
              className="p-2 hover:bg-[var(--secondary)] border-r border-[var(--border)] transition-colors"
              title="Tuần trước"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--foreground)]" />
            </button>
            <button
              onClick={goToNextWeek}
              className="p-2 hover:bg-[var(--secondary)] transition-colors"
              title="Tuần sau"
            >
              <ChevronRight className="w-5 h-5 text-[var(--foreground)]" />
            </button>
          </div>

          <button
            onClick={copyLastWeekSchedule}
            className="ml-4 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy lịch tuần trước
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {isBeyondLimit() ? (
        <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm p-12 text-center">
          <p className="text-[var(--muted-foreground)] text-lg">
            Không thể xem lịch quá 4 tuần trong tương lai
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[var(--border)]">
            {currentWeekSchedule.map((day, index) => {
              const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
              const dayOfWeek = dayNames[index];
              const isToday = isSameDay(day.date, today);

              return (
                <div
                  key={index}
                  className={`p-4 text-center border-r border-[var(--border)] last:border-r-0 transition-colors ${
                    isToday
                      ? 'bg-orange-100 border-orange-300'
                      : dayOfWeek === 'CN'
                      ? 'bg-red-50'
                      : 'bg-[var(--secondary)]'
                  }`}
                >
                  <p className={`text-xs mb-1 font-medium ${isToday ? 'text-orange-700' : 'text-[var(--muted-foreground)]'}`}>
                    {dayOfWeek}
                  </p>
                  <p className={`font-bold ${isToday ? 'text-orange-800' : 'text-[var(--foreground)]'}`}>
                    {format(day.date, 'dd/MM')}
                  </p>
                  {isToday && (
                    <p className="text-[10px] text-orange-600 mt-1 font-medium">Hôm nay</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            {currentWeekSchedule.map((day, dayIndex) => {
              const isToday = isSameDay(day.date, today);

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[320px] p-3 border-r border-[var(--border)] last:border-r-0 space-y-2 ${
                    isToday ? 'bg-orange-50/20' : ''
                  }`}
                >
                  {day.shifts.map((shift) => {
                    const isShiftToday = isToday;

                    return (
                      <div
                        key={shift.id}
                        className="relative animate-fadeIn"
                        onMouseEnter={() => setHoveredShift(shift.id)}
                        onMouseLeave={() => setHoveredShift(null)}
                      >
                        <div
                          className={`p-3 rounded-md border shadow-sm hover:shadow-md transition-all ${getRoleColor(shift.role)} ${
                            isShiftToday
                              ? 'ring-2 ring-orange-400 border-orange-300'
                              : ''
                          }`}
                          style={{ fontFamily: 'Arial, sans-serif' }}
                        >
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <p className="font-medium text-sm flex-1 truncate">{shift.staffName}</p>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {isShiftToday && (
                                <span className="text-[9px] px-1.5 py-0.5 bg-orange-500 text-white rounded-full font-medium">
                                  Đang trực
                                </span>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteShift(shift.id);
                                }}
                                className="p-1 hover:bg-black/10 rounded text-red-600 transition-colors"
                                title="Xóa ca trực"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs opacity-80">{shift.time}</p>
                          <p className="text-xs opacity-70 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {shift.location}
                          </p>
                        </div>

                        {/* Tooltip */}
                        {hoveredShift === shift.id && (
                          <div className={`absolute z-20 top-0 w-56 p-3 bg-white border border-slate-200 rounded-lg shadow-md ${
                            dayIndex >= 5 ? 'right-full mr-2' : 'left-full ml-2'
                          }`}>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Ca làm việc:</span>
                                <span className="text-sm font-medium text-slate-800">{shift.time}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Vị trí trực:</span>
                                <span className="text-sm font-medium text-slate-800">{shift.location}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Shift Button */}
                  <button
                    onClick={() => openAddShiftModal(day.date)}
                    className="w-full p-3 border-2 border-dashed border-slate-300 hover:border-[var(--primary)] rounded-md text-slate-400 hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Thêm ca trực</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 bg-white rounded-lg p-4 border border-[var(--border)] shadow-sm">
        <span className="text-sm font-medium text-[var(--foreground)]">Chú thích:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
          <span className="text-sm text-[var(--muted-foreground)]">Quản lý</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
          <span className="text-sm text-[var(--muted-foreground)]">Huấn luyện viên PT</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
          <span className="text-sm text-[var(--muted-foreground)]">Lễ tân</span>
        </div>
      </div>

      {/* Add Shift Modal */}
      {showAddModal && selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowAddModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Thêm ca trực mới</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {format(selectedDate, 'EEEE, dd/MM/yyyy')}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {/* Staff Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Chọn nhân viên
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {staffsList
                      .filter(staff => staff.dbRole === 'NV')
                      .map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.name} ({getRoleLabel(staff.role)})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Location Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Vị trí trực
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  >
                    <option value="">-- Chọn vị trí --</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Shift Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Ca làm việc
                  </label>

                  {/* Preset Options */}
                  <div className="space-y-2 mb-3">
                    {shiftPresets.map(preset => (
                      <label
                        key={preset.value}
                        className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name="shift-preset"
                          value={preset.value}
                          checked={selectedPreset === preset.value}
                          onChange={(e) => {
                            setSelectedPreset(e.target.value);
                            setCustomStartTime('');
                            setCustomEndTime('');
                          }}
                          className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{preset.label}</p>
                          <p className="text-xs text-slate-600">{preset.value}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Custom Time Picker */}
                  <div className="border-t border-slate-200 pt-3">
                    <label className="flex items-center gap-3 mb-3">
                      <input
                        type="radio"
                        name="shift-preset"
                        checked={selectedPreset === '' && (customStartTime !== '' || customEndTime !== '')}
                        onChange={() => setSelectedPreset('')}
                        className="w-4 h-4 text-[var(--primary)] focus:ring-[var(--primary)]"
                      />
                      <span className="font-medium text-slate-900">Tùy chỉnh thời gian</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3 ml-7">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Giờ bắt đầu</label>
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={(e) => {
                            setCustomStartTime(e.target.value);
                            setSelectedPreset('');
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">Giờ kết thúc</label>
                        <input
                          type="time"
                          value={customEndTime}
                          onChange={(e) => {
                            setCustomEndTime(e.target.value);
                            setSelectedPreset('');
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end flex-shrink-0">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleAddShift}
                  disabled={!selectedStaff || !selectedLocation || (!selectedPreset && (!customStartTime || !customEndTime))}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Lưu ca trực
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
