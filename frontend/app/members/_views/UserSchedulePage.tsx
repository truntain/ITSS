"use client";

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  date: string;
  time: string;
  trainer: string;
  room: string;
  type: string;
  status: string;
}

export function UserSchedulePage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/bookings/my-bookings', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
      })
      .then((data: any[]) => {
        const mapped = data.map(item => ({
          id: String(item.id),
          date: item.date,
          time: item.timeSlot,
          trainer: item.pt && item.pt.id !== 11 && item.ptId !== 11
            ? `PT ${item.pt.fullName}`
            : (item.pt && (item.pt.id === 11 || item.ptId === 11))
              ? 'Tự tập'
              : 'Chưa xếp PT',
          room: item.room || 'Chưa xếp phòng',
          type: item.type,
          status: item.status,
        }));
        setScheduleEvents(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBookings();

    const handleSuccess = () => {
      fetchBookings();
    };

    window.addEventListener('booking-success', handleSuccess);
    return () => {
      window.removeEventListener('booking-success', handleSuccess);
    };
  }, []);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const getEventsForDate = (day: number) => {
    const year = currentMonth.getFullYear();
    const monthStr = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${String(day).padStart(2, '0')}`;
    return scheduleEvents.filter((event) => event.date === dateStr && event.status !== 'cancelled');
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    );
  };

  const handleCancelEvent = (eventId: string) => {
    const confirmCancel = confirm('Bạn có chắc chắn muốn hủy lịch tập này không?');
    if (!confirmCancel) return;

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch(`http://localhost:3001/bookings/my-bookings/${eventId}/cancel`, {
      method: 'PATCH',
      headers,
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to cancel booking');
        return res.json();
      })
      .then(() => {
        setScheduleEvents(prev =>
          prev.map(evt => (evt.id === eventId ? { ...evt, status: 'cancelled' } : evt))
        );
        setSelectedEvent(null);
        alert('Hủy lịch tập thành công');
      })
      .catch(err => {
        console.error('Error canceling booking:', err);
        alert('Có lỗi xảy ra khi hủy lịch tập');
      });
  };

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto px-8 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin mb-4"></div>
        <p className="text-[#A0A0A0]">Đang tải lịch tập...</p>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 uppercase">LỊCH TẬP CỦA TÔI</h1>
        <p className="text-[#A0A0A0]">Quản lý lịch tập luyện và đặt buổi mới</p>
      </div>

      {/* Calendar */}
      <div className="bg-[#242424] border border-[#333333] shadow-2xl p-8 rounded-2xl">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8 border-b border-[#333333] pb-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">{monthName}</h2>
          <div className="flex gap-3">
            <button
              onClick={handlePrevMonth}
              className="p-3 bg-[#1A1A1A] border-2 border-[#333333] hover:border-[#FF5A00] text-white transition-colors rounded-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-3 bg-[#1A1A1A] border-2 border-[#333333] hover:border-[#FF5A00] text-white transition-colors rounded-xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'].map((day) => (
            <div key={day} className="text-center py-4 font-black text-[#A0A0A0] uppercase text-sm tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square bg-transparent rounded-xl"></div>;
            }

            const events = getEventsForDate(day);
            const today = isToday(day);

            return (
              <div
                key={day}
                className={`aspect-square border-2 p-3 transition-all relative rounded-xl flex flex-col justify-between ${
                  today
                    ? 'border-[#FF5A00] bg-[#FF5A00]/10 shadow-[0_0_15px_rgba(255,90,0,0.15)]'
                    : events.length > 0
                      ? 'border-[#333333] bg-[#1A1A1A] hover:border-[#FF5A00] cursor-pointer'
                      : 'border-[#333333] bg-[#1d1d1d] hover:border-[#444444]'
                }`}
              >
                <div className="flex flex-col h-full justify-between">
                  <span
                    className={`text-lg font-black ${
                      today ? 'text-[#FF5A00]' : events.length > 0 ? 'text-white' : 'text-[#A0A0A0]'
                    }`}
                  >
                    {day}
                  </span>

                  {events.length > 0 && (
                    <div className="mt-2 flex-1 space-y-1.5 overflow-hidden flex flex-col justify-end">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="w-full text-left px-2.5 py-1 bg-[#FF5A00] text-white text-[11px] font-black rounded hover:bg-[#FF6A10] transition-colors truncate shadow-md"
                          title={`${event.time} - ${event.type}`}
                        >
                          {event.time.split(' - ')[0]} - {event.type.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {today && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF5A00] rounded-full shadow-[0_0_10px_rgba(255,90,0,0.9)] animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <>
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] animate-fadeIn"
            onClick={() => setSelectedEvent(null)}
          ></div>

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-lg w-full rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-[#333333] flex items-center justify-between bg-gradient-to-r from-[#FF5A00]/10 to-transparent">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Chi tiết buổi tập</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-[#1A1A1A] rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-[#A0A0A0] hover:text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-3xl font-black text-[#FF5A00] tracking-tight uppercase">{selectedEvent.type}</h4>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-white text-base">
                    <CalendarIcon className="w-6 h-6 text-[#FF5A00] flex-shrink-0" />
                    <span className="font-medium">
                      {new Date(selectedEvent.date).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-white text-base">
                    <Clock className="w-6 h-6 text-[#FF5A00] flex-shrink-0" />
                    <span className="font-black text-[#FF5A00]">{selectedEvent.time}</span>
                  </div>

                  <div className="flex items-center gap-4 text-white text-base">
                    <User className="w-6 h-6 text-[#FF5A00] flex-shrink-0" />
                    <span>Huấn luyện viên: <strong className="font-bold text-white">{selectedEvent.trainer}</strong></span>
                  </div>

                  <div className="flex items-center gap-4 text-white text-base">
                    <MapPin className="w-6 h-6 text-[#FF5A00] flex-shrink-0" />
                    <span>Khu vực: <strong className="font-bold text-white">{selectedEvent.room}</strong></span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#333333] flex gap-4 bg-[#1A1A1A]/50">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-6 py-3.5 bg-[#1A1A1A] border-2 border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all rounded-xl text-sm"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                  className="flex-1 px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase transition-all shadow-lg rounded-xl text-sm"
                >
                  Hủy lịch tập
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
