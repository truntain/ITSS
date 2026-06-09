import { useState } from 'react';
import { Calendar, Users, Star, CheckCircle, Clock, MapPin, Edit3 } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleBlock {
  time: string;
  client: string;
  type: string;
  room: string;
  attendance: 'present' | 'absent' | null;
  note: string;
}

export function PTSchedulePage() {
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([
    { time: '08:00 - 09:00', client: 'Nguyễn Văn An', type: 'Cardio & Giảm cân', room: 'Phòng A1', attendance: 'present', note: '' },
    { time: '09:30 - 10:30', client: 'Trần Thị Bích', type: 'Yoga & Linh hoạt', room: 'Phòng Yoga', attendance: 'present', note: '' },
    { time: '10:00 - 11:00', client: 'Trương Thế Thành', type: 'Tăng cơ', room: 'Khu Tạ A', attendance: null, note: '' },
    { time: '14:00 - 15:00', client: 'Lê Minh Hà', type: 'CrossFit', room: 'Khu CrossFit', attendance: null, note: '' },
    { time: '16:00 - 17:00', client: 'Phạm Quốc Tuấn', type: 'Tăng cơ & Sức mạnh', room: 'Khu Tạ B', attendance: null, note: '' },
  ]);

  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [tempNote, setTempNote] = useState('');

  const handleAttendanceChange = (index: number, attendance: 'present' | 'absent') => {
    const updated = [...scheduleBlocks];
    updated[index].attendance = attendance;
    setScheduleBlocks(updated);
    toast.success('Đã lưu cập nhật thành công!');
  };

  const handleNoteClick = (index: number) => {
    setEditingNoteIndex(index);
    setTempNote(scheduleBlocks[index].note);
  };

  const handleNoteSave = (index: number) => {
    const updated = [...scheduleBlocks];
    updated[index].note = tempNote;
    setScheduleBlocks(updated);
    setEditingNoteIndex(null);
    toast.success('Đã lưu cập nhật thành công!');
  };

  const getStatusColor = (attendance: 'present' | 'absent' | null) => {
    if (attendance === 'present') return 'bg-emerald-50 border-emerald-200';
    if (attendance === 'absent') return 'bg-red-50 border-red-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Chào Lê Minh Trọng, chúc một ngày làm việc hiệu quả!</h2>
        <p className="text-emerald-100">Hôm nay bạn có 5 buổi dạy. Hãy chuẩn bị tinh thần tốt nhất!</p>
      </div>

      {/* PT Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sessions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Buổi dạy hôm nay</p>
          <p className="text-3xl font-bold text-slate-900">5 Buổi</p>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Hội viên đang kèm</p>
          <p className="text-3xl font-bold text-slate-900">14 Người</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Đánh giá trung bình</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">4.9/5.0</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= 4 ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`}
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
          <p className="text-3xl font-bold text-slate-900">86 Giờ</p>
        </div>
      </div>

      {/* Today's Schedule with Attendance Control */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Lịch trình hôm nay</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>08:00 - 20:00</span>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {scheduleBlocks.map((block, index) => (
            <div
              key={index}
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
                {/* Segmented Control */}
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

                {/* Note Icon */}
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
      </div>

      {/* Note Edit Modal */}
      {editingNoteIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Thêm ghi chú</h3>
            <p className="text-sm text-slate-600 mb-4">
              {scheduleBlocks[editingNoteIndex].client} - {scheduleBlocks[editingNoteIndex].time}
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
