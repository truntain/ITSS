"use client";

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Users, Star, CheckCircle, Clock, MapPin, Edit3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = 'http://localhost:3001';

interface BookingBlock {
  id: number;
  time: string;
  client: string;
  type: string;
  room: string;
  attendance: 'present' | 'absent' | null;
  note: string;
}

interface PTStats {
  todaySessions: number;
  totalClients: number;
}

export function PTSchedulePage() {
  const [bookings, setBookings] = useState<BookingBlock[]>([]);
  const [stats, setStats] = useState<PTStats>({ todaySessions: 0, totalClients: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const fetchBookings = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };

    fetch(`${API_BASE}/bookings`, { headers })
      .then(res => {
        if (!res.ok) throw new Error('Không thể tải lịch đặt tập');
        return res.json();
      })
      .then((data: any[]) => {
        const todayStr = new Date().toISOString().split('T')[0];

        // Lọc booking của PT hiện tại hôm nay
        const userId = currentUser?.id;
        const myBookings = data.filter((b: any) => {
          const bookingDate = b.sessionDate ? b.sessionDate.split('T')[0] : null;
          return bookingDate === todayStr && (b.trainerId === userId || !userId);
        });

        const mapped: BookingBlock[] = myBookings.map((b: any) => ({
          id: b.id,
          time: b.sessionTime
            ? `${b.sessionTime.slice(0, 5)} - ${addHour(b.sessionTime)}`
            : 'N/A',
          client: b.member?.fullName || b.member?.email || 'Hội viên',
          type: b.sessionType || 'PT Session',
          room: b.location || 'N/A',
          attendance: b.status === 'completed' ? 'present'
            : b.status === 'cancelled' ? 'absent' : null,
          note: b.note || '',
        }));

        setBookings(mapped);
        setStats({
          todaySessions: myBookings.length,
          totalClients: new Set(myBookings.map((b: any) => b.memberId)).size,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching bookings:', err);
        setLoading(false);
      });
  }, [currentUser]);

  useEffect(() => {
    if (currentUser !== null) fetchBookings();
  }, [currentUser, fetchBookings]);

  function addHour(timeStr: string): string {
    const [h, m] = timeStr.split(':').map(Number);
    const newH = (h + 1) % 24;
    return `${String(newH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  const handleAttendanceChange = (index: number, attendance: 'present' | 'absent') => {
    const booking = bookings[index];
    if (!booking) return;

    const token = localStorage.getItem('token');
    const newStatus = attendance === 'present' ? 'completed' : 'cancelled';

    fetch(`${API_BASE}/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: newStatus }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Cập nhật thất bại');
        const updated = [...bookings];
        updated[index].attendance = attendance;
        setBookings(updated);
        toast.success('Đã lưu cập nhật thành công!');
      })
      .catch(() => {
        toast.error('Không thể cập nhật điểm danh');
      });
  };

  const handleNoteClick = (index: number) => {
    setEditingNoteIndex(index);
    setTempNote(bookings[index].note);
  };

  const handleNoteSave = (index: number) => {
    const booking = bookings[index];
    if (!booking) return;

    const token = localStorage.getItem('token');

    fetch(`${API_BASE}/bookings/${booking.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ note: tempNote }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Lưu ghi chú thất bại');
        const updated = [...bookings];
        updated[index].note = tempNote;
        setBookings(updated);
        setEditingNoteIndex(null);
        toast.success('Đã lưu ghi chú thành công!');
      })
      .catch(() => {
        toast.error('Không thể lưu ghi chú');
      });
  };

  const getStatusColor = (attendance: 'present' | 'absent' | null) => {
    if (attendance === 'present') return 'bg-emerald-50 border-emerald-200';
    if (attendance === 'absent') return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        <span className="ml-3 text-slate-600">Đang tải lịch trình...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">
          Chào {currentUser?.fullName || 'Huấn luyện viên'}, chúc một ngày làm việc hiệu quả!
        </h2>
        <p className="text-emerald-100">
          {stats.todaySessions > 0
            ? `Hôm nay bạn có ${stats.todaySessions} buổi dạy. Hãy chuẩn bị tinh thần tốt nhất!`
            : 'Hôm nay bạn chưa có lịch dạy nào được đặt.'}
        </p>
      </div>

      {/* PT Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Sessions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Buổi dạy hôm nay</p>
          <p className="text-3xl font-bold text-slate-900">{stats.todaySessions} Buổi</p>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Hội viên trong lịch hôm nay</p>
          <p className="text-3xl font-bold text-slate-900">{stats.totalClients} Người</p>
        </div>

        {/* Completed */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Đã hoàn thành hôm nay</p>
          <p className="text-3xl font-bold text-slate-900">
            {bookings.filter(b => b.attendance === 'present').length} Buổi
          </p>
        </div>
      </div>

      {/* Today's Schedule with Attendance Control */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Lịch trình hôm nay</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-lg">Hôm nay không có lịch dạy nào được đặt.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((block, index) => (
              <div
                key={block.id}
                className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getStatusColor(block.attendance)}`}
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
                      onClick={() => handleAttendanceChange(index, 'present')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        block.attendance === 'present'
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Có mặt
                    </button>
                    <button
                      onClick={() => handleAttendanceChange(index, 'absent')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        block.attendance === 'absent'
                          ? 'bg-red-500 text-white shadow-md'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Vắng mặt
                    </button>
                  </div>

                  <button
                    onClick={() => handleNoteClick(index)}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors group relative"
                    title="Thêm ghi chú"
                  >
                    <Edit3 className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                    {block.note && <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Edit Modal */}
      {editingNoteIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Thêm ghi chú</h3>
            <p className="text-sm text-slate-600 mb-4">
              {bookings[editingNoteIndex].client} - {bookings[editingNoteIndex].time}
            </p>
            <textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              placeholder="Ví dụ: Đến muộn 15 phút, Tập tốt hôm nay..."
              className="w-full h-32 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setEditingNoteIndex(null)}
                className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleNoteSave(editingNoteIndex)}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
