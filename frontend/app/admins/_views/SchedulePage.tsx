"use client";

import { ChevronLeft, ChevronRight, Copy, MapPin, Plus, X, Trash, Calendar, Users, Star, CheckCircle, Clock } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { addWeeks, startOfWeek, format, isSameDay, addDays } from 'date-fns';

const API_BASE = 'http://localhost:3001';


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
  const [activeTab, setActiveTab] = useState<'staff' | 'pt'>('staff');
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

  // PT work schedule states
  const [selectedPt, setSelectedPt] = useState('');
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [overviewPopupDate, setOverviewPopupDate] = useState<string | null>(null);
  const [ptSelectedDate, setPtSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [ptWeekStart, setPtWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday of this week
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  const [ptAverageRating, setPtAverageRating] = useState<number>(5.0);

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

  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchStaffs = useCallback(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/staffs`, {
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
    fetch(`${API_BASE}/work-shifts?startDate=${startDate}&endDate=${endDate}`, {
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

  const fetchAllBookings = useCallback(() => {
    setBookingsLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`${API_BASE}/bookings`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllBookings(data);
        }
        setBookingsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching all bookings:', err);
        setBookingsLoading(false);
      });
  }, []);

  const fetchPtRatings = useCallback((ptId: number) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`${API_BASE}/trainers/ratings/all`, { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const myRatings = data.filter((r: any) => r.ptId === ptId);
          if (myRatings.length > 0) {
            const sum = myRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
            const avg = sum / myRatings.length;
            setPtAverageRating(parseFloat(avg.toFixed(1)));
          } else {
            setPtAverageRating(5.0);
          }
        }
      })
      .catch(err => console.error('Error fetching PT ratings:', err));
  }, []);

  useEffect(() => {
    fetchStaffs();
    fetchAllBookings();
  }, [fetchStaffs, fetchAllBookings]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  useEffect(() => {
    if (selectedPt) {
      fetchPtRatings(parseInt(selectedPt, 10));
    }
  }, [selectedPt, fetchPtRatings]);

  // PT week strip calculation
  const getPtWeekDays = () => {
    const days = [];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(ptWeekStart);
      date.setDate(ptWeekStart.getDate() + i);
      days.push({
        name: dayNames[i],
        dateObj: date,
        dateStr: formatDateStr(date),
        dayNum: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: formatDateStr(date) === formatDateStr(ptSelectedDate),
      });
    }
    return days;
  };

  const handlePtPrevWeek = () => {
    setPtWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handlePtNextWeek = () => {
    setPtWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  // Generate 7 days for the current week (Shifts)
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

  const openAddShiftModal = (date: Date) => {
    setSelectedDate(date);
    setShowAddModal(true);
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
      return;
    }

    const payload = {
      employeeId: parseInt(selectedStaff, 10),
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: startTimeStr,
      endTime: endTimeStr,
      roleShift: selectedLocation,
    };

    const token = localStorage.getItem('token');
    fetch(`${API_BASE}/work-shifts`, {
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
    fetch(`${API_BASE}/work-shifts/${id}`, {
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

    fetch(`${API_BASE}/work-shifts?startDate=${startDate}&endDate=${endDate}`, {
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

        return fetch(`${API_BASE}/work-shifts/bulk`, {
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

  // PT-specific calculations
  const ptIdNum = parseInt(selectedPt, 10);
  const ptBookings = allBookings.filter((b: any) => b.ptId === ptIdNum && b.status !== 'cancelled');
  const ptActiveClientsCount = new Set(ptBookings.map((b: any) => b.userId)).size;

  const getPtMonthlyHours = () => {
    const todayDate = new Date();
    const currentMonth = todayDate.getMonth();
    const currentYear = todayDate.getFullYear();

    const completedBookings = ptBookings.filter((b: any) => {
      const bDate = new Date(b.date);
      return (
        bDate.getMonth() === currentMonth &&
        bDate.getFullYear() === currentYear &&
        b.attendanceStatus === 'checked_in'
      );
    });
    return completedBookings.length;
  };

  const ptSelectedDateStr = formatDateStr(ptSelectedDate);
  const ptBookingsForSelectedDate = ptBookings.filter((b: any) => b.date === ptSelectedDateStr);

  const ptScheduleBlocks = ptBookingsForSelectedDate.map((item: any) => {
    let displayStatus: 'present' | 'absent' | 'future';
    if (item.attendanceStatus === 'checked_in') {
      displayStatus = 'present';
    } else {
      const timeSlotStart = item.timeSlot ? item.timeSlot.split(' - ')[0] : '00:00';
      const [hours, minutes] = timeSlotStart.split(':').map(Number);
      const bookingDateTime = new Date(item.date);
      bookingDateTime.setHours(hours, minutes, 0, 0);

      const now = new Date();
      if (now < bookingDateTime) {
        displayStatus = 'future';
      } else {
        displayStatus = 'absent';
      }
    }

    return {
      id: item.id,
      time: item.timeSlot,
      client: item.user?.fullName || 'Hội viên',
      type: item.type,
      room: item.room || 'Chưa xếp phòng',
      attendance: displayStatus,
    };
  });

  const getPtStatusColor = (attendance: 'present' | 'absent' | 'future') => {
    if (attendance === 'present') return 'bg-emerald-50 border-emerald-200';
    if (attendance === 'future') return 'bg-slate-50 border-slate-200';
    return 'bg-red-50 border-red-200';
  };

  const isPtSelectedToday = formatDateStr(ptSelectedDate) === formatDateStr(new Date());
  const selectedPtName = staffsList.find(s => s.id === selectedPt)?.name || 'Huấn luyện viên';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border)] pb-5">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Quản lý Lịch làm việc</h2>
          <p className="text-[var(--muted-foreground)]">Quản lý ca trực nhân viên và ca dạy huấn luyện viên (PT)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-2">
        <button
          onClick={() => setActiveTab('staff')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'staff'
              ? 'border-[var(--primary)] text-[var(--primary)] font-black'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Quản lý ca trực nhân viên
        </button>
        <button
          onClick={() => setActiveTab('pt')}
          className={`px-5 py-3 font-bold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'pt'
              ? 'border-[var(--primary)] text-[var(--primary)] font-black'
              : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Quản lý ca làm việc của PT
        </button>
      </div>

      {/* Tab 1: Staff Shifts */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Ca trực nhân viên quầy / lễ tân / quản lý</h3>
            <div className="flex items-center gap-3 flex-wrap">
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
                className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                Copy tuần trước
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="grid grid-cols-7 border-b border-[var(--border)] bg-slate-50">
              {currentWeekSchedule.map((day, index) => {
                const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
                const dayOfWeek = dayNames[index];
                const isToday = isSameDay(day.date, today);

                return (
                  <div
                    key={index}
                    className={`p-4 text-center border-r border-[var(--border)] last:border-r-0 transition-colors ${
                      isToday ? 'bg-orange-100/60 border-orange-300' : ''
                    }`}
                  >
                    <p className={`text-xs mb-1 font-bold ${isToday ? 'text-orange-700' : 'text-[var(--muted-foreground)]'}`}>
                      {dayOfWeek}
                    </p>
                    <p className={`font-black ${isToday ? 'text-orange-800' : 'text-[var(--foreground)]'}`}>
                      {format(day.date, 'dd/MM')}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-7">
              {currentWeekSchedule.map((day, dayIndex) => {
                const isToday = isSameDay(day.date, today);
                // Filter out PT shifts, only show staff (NV/AD/Receptionist)
                const staffShifts = day.shifts.filter(shift => shift.role !== 'pt');

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[350px] p-3 border-r border-[var(--border)] last:border-r-0 space-y-2 bg-slate-50/20 ${
                      isToday ? 'bg-orange-50/10' : ''
                    }`}
                  >
                    {staffShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="relative animate-fadeIn"
                        onMouseEnter={() => setHoveredShift(shift.id)}
                        onMouseLeave={() => setHoveredShift(null)}
                      >
                        <div className={`p-3 rounded-xl border shadow-sm hover:shadow-md transition-all ${getRoleColor(shift.role)}`}>
                          <div className="flex items-start justify-between mb-1 gap-2">
                            <p className="font-bold text-sm flex-1 truncate">{shift.staffName}</p>
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
                          <p className="text-xs opacity-90 font-medium">{shift.time}</p>
                          <p className="text-xs opacity-75 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {shift.location}
                          </p>
                        </div>

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
                    ))}

                    <button
                      onClick={() => openAddShiftModal(day.date)}
                      className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-[var(--primary)] rounded-xl text-slate-400 hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase">Thêm ca</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-6 bg-white rounded-lg p-4 border border-[var(--border)] shadow-sm">
            <span className="text-sm font-medium text-[var(--foreground)]">Chú thích:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-200"></div>
              <span className="text-sm text-[var(--muted-foreground)]">Quản lý</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
              <span className="text-sm text-[var(--muted-foreground)]">Lễ tân</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PT Work Schedule */}
      {activeTab === 'pt' && (
        <div className="space-y-6">
          {/* PT Selector */}
          <div className="flex items-center gap-4 bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm flex-wrap">
            <span className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">Chọn Huấn luyện viên (PT):</span>
            <select
              value={selectedPt}
              onChange={(e) => { setSelectedPt(e.target.value); setOverviewPopupDate(null); }}
              className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[250px]"
            >
              <option value="">-- Tất cả PT --</option>
              {staffsList.filter(s => s.dbRole === 'PT').map(pt => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
          </div>

          {/* Week navigation — shared between both modes */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {selectedPt ? `Lịch dạy của PT: ${selectedPtName}` : 'Tổng quan lịch dạy của tất cả PT'}
            </h3>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={selectedYear} onChange={(e) => { const y = parseInt(e.target.value,10); setSelectedYear(y); setCurrentWeekStart(getFirstWeekOfMonth(y,selectedMonth)); }} className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] font-medium focus:outline-none cursor-pointer">
                {[2025,2026,2027,2028].map(y => <option key={y} value={y}>Năm {y}</option>)}
              </select>
              <select value={selectedMonth} onChange={(e) => { const m = parseInt(e.target.value,10); setSelectedMonth(m); setCurrentWeekStart(getFirstWeekOfMonth(selectedYear,m)); }} className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] font-medium focus:outline-none cursor-pointer">
                {monthsList.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
              <select value={format(currentWeekStart,'yyyy-MM-dd')} onChange={(e) => setCurrentWeekStart(new Date(e.target.value))} className="px-3 py-2 bg-[var(--card)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] font-medium focus:outline-none min-w-[220px] cursor-pointer">
                {weeksInMonth.map((week,idx) => { const end=addDays(week,6); const val=format(week,'yyyy-MM-dd'); return <option key={val} value={val}>Tuần {idx+1} ({format(week,'dd/MM')} - {format(end,'dd/MM')})</option>; })}
                {!weeksInMonth.some(w => format(w,'yyyy-MM-dd')===format(currentWeekStart,'yyyy-MM-dd')) && <option value={format(currentWeekStart,'yyyy-MM-dd')}>Tuần đang chọn ({format(currentWeekStart,'dd/MM')} - {format(addDays(currentWeekStart,6),'dd/MM')})</option>}
              </select>
              <div className="flex items-center border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--card)] shadow-sm">
                <button onClick={goToPreviousWeek} className="p-2 hover:bg-[var(--secondary)] border-r border-[var(--border)] transition-colors"><ChevronLeft className="w-5 h-5 text-[var(--foreground)]" /></button>
                <button onClick={goToNextWeek} className="p-2 hover:bg-[var(--secondary)] transition-colors"><ChevronRight className="w-5 h-5 text-[var(--foreground)]" /></button>
              </div>
            </div>
          </div>

          {/* ── MODE A: Tất cả PT — Overview grid showing PT badges per day ── */}
          {!selectedPt && (
            <>
              <div className="bg-white rounded-lg border border-[var(--border)] shadow-sm overflow-hidden">
                {/* Day headers */}
                <div className="grid grid-cols-7 border-b border-[var(--border)] bg-slate-50">
                  {currentWeekSchedule.map((day, i) => {
                    const dayNames = ['T2','T3','T4','T5','T6','T7','CN'];
                    const isToday = isSameDay(day.date, today);
                    const dateKey = format(day.date,'yyyy-MM-dd');
                    const hasSessions = allBookings.some((b:any) => b.date===dateKey && b.status!=='cancelled' && staffsList.some(s => s.id === String(b.ptId) && s.dbRole === 'PT'));
                    return (
                      <div key={i} className={`p-4 text-center border-r border-[var(--border)] last:border-r-0 ${isToday ? 'bg-emerald-100/60' : ''}`}>
                        <p className={`text-xs mb-1 font-bold ${isToday ? 'text-emerald-700' : 'text-[var(--muted-foreground)]'}`}>{dayNames[i]}</p>
                        <p className={`font-black ${isToday ? 'text-emerald-800' : 'text-[var(--foreground)]'}`}>{format(day.date,'dd/MM')}</p>
                        {hasSessions && <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1"></span>}
                      </div>
                    );
                  })}
                </div>

                {/* Cells: PT badge list, click to toggle popup */}
                <div className="grid grid-cols-7">
                  {currentWeekSchedule.map((day, dayIndex) => {
                    const isToday = isSameDay(day.date, today);
                    const dateKey = format(day.date,'yyyy-MM-dd');
                    // Only bookings with a REAL PT (dbRole === 'PT'), exclude self-train / admin sessions
                    const ptStaffIds = new Set(staffsList.filter(s => s.dbRole === 'PT').map(s => String(s.id)));
                    const dayPtBookings = allBookings.filter((b:any) =>
                      b.status !== 'cancelled' && b.date === dateKey && b.ptId != null && ptStaffIds.has(String(b.ptId))
                    );
                    const ptIdsInDay = [...new Set(dayPtBookings.map((b:any) => b.ptId))];
                    const isOpen = overviewPopupDate === dateKey;
                    return (
                      <div
                        key={dayIndex}
                        onClick={() => setOverviewPopupDate(isOpen ? null : dateKey)}
                        className={`min-h-[160px] p-2.5 border-r border-[var(--border)] last:border-r-0 space-y-1.5 cursor-pointer transition-colors ${
                          isOpen ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' : isToday ? 'bg-emerald-50/30 hover:bg-emerald-50/60' : 'bg-slate-50/20 hover:bg-slate-50'
                        }`}
                      >
                        {ptIdsInDay.length === 0 ? (
                          <p className="text-xs text-slate-300 font-medium text-center pt-6">Trống</p>
                        ) : (
                          ptIdsInDay.map((ptId:any) => {
                            const ptName = staffsList.find(s => s.id === String(ptId))?.name || 'PT';
                            const sessCount = dayPtBookings.filter((b:any) => b.ptId === ptId).length;
                            return (
                              <div key={ptId} className="flex items-center justify-between gap-1 px-2 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200">
                                <span className="text-[11px] font-bold truncate">{ptName}</span>
                                <span className="shrink-0 bg-emerald-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black">{sessCount}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Detail popup panel for clicked day */}
              {overviewPopupDate && (() => {
                const ptStaffIds2 = new Set(staffsList.filter(s => s.dbRole === 'PT').map(s => String(s.id)));
                const dayBookings = allBookings
                  .filter((b:any) => b.status !== 'cancelled' && b.date === overviewPopupDate && b.ptId != null && ptStaffIds2.has(String(b.ptId)))
                  .sort((a:any,b:any) => (a.timeSlot||'').localeCompare(b.timeSlot||''));
                const displayDate = (() => {
                  const parts = overviewPopupDate.split('-');
                  return new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2])).toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
                })();
                return (
                  <div className="bg-white rounded-xl border border-[var(--border)] shadow-lg p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-emerald-500" />
                        Chi tiết lịch PT — {displayDate}
                      </h4>
                      <button onClick={() => setOverviewPopupDate(null)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                    {dayBookings.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-6">Không có lịch PT nào trong ngày này.</p>
                    ) : (
                      <div className="space-y-3">
                        {dayBookings.map((b:any) => {
                          let status: 'present'|'absent'|'future' = 'future';
                          if (b.attendanceStatus === 'checked_in') {
                            status = 'present';
                          } else {
                            const slotStart = b.timeSlot ? b.timeSlot.split(' - ')[0] : '00:00';
                            const [h,m] = slotStart.split(':').map(Number);
                            const bDT = new Date(b.date); bDT.setHours(h,m,0,0);
                            status = new Date() < bDT ? 'future' : 'absent';
                          }
                          const ptName = staffsList.find(s => s.id === String(b.ptId))?.name || 'PT';
                          const memberName = b.user?.fullName || 'Hội viên';
                          const rowBg = status==='present' ? 'bg-emerald-50 border-emerald-200' : status==='absent' ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200';
                          const badge = status==='present'
                            ? <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg whitespace-nowrap">Có mặt</span>
                            : status==='absent'
                            ? <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 rounded-lg whitespace-nowrap">Vắng mặt</span>
                            : <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 rounded-lg whitespace-nowrap">Chưa tới</span>;
                          return (
                            <div key={b.id} className={`flex items-center gap-4 p-3 rounded-xl border-2 ${rowBg}`}>
                              <div className="flex items-center gap-1.5 w-28 shrink-0">
                                <Clock className="w-3.5 h-3.5 opacity-60" />
                                <span className="text-sm font-bold">{b.timeSlot || '--'}</span>
                              </div>
                              <div className="w-px h-8 bg-slate-200 shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">{memberName}</p>
                                <p className="text-xs text-slate-500 truncate">PT: {ptName}</p>
                              </div>
                              <div className="shrink-0">{badge}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              <p className="text-xs text-[var(--muted-foreground)] text-center">
                Click vào ô ngày để xem chi tiết lịch dạy của tất cả PT trong ngày đó
              </p>
            </>
          )}

          {/* ── MODE B: Specific PT selected — Week strip + schedule list like PTSchedulePage ── */}
          {selectedPt && (
            <div className="space-y-6">
              {/* Week Day Selector */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Lịch làm việc theo ngày</h3>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Chọn ngày:</span>
                      <input
                        type="date"
                        value={formatDateStr(ptSelectedDate)}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          const p = val.split('-');
                          const nd = new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));
                          nd.setHours(0,0,0,0); setPtSelectedDate(nd);
                          const dw=nd.getDay(); const diff=nd.getDate()-dw+(dw===0?-6:1);
                          const mon=new Date(nd); mon.setDate(diff); mon.setHours(0,0,0,0); setPtWeekStart(mon);
                        }}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer font-medium transition-all"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handlePtPrevWeek} className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer">← Tuần trước</button>
                      <button onClick={() => { const t=new Date(); t.setHours(0,0,0,0); setPtSelectedDate(t); const dw=t.getDay(); const diff=t.getDate()-dw+(dw===0?-6:1); const mon=new Date(t); mon.setDate(diff); mon.setHours(0,0,0,0); setPtWeekStart(mon); }} className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer">Hôm nay</button>
                      <button onClick={handlePtNextWeek} className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer">Tuần sau →</button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-1 min-w-[500px]">
                  {getPtWeekDays().map((day, i) => (
                    <button key={i} onClick={() => setPtSelectedDate(day.dateObj)}
                      className={`flex flex-col items-center justify-center py-3 font-bold rounded-lg border transition-all focus:outline-none cursor-pointer ${
                        day.isSelected ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
                      }`}
                    >
                      <span className="text-xs uppercase font-medium">{day.name}</span>
                      <span className="text-xl font-bold mt-1">{day.dayNum}</span>
                      {day.isToday && !day.isSelected && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 animate-pulse"></span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule list */}
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Chi tiết lịch dạy: {ptSelectedDate.toLocaleDateString('vi-VN')}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span>{new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'})}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {ptScheduleBlocks.length > 0 ? (
                    ptScheduleBlocks.map((block) => (
                      <div key={block.id} className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getPtStatusColor(block.attendance)}`}>
                        <div className="flex-shrink-0 w-32"><div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span className="font-bold text-sm text-slate-900">{block.time}</span></div></div>
                        <div className="w-px h-16 bg-slate-200"></div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 mb-1">{block.client}</p>
                          <p className="text-sm text-slate-600 mb-1">{block.type}</p>
                          <div className="flex items-center gap-2 text-xs text-slate-500"><MapPin className="w-3 h-3" /><span>{block.room}</span></div>
                        </div>
                        <div className="flex-shrink-0">
                          {block.attendance==='present' && <span className="px-4 py-2 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Có mặt</span>}
                          {block.attendance==='absent' && <span className="px-4 py-2 rounded-lg text-sm font-bold bg-rose-100 text-rose-700 border border-rose-200">Vắng mặt</span>}
                          {block.attendance==='future' && <span className="px-4 py-2 rounded-lg text-sm font-bold bg-slate-100 text-slate-600 border border-slate-200">Chưa tới</span>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-8 rounded-lg text-center text-slate-500 font-medium">Không có lịch dạy nào trong ngày này.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Shift Modal */}
      {showAddModal && selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowAddModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
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

              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
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

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Ca làm việc
                  </label>

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
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
