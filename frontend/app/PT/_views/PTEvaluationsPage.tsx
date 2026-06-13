"use client";

import { useState, useEffect } from 'react';
import { Check, Calendar, Target, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type CompletionLevel = 'excellent' | 'good' | 'average' | 'poor' | null;

export function PTEvaluationsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trainees, setTrainees] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [previousEvaluations, setPreviousEvaluations] = useState<any[]>([]);

  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [completionLevel, setCompletionLevel] = useState<CompletionLevel>(null);
  const [score, setScore] = useState<number>(8);
  const [ptReview, setPtReview] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const months = [
    { value: '2026-06', label: 'Tháng 6/2026' },
    { value: '2026-05', label: 'Tháng 5/2026' },
    { value: '2026-04', label: 'Tháng 4/2026' },
    { value: '2026-03', label: 'Tháng 3/2026' },
    { value: '2026-02', label: 'Tháng 2/2026' },
    { value: '2026-01', label: 'Tháng 1/2026' },
  ];

  const completionLevels = [
    { id: 'excellent', label: 'Xuất sắc', color: 'emerald' },
    { id: 'good', label: 'Tốt', color: 'blue' },
    { id: 'average', label: 'Trung bình', color: 'orange' },
    { id: 'poor', label: 'Cần cải thiện', color: 'red' },
  ];

  const fetchTrainees = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      const res = await fetch('http://localhost:3001/bookings/pt-bookings', { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách đặt lịch');
      const bookingsData = await res.json();
      setBookings(bookingsData);

      const uniqueTraineesMap = new Map<number, any>();
      bookingsData.forEach((booking: any) => {
        if (booking.user && booking.user.id) {
          uniqueTraineesMap.set(booking.user.id, booking.user);
        }
      });

      const uniqueList = Array.from(uniqueTraineesMap.values());
      const mappedTrainees = uniqueList.map((user: any) => ({
        id: user.id,
        name: user.fullName,
      }));
      setTrainees(mappedTrainees);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách học viên:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkoutPlans = async (ptId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:3001/trainers/workout-plans/trainer/${ptId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setWorkoutPlans(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách giáo án:', err);
    }
  };

  const fetchPreviousEvaluations = async (traineeId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      const res = await fetch(`http://localhost:3001/trainers/evaluations/trainee/${traineeId}`, { headers });
      if (!res.ok) throw new Error('Không thể tải lịch sử đánh giá');
      const data = await res.json();
      setPreviousEvaluations(data);
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử đánh giá:', err);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user?.id) {
          fetchTrainees();
          fetchWorkoutPlans(user.id);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (selectedTrainee) {
      fetchPreviousEvaluations(selectedTrainee);
    } else {
      setPreviousEvaluations([]);
    }
  }, [selectedTrainee]);

  const handleSubmit = async () => {
    if (!selectedTrainee || !selectedMonth || !completionLevel || !ptReview || !recommendations || !currentUser) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const payload = {
        ptId: currentUser.id,
        traineeId: selectedTrainee,
        score: score,
        content: JSON.stringify({
          completionLevel,
          ptReview,
          recommendations,
        }),
        evaluationDate: `${selectedMonth}-01`,
      };

      const res = await fetch('http://localhost:3001/trainers/evaluations', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi khi gửi đánh giá');
      }

      toast.success('Đã gửi đánh giá thành công!');
      
      // Reset form
      setCompletionLevel(null);
      setPtReview('');
      setRecommendations('');
      setScore(8);
      // Reload previous evaluations
      fetchPreviousEvaluations(selectedTrainee);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể gửi đánh giá');
    }
  };

  const selectedTraineeData = trainees.find((t) => t.id === selectedTrainee);

  const traineeWorkoutHistory = selectedTrainee
    ? bookings
        .filter((b: any) => b.user?.id === selectedTrainee && (b.status === 'completed' || b.status === 'approved' || b.status === 'checkin'))
        .map((b: any) => {
          const startHour = parseInt(b.startTime?.split(':')[0] || '9');
          const startMin = parseInt(b.startTime?.split(':')[1] || '0');
          const endHour = parseInt(b.endTime?.split(':')[0] || '10');
          const endMin = parseInt(b.endTime?.split(':')[1] || '0');
          const diffMin = (endHour * 60 + endMin) - (startHour * 60 + startMin);

          return {
            date: b.bookingDate,
            session: b.notes || 'Tập luyện cá nhân',
            duration: `${diffMin > 0 ? diffMin : 60} phút`,
          };
        })
    : [];

  const traineeWorkoutPlans = selectedTrainee
    ? workoutPlans
        .filter((p: any) => p.traineeId === selectedTrainee)
        .map((p: any) => p.name)
    : [];

  const traineeGoals = traineeWorkoutPlans.length > 0
    ? traineeWorkoutPlans
    : ['Tập luyện theo hướng dẫn của PT', 'Cải thiện thể lực tổng thể', 'Duy trì tần suất tập đều đặn'];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      emerald: isSelected
        ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-400',
      blue: isSelected
        ? 'bg-blue-500 text-white border-blue-600 shadow-md'
        : 'bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-400',
      orange: isSelected
        ? 'bg-orange-500 text-white border-orange-600 shadow-md'
        : 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400',
      red: isSelected
        ? 'bg-red-500 text-white border-red-600 shadow-md'
        : 'bg-red-50 text-red-700 border-red-200 hover:border-red-400',
    };
    return colors[color as keyof typeof colors] || '';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Đang tải thông tin đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Đánh giá tiến độ Hội viên</h2>

        <div className="space-y-6">
          {/* Selection Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Chọn Hội viên</label>
              <select
                value={selectedTrainee || ''}
                onChange={(e) => setSelectedTrainee(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="">-- Chọn hội viên --</option>
                {trainees.map((trainee) => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tháng đánh giá</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
              >
                <option value="">-- Chọn tháng --</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Trainee Context Section */}
          {selectedTraineeData && (
            <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border-2 border-emerald-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Thông tin học viên</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Workout History */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-slate-900">Lịch sử tập luyện</h4>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {traineeWorkoutHistory.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Chưa có lịch sử tập luyện gần đây.</p>
                    ) : (
                      traineeWorkoutHistory.map((workout, index) => (
                        <div key={index} className="text-sm border-l-2 border-blue-300 pl-3 py-1">
                          <p className="font-semibold text-slate-900">{workout.session}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(workout.date).toLocaleDateString('vi-VN')} • {workout.duration}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Current Goals */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-slate-900">Mục tiêu / Giáo án</h4>
                  </div>
                  <div className="space-y-2">
                    {traineeGoals.map((goal, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Previous Evaluations */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-orange-600" />
                    <h4 className="font-bold text-slate-900">Các đánh giá trước</h4>
                  </div>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {previousEvaluations.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Chưa có đánh giá nào trước đây.</p>
                    ) : (
                      previousEvaluations.map((evaluation: any, index: number) => {
                        let parsedContent = { completionLevel: '', ptReview: '', recommendations: '' };
                        try {
                          parsedContent = JSON.parse(evaluation.content);
                        } catch (e) {
                          parsedContent.ptReview = evaluation.content;
                        }

                        const levelLabel = completionLevels.find(l => l.id === parsedContent.completionLevel)?.label || `Điểm: ${evaluation.score}/10`;

                        return (
                          <div key={evaluation.id || index} className="border-l-2 border-orange-300 pl-3 py-1">
                            <p className="font-semibold text-sm text-slate-900">
                              {new Date(evaluation.evaluationDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}
                            </p>
                            <p className="text-xs text-emerald-600 font-bold mb-1">
                              {levelLabel}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-2" title={parsedContent.ptReview}>
                              {parsedContent.ptReview}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Level & Score Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Mức độ hoàn thành</label>
              <div className="grid grid-cols-2 gap-2">
                {completionLevels.map((level) => (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => {
                      setCompletionLevel(level.id as CompletionLevel);
                      if (level.id === 'excellent') setScore(10);
                      else if (level.id === 'good') setScore(8);
                      else if (level.id === 'average') setScore(6);
                      else if (level.id === 'poor') setScore(4);
                    }}
                    className={`relative px-4 py-2.5 rounded-lg border-2 font-semibold text-sm transition-all cursor-pointer ${getColorClasses(
                      level.color,
                      completionLevel === level.id
                    )}`}
                  >
                    {completionLevel === level.id && (
                      <div className="absolute top-1 right-1">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Điểm số đánh giá (1-10)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-2xl font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border-2 border-emerald-200 min-w-[60px] text-center">
                  {score}
                </span>
              </div>
            </div>
          </div>

          {/* PT Review */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Nhận xét chuyên môn</label>
            <textarea
              value={ptReview}
              onChange={(e) => setPtReview(e.target.value)}
              placeholder="Đánh giá về kỹ thuật, thái độ, sự tiến bộ của hội viên trong tháng qua..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Gợi ý: Nhận xét về kỹ thuật thực hiện bài tập, sự cải thiện về sức mạnh/sức bền, tinh thần tập luyện...
            </p>
          </div>

          {/* Future Recommendations */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Đề xuất điều chỉnh</label>
            <textarea
              value={recommendations}
              onChange={(e) => setRecommendations(e.target.value)}
              placeholder="Đề xuất thay đổi về chế độ tập, bài tập mới, chế độ ăn uống, nghỉ ngơi..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              Gợi ý: Tăng/giảm khối lượng tập, thêm bài tập mới, điều chỉnh dinh dưỡng, thời gian nghỉ...
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              onClick={handleSubmit}
              disabled={!selectedTrainee || !selectedMonth || !completionLevel || !ptReview || !recommendations}
              className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors shadow-md cursor-pointer"
            >
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-bold text-blue-900 mb-2">💡 Lưu ý khi đánh giá</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Đánh giá công bằng, khách quan dựa trên kết quả thực tế</li>
          <li>• Ghi nhận cả điểm mạnh và điểm cần cải thiện của hội viên</li>
          <li>• Đề xuất cụ thể, có thể thực hiện được trong tháng tới</li>
          <li>• Động viên và khích lệ tinh thần tập luyện</li>
        </ul>
      </div>
    </div>
  );
}
