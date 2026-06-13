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
          trainer: item.pt ? `PT ${item.pt.fullName}` : 'Chưa xếp PT',
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
      <div className="max-w-[1440px] mx-auto px-8 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin mb-4"></div>
        <p className="text-[#A0A0A0]">Đang tải lịch tập...</p>
      </div>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 uppercase">LỊCH TẬP CỦA TÔI</h1>
        <p className="text-[#A0A0A0]">Quản lý lịch tập luyện và đặt buổi mới</p>
      </div>

      {/* Calendar */}
      <div className="bg-[#242424] border border-[#333333] shadow-2xl p-8">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white uppercase">{monthName}</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <div key={day} className="text-center py-3 font-black text-[#A0A0A0] uppercase text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>;
            }

            const events = getEventsForDate(day);
            const today = isToday(day);

            return (
              <div
                key={day}
                className={`aspect-square border p-2 transition-all relative ${
                  today
                    ? 'border-[#FF5A00] bg-[#FF5A00]/10'
                    : events.length > 0
                      ? 'border-[#333333] bg-[#1A1A1A] hover:border-[#FF5A00] cursor-pointer'
                      : 'border-[#333333] hover:border-[#444444]'
                }`}
              >
                <div className="flex flex-col h-full">
                  <span
                    className={`text-sm font-bold ${
                      today ? 'text-[#FF5A00]' : events.length > 0 ? 'text-white' : 'text-[#A0A0A0]'
                    }`}
                  >
                    {day}
                  </span>

                  {events.length > 0 && (
                    <div className="mt-1 flex-1 space-y-1 overflow-hidden">
                      {events.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className="w-full text-left px-1 py-0.5 bg-[#FF5A00] text-white text-[10px] font-bold rounded hover:bg-[#FF6A10] transition-colors truncate"
                        >
                          {event.time.split(' - ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {today && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-[#FF5A00] rounded-full shadow-[0_0_8px_rgba(255,90,0,0.8)]"></div>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setSelectedEvent(null)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-lg w-full">
              {/* Header */}
              <div className="p-6 border-b border-[#333333] flex items-center justify-between">
                <h3 className="text-2xl font-black text-white uppercase">Chi tiết buổi tập</h3>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-[#1A1A1A] rounded transition-colors"
                >
                  <X className="w-6 h-6 text-[#A0A0A0] hover:text-white" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-3xl font-black text-[#FF5A00] mb-2">{selectedEvent.type}</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <CalendarIcon className="w-5 h-5 text-[#FF5A00]" />
                    <span>
                      {new Date(selectedEvent.date).toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-white">
                    <Clock className="w-5 h-5 text-[#FF5A00]" />
                    <span className="font-bold">{selectedEvent.time}</span>
                  </div>

                  <div className="flex items-center gap-3 text-white">
                    <User className="w-5 h-5 text-[#FF5A00]" />
                    <span>{selectedEvent.trainer}</span>
                  </div>

                  <div className="flex items-center gap-3 text-white">
                    <MapPin className="w-5 h-5 text-[#FF5A00]" />
                    <span>{selectedEvent.room}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#333333] flex gap-3">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
                >
                  Đóng
                </button>
                <button
                  onClick={() => handleCancelEvent(selectedEvent.id)}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black uppercase transition-all shadow-lg"
                >
                  Hủy lịch
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
