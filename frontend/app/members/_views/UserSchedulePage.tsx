"use client";

import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, MapPin, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduleEvent {
  id: string;
  date: string;
  time: string;
  trainer: string;
  room: string;
  type: string;
}

export function UserSchedulePage() {
  const [currentMonth] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  const scheduleEvents: ScheduleEvent[] = [
    {
      id: '1',
      date: '2026-05-17',
      time: '17:30 - 18:30',
      trainer: 'PT Lê Minh Trọng',
      room: 'Khu Tạ A',
      type: 'STRENGTH CONDITIONING',
    },
    {
      id: '2',
      date: '2026-05-17',
      time: '19:00 - 20:00',
      trainer: 'Coach Nguyễn An',
      room: 'Studio B',
      type: 'HIIT CARDIO BLAST',
    },
    {
      id: '3',
      date: '2026-05-19',
      time: '08:00 - 09:00',
      trainer: 'Instructor Mai',
      room: 'Phòng Yoga',
      type: 'YOGA RECOVERY',
    },
    {
      id: '4',
      date: '2026-05-20',
      time: '18:00 - 19:00',
      trainer: 'PT Lê Minh Trọng',
      room: 'Khu Tạ B',
      type: 'STRENGTH TRAINING',
    },
    {
      id: '5',
      date: '2026-05-22',
      time: '17:00 - 18:00',
      trainer: 'PT Lê Minh Trọng',
      room: 'Khu CrossFit',
      type: 'FUNCTIONAL TRAINING',
    },
  ];

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
    const dateStr = `2026-05-${String(day).padStart(2, '0')}`;
    return scheduleEvents.filter((event) => event.date === dateStr);
  };

  const isToday = (day: number) => {
    return day === 17; // May 17, 2026
  };

  const handleCancelEvent = (eventId: string) => {
    console.log('Canceling event:', eventId);
    setSelectedEvent(null);
    // Show success notification
  };

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
            <button className="p-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white transition-colors">
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
