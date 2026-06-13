"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, User, TrendingUp, Weight, Activity, Edit3 } from 'lucide-react';
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



interface BackendUser {
  id: number;
  fullName: string;
  phone?: string;
  email: string;
  avatar?: string;
  gender?: string;
}

interface BackendBooking {
  id: number;
  date: string;
  timeSlot: string;
  attendanceStatus?: string;
  status: string;
  user?: BackendUser;
}

export function PTTraineesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [metricForm, setMetricForm] = useState({
    date: '',
    weight: '',
    fat: '',
    muscle: '',
  });

  const [metricHistory, setMetricHistory] = useState<MetricData[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<BackendUser | null>(null);

  const fetchTraineeDetails = useCallback(async (traineeId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      // 1. Fetch body records
      const recordsRes = await fetch(`http://localhost:3001/body-records/user/${traineeId}`, { headers });
      if (!recordsRes.ok) throw new Error('Không thể tải chỉ số cơ thể');
      const recordsData = await recordsRes.json();

      // Map records to chart data format (recharts wants them sorted chronologically)
      interface RecordType {
        id: number;
        recordedDate: string;
        weight: string;
        bodyFat: string;
        muscleMass?: string;
        notes?: string;
      }
      const mappedHistory: MetricData[] = recordsData.map((r: RecordType) => {
        const dateObj = new Date(r.recordedDate);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        return {
          date: `${day}/${month}`,
          weight: parseFloat(r.weight),
          fat: parseFloat(r.bodyFat),
          muscle: r.muscleMass ? parseFloat(r.muscleMass) : 0,
        };
      });
      setMetricHistory(mappedHistory);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải chi tiết chỉ số hội viên');
    }
  }, []);

  const fetchTraineesData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('currentUser');
      if (!token || !userStr) {
        toast.error('Vui lòng đăng nhập lại');
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(userStr) as BackendUser;
      setCurrentUser(parsedUser);

      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      // Fetch bookings to get the trainees
      const bookingsRes = await fetch('http://localhost:3001/bookings/pt-bookings', { headers });
      if (!bookingsRes.ok) throw new Error('Không thể tải danh sách đặt lịch');
      const bookingsData = await bookingsRes.json() as BackendBooking[];

      // Extract unique trainees from bookings
      const uniqueTraineesMap = new Map<number, BackendUser>();
      bookingsData.forEach((booking) => {
        if (booking.user && booking.user.id) {
          uniqueTraineesMap.set(booking.user.id, booking.user);
        }
      });

      const uniqueTraineesList = Array.from(uniqueTraineesMap.values());

      // For each trainee, fetch their active membership to find package name and remaining sessions
      interface MemDataType {
        package?: {
          name: string;
        };
        remainingSessions?: number;
      }
      const traineesListWithPackages = await Promise.all(
        uniqueTraineesList.map(async (user) => {
          try {
            const memRes = await fetch(`http://localhost:3001/memberships/active/${user.id}`, { headers });
            if (memRes.ok) {
              const rawText = await memRes.text();
              const memData = rawText ? JSON.parse(rawText) as MemDataType : null;
              if (memData) {
                return {
                  id: user.id,
                  name: user.fullName,
                  avatar: user.avatar || (user.gender === 'female' ? '👩' : '👨'),
                  package: memData.package?.name || 'Gói tập',
                  sessionsLeft: memData.remainingSessions || 0,
                  phone: user.phone || 'Chưa cập nhật',
                  email: user.email,
                };
              }
            }
          } catch (err) {
            console.error(`Error fetching membership for user ${user.id}:`, err);
          }
          return {
            id: user.id,
            name: user.fullName,
            avatar: user.avatar || (user.gender === 'female' ? '👩' : '👨'),
            package: 'Chưa đăng ký gói tập PT',
            sessionsLeft: 0,
            phone: user.phone || 'Chưa cập nhật',
            email: user.email,
          };
        })
      );

      setTrainees(traineesListWithPackages);

      // Select the first trainee if none selected
      if (traineesListWithPackages.length > 0 && !selectedTrainee) {
        setSelectedTrainee(traineesListWithPackages[0]);
      }
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Lỗi khi tải thông tin hội viên');
    } finally {
      setLoading(false);
    }
  }, [selectedTrainee]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTraineesData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchTraineesData]);

  useEffect(() => {
    if (selectedTrainee) {
      const timer = setTimeout(() => {
        fetchTraineeDetails(selectedTrainee.id);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedTrainee, fetchTraineeDetails]);

  const filteredTrainees = trainees.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateMetrics = async () => {
    if (!selectedTrainee) return;
    if (metricForm.date && metricForm.weight && metricForm.fat && metricForm.muscle) {
      try {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const payload = {
          userId: selectedTrainee.id,
          ptId: currentUser?.id || undefined,
          weight: parseFloat(metricForm.weight),
          bodyFat: parseFloat(metricForm.fat),
          muscleMass: parseFloat(metricForm.muscle),
          recordedDate: metricForm.date,
        };

        const res = await fetch('http://localhost:3001/body-records', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Lỗi khi lưu chỉ số');
        }

        toast.success('Đã lưu cập nhật thành công!');
        await fetchTraineeDetails(selectedTrainee.id);
        setShowUpdateDrawer(false);
        setMetricForm({ date: '', weight: '', fat: '', muscle: '' });
      } catch (err: unknown) {
        console.error(err);
        toast.error(err instanceof Error ? err.message : 'Không thể lưu chỉ số');
      }
    } else {
      toast.error('Vui lòng điền đầy đủ các chỉ số đo!');
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium">Đang tải dữ liệu hội viên...</p>
        </div>
      </div>
    );
  }

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
          {filteredTrainees.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Chưa có hội viên nào đặt lịch</p>
            </div>
          ) : (
            filteredTrainees.map((trainee) => (
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
            ))
          )}
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

    </div>
  );
}
