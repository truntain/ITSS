"use client";

import { useState } from 'react';
import { Search, User, TrendingUp, Weight, Activity, Edit3, FileText, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface Trainee {
  id: number;
  name: string;
  avatar: string;
  package: string;
  sessionsLeft: number;
  phone: string;
  email: string;
}

interface MetricData {
  date: string;
  weight: number;
  fat: number;
  muscle: number;
}

interface PTNote {
  id: number;
  date: string;
  note: string;
  type: 'metric' | 'general';
}

export function PTTraineesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [metricForm, setMetricForm] = useState({
    date: '',
    weight: '',
    fat: '',
    muscle: '',
    notes: '',
  });

  const [metricHistory, setMetricHistory] = useState<MetricData[]>([
    { date: '01/04', weight: 78.5, fat: 22.3, muscle: 42.1 },
    { date: '08/04', weight: 77.2, fat: 21.5, muscle: 42.8 },
    { date: '15/04', weight: 76.8, fat: 20.8, muscle: 43.2 },
    { date: '22/04', weight: 75.5, fat: 20.1, muscle: 43.9 },
    { date: '29/04', weight: 74.9, fat: 19.6, muscle: 44.5 },
    { date: '06/05', weight: 74.2, fat: 19.0, muscle: 45.1 },
  ]);

  const [ptNotes, setPtNotes] = useState<PTNote[]>([
    { id: 1, date: '2026-05-06', note: 'Tập luyện tốt, kỹ thuật squat được cải thiện rõ rệt', type: 'general' },
    { id: 2, date: '2026-04-29', note: 'Cập nhật chỉ số: Giảm 0.6kg, tỷ lệ mỡ giảm 0.6%', type: 'metric' },
    { id: 3, date: '2026-04-22', note: 'Học viên đang tiến bộ tốt, động lực cao', type: 'general' },
    { id: 4, date: '2026-04-15', note: 'Đề xuất tăng khối lượng tập deadlift lên 60kg', type: 'general' },
  ]);

  const trainees: Trainee[] = [
    { id: 1, name: 'Nguyễn Văn An', avatar: '👨', package: '20 buổi PT', sessionsLeft: 12, phone: '0901234567', email: 'an.nguyen@email.com' },
    { id: 2, name: 'Trần Thị Bích', avatar: '👩', package: '15 buổi PT', sessionsLeft: 8, phone: '0912345678', email: 'bich.tran@email.com' },
    { id: 3, name: 'Lê Minh Hà', avatar: '👩', package: '10 buổi PT', sessionsLeft: 3, phone: '0923456789', email: 'ha.le@email.com' },
    { id: 4, name: 'Hoàng Văn Đức', avatar: '👨', package: '20 buổi PT', sessionsLeft: 15, phone: '0934567890', email: 'duc.hoang@email.com' },
    { id: 5, name: 'Phạm Thị Thu', avatar: '👩', package: '12 buổi PT', sessionsLeft: 6, phone: '0945678901', email: 'thu.pham@email.com' },
    { id: 6, name: 'Trương Thế Thành', avatar: '👨', package: '15 buổi PT', sessionsLeft: 10, phone: '0956789012', email: 'thanh.truong@email.com' },
    { id: 7, name: 'Phạm Quốc Tuấn', avatar: '👨', package: '20 buổi PT', sessionsLeft: 18, phone: '0967890123', email: 'tuan.pham@email.com' },
  ];

  const filteredTrainees = trainees.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateMetrics = () => {
    if (metricForm.date && metricForm.weight && metricForm.fat && metricForm.muscle) {
      // Add new metric data point
      const newMetric: MetricData = {
        date: new Date(metricForm.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
        weight: parseFloat(metricForm.weight),
        fat: parseFloat(metricForm.fat),
        muscle: parseFloat(metricForm.muscle),
      };
      setMetricHistory([...metricHistory, newMetric]);

      // Add PT note if provided
      if (metricForm.notes) {
        const newNote: PTNote = {
          id: ptNotes.length + 1,
          date: metricForm.date,
          note: metricForm.notes,
          type: 'metric',
        };
        setPtNotes([newNote, ...ptNotes]);
      }

      toast.success('Đã lưu cập nhật thành công!');
    }

    setShowUpdateDrawer(false);
    setMetricForm({ date: '', weight: '', fat: '', muscle: '', notes: '' });
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left Pane: Trainee List (30%) */}
      <div className="w-[30%] bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Danh sách Hội viên</h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm hội viên..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Trainee List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filteredTrainees.map((trainee) => (
            <button
              key={trainee.id}
              onClick={() => setSelectedTrainee(trainee)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                selectedTrainee?.id === trainee.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300 bg-white'
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {trainee.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{trainee.name}</p>
                <p className="text-xs text-slate-500">{trainee.package}</p>
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs font-bold text-emerald-600">{trainee.sessionsLeft} buổi</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right Pane: Trainee Detail (70%) */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-y-auto">
        {selectedTrainee ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-4xl">
                  {selectedTrainee.avatar}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedTrainee.name}</h2>
                  <p className="text-slate-600">{selectedTrainee.package}</p>
                  <div className="flex gap-4 mt-2 text-sm text-slate-500">
                    <span>📞 {selectedTrainee.phone}</span>
                    <span>📧 {selectedTrainee.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Xem ghi chú
                </button>
                <button
                  onClick={() => setShowUpdateDrawer(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Cập nhật chỉ số
                </button>
              </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-6">
              {/* Weight Chart */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Weight className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">Cân nặng (kg)</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metricHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Body Fat Chart */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-bold text-slate-900">Tỷ lệ mỡ (%)</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metricHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="fat" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Muscle Mass Chart */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-bold text-slate-900">Khối lượng cơ (%)</h3>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metricHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="muscle" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">Chọn hội viên để xem chi tiết</p>
            </div>
          </div>
        )}
      </div>

      {/* Update Metrics Drawer */}
      {showUpdateDrawer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-end">
          <div className="bg-white h-full w-full max-w-md shadow-2xl p-6 overflow-y-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Cập nhật chỉ số cơ thể</h3>

            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ngày đo</label>
                <input
                  type="date"
                  value={metricForm.date}
                  onChange={(e) => setMetricForm({ ...metricForm, date: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Cân nặng (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={metricForm.weight}
                  onChange={(e) => setMetricForm({ ...metricForm, weight: e.target.value })}
                  placeholder="Ví dụ: 75.5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Body Fat */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tỷ lệ mỡ (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={metricForm.fat}
                  onChange={(e) => setMetricForm({ ...metricForm, fat: e.target.value })}
                  placeholder="Ví dụ: 19.5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Muscle Mass */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Khối lượng cơ (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={metricForm.muscle}
                  onChange={(e) => setMetricForm({ ...metricForm, muscle: e.target.value })}
                  placeholder="Ví dụ: 45.2"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Ghi chú của PT</label>
                <textarea
                  value={metricForm.notes}
                  onChange={(e) => setMetricForm({ ...metricForm, notes: e.target.value })}
                  placeholder="Ghi chú về tiến độ, thay đổi chế độ ăn uống, tập luyện..."
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUpdateDrawer(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateMetrics}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Notes Modal */}
      {showNotesModal && selectedTrainee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Lịch sử ghi chú</h3>
                <p className="text-slate-600 mt-1">{selectedTrainee.name}</p>
              </div>
              <button
                onClick={() => setShowNotesModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-600" />
              </button>
            </div>

            {/* Timeline Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {ptNotes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Chưa có ghi chú nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ptNotes.map((note, index) => (
                    <div key={note.id} className="relative pl-8 pb-4">
                      {/* Timeline line */}
                      {index !== ptNotes.length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-slate-200"></div>
                      )}

                      {/* Timeline dot */}
                      <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${
                        note.type === 'metric'
                          ? 'bg-emerald-500 border-emerald-600'
                          : 'bg-blue-500 border-blue-600'
                      }`}></div>

                      {/* Note card */}
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-slate-900">
                            {new Date(note.date).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            note.type === 'metric'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {note.type === 'metric' ? 'Chỉ số' : 'Ghi chú'}
                          </span>
                        </div>
                        <p className="text-slate-700">{note.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => setShowNotesModal(false)}
                className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
