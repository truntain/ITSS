"use client";

import { useState, useEffect } from 'react';
import { Calendar, Users, Star, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleBlock {
  id: number;
  time: string;
  client: string;
  type: string;
  room: string;
  attendance: 'present' | 'absent' | 'future';
}

export function PTSchedulePage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday of this week
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  // Helper to format Date to YYYY-MM-DD
  const formatDateStr = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getWeekDays = () => {
    const days = [];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push({
        name: dayNames[i],
        dateObj: date,
        dateStr: formatDateStr(date),
        dayNum: date.getDate(),
        isToday: date.toDateString() === new Date().toDateString(),
        isSelected: formatDateStr(date) === formatDateStr(selectedDate),
      });
    }
    return days;
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + 7);
      return next;
    });
  };

  const handleDaySelect = (date: Date) => {
    setSelectedDate(date);
  };

  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:3001/bookings/pt-bookings', { headers });
      if (!res.ok) throw new Error('Không thể tải lịch tập');
      
      const data = await res.json();
      setAllBookings(data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Lỗi khi tải lịch làm việc');
    } finally {
      setLoading(false);
    }
  };

  const [averageRating, setAverageRating] = useState<number>(5.0);

  const fetchRatings = async (ptId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:3001/trainers/ratings/all', { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách đánh giá');
      
      const data = await res.json();
      const myRatings = data.filter((r: any) => r.ptId === ptId);
      if (myRatings.length > 0) {
        const sum = myRatings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
        const avg = sum / myRatings.length;
        setAverageRating(parseFloat(avg.toFixed(1)));
      } else {
        setAverageRating(5.0);
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user?.id) {
          fetchRatings(user.id);
        }
      }
    }
    fetchSchedules();
  }, []);

  const handleAttendanceChange = (bookingId: number, attendance: 'present' | 'absent') => {
    const token = localStorage.getItem('token');
    const newAttendanceStatus = attendance === 'present' ? 'checked_in' : 'absent';

    fetch(`http://localhost:3001/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ attendanceStatus: newAttendanceStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Cập nhật thất bại');
        // Update local state to reflect change instantly
        setAllBookings(prev =>
          prev.map(b => (b.id === bookingId ? { ...b, attendanceStatus: newAttendanceStatus } : b))
        );
        toast.success('Đã lưu cập nhật điểm danh thành công!');
      })
      .catch(() => {
        toast.error('Không thể cập nhật điểm danh');
      });
  };

  // Filter and map database bookings to UI schedule blocks for selectedDate
  const selectedDateStr = formatDateStr(selectedDate);
  const activeBookings = allBookings.filter(
    (item: any) => item.date === selectedDateStr && item.status !== 'cancelled'
  );

  const scheduleBlocks: ScheduleBlock[] = activeBookings.map((item: any) => {
    const todayStr = formatDateStr(new Date());
    
    let displayStatus: 'present' | 'absent' | 'future';
    if (item.date > todayStr) {
      displayStatus = 'future';
    } else if (item.attendanceStatus === 'checked_in') {
      displayStatus = 'present';
    } else {
      displayStatus = 'absent';
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

  const getStatusColor = (attendance: 'present' | 'absent' | 'future') => {
    if (attendance === 'present') return 'bg-emerald-50 border-emerald-200';
    if (attendance === 'future') return 'bg-slate-50 border-slate-200';
    return 'bg-red-50 border-red-200';
  };

  // Dynamic calculations for cards
  const activeClientsCount = new Set(allBookings.filter(b => b.status !== 'cancelled').map((b: any) => b.userId)).size;

  const getMonthlyHours = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    const completedBookings = allBookings.filter((b: any) => {
      const bDate = new Date(b.date);
      return bDate.getMonth() === currentMonth && 
             bDate.getFullYear() === currentYear && 
             b.status !== 'cancelled' &&
             b.attendanceStatus === 'checked_in';
    });
    return completedBookings.length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500">Đang tải lịch làm việc...</p>
      </div>
    );
  }

  const isSelectedToday = formatDateStr(selectedDate) === formatDateStr(new Date());

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Chào {currentUser?.fullName || 'Huấn luyện viên'}, chúc một ngày làm việc hiệu quả!</h2>
        <p className="text-emerald-100">
          {isSelectedToday
            ? `Hôm nay bạn có ${scheduleBlocks.length} buổi dạy. Hãy chuẩn bị tinh thần tốt nhất!`
            : `Ngày ${selectedDate.toLocaleDateString('vi-VN')} bạn có ${scheduleBlocks.length} buổi dạy.`}
        </p>
      </div>

      {/* PT Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selected Day's Sessions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">
            {isSelectedToday ? "Buổi dạy hôm nay" : "Buổi dạy trong ngày"}
          </p>
          <p className="text-3xl font-bold text-slate-900">{scheduleBlocks.length} Buổi</p>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Hội viên đang kèm</p>
          <p className="text-3xl font-bold text-slate-900">{activeClientsCount} Người</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Đánh giá trung bình</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">{averageRating.toFixed(1)}/5.0</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(averageRating) ? 'fill-orange-400 text-orange-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Monthly Hours */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Số giờ hoàn thành (Tháng)</p>
          <p className="text-3xl font-bold text-slate-900">{getMonthlyHours()} Giờ</p>
        </div>
      </div>

      {/* Week Day Selector */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h3 className="text-lg font-bold text-slate-900">Lịch làm việc theo ngày</h3>
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap">
            {/* Direct Calendar Datepicker */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Chọn ngày:</span>
              <input
                type="date"
                value={formatDateStr(selectedDate)}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const dateParts = val.split('-');
                  const newDate = new Date(
                    parseInt(dateParts[0]),
                    parseInt(dateParts[1]) - 1,
                    parseInt(dateParts[2])
                  );
                  newDate.setHours(0, 0, 0, 0);
                  
                  setSelectedDate(newDate);
                  
                  // Align the week strip
                  const day = newDate.getDay();
                  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1);
                  const monday = new Date(newDate);
                  monday.setDate(diff);
                  monday.setHours(0, 0, 0, 0);
                  setCurrentWeekStart(monday);
                }}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevWeek}
                className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer animate-none"
              >
                &larr; Tuần trước
              </button>
              <button
                onClick={() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  setSelectedDate(today);
                  const day = today.getDay();
                  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                  const monday = new Date(today);
                  monday.setDate(diff);
                  monday.setHours(0, 0, 0, 0);
                  setCurrentWeekStart(monday);
                }}
                className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer animate-none"
              >
                Hôm nay
              </button>
              <button
                onClick={handleNextWeek}
                className="px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600 rounded-lg transition-colors cursor-pointer animate-none"
              >
                Tuần sau &rarr;
              </button>
            </div>
          </div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2 overflow-x-auto pb-2 min-w-[500px]">
          {getWeekDays().map((day, index) => (
            <button
              key={index}
              onClick={() => handleDaySelect(day.dateObj)}
              className={`flex flex-col items-center justify-center py-3 font-bold rounded-lg border transition-all focus:outline-none cursor-pointer ${
                day.isSelected
                  ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-600'
              }`}
            >
              <span className="text-xs uppercase font-medium">{day.name}</span>
              <span className="text-xl font-bold mt-1">{day.dayNum}</span>
              {day.isToday && !day.isSelected && (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1 animate-pulse"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day's Schedule List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">
            Chi tiết lịch dạy: {selectedDate.toLocaleDateString('vi-VN')}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {scheduleBlocks.length > 0 ? (
            scheduleBlocks.map((block, index) => (
              <div
                key={block.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getStatusColor(
                  block.attendance
                )}`}
              >
                {/* Time */}
                <div className="flex-shrink-0 w-32">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-bold text-sm text-slate-900">{block.time}</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-16 bg-slate-200"></div>

                {/* Session Info */}
                <div className="flex-1">
                  <p className="font-bold text-slate-900 mb-1">{block.client}</p>
                  <p className="text-sm text-slate-600 mb-1">{block.type}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3 h-3" />
                    <span>{block.room}</span>
                  </div>
                </div>

                {/* Attendance Control */}
                <div className="flex-shrink-0 flex items-center gap-3">
                  <div className="inline-flex bg-slate-100 rounded-lg p-1 gap-1">
                    <button
                      onClick={() => handleAttendanceChange(block.id, 'present')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                        block.attendance === 'present'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(block.id, 'absent')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                        block.attendance === 'absent'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      Vắng mặt
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-8 rounded-lg text-center text-slate-500 font-medium">
              Không có lịch dạy nào trong ngày này.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
