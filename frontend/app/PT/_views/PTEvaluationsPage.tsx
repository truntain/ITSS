"use client";

import { useState } from 'react';
import { Check, Calendar, Target, FileText, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Trainee {
  id: number;
  name: string;
  workoutHistory: { date: string; session: string; duration: string }[];
  currentGoals: string[];
  previousEvaluations: { month: string; level: string; summary: string }[];
}

type CompletionLevel = 'excellent' | 'good' | 'average' | 'poor' | null;

export function PTEvaluationsPage() {
  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [completionLevel, setCompletionLevel] = useState<CompletionLevel>(null);
  const [ptReview, setPtReview] = useState('');
  const [recommendations, setRecommendations] = useState('');

  const trainees: Trainee[] = [
    {
      id: 1,
      name: 'Nguyễn Văn An',
      workoutHistory: [
        { date: '2026-06-05', session: 'Tăng cơ - Ngực & Vai', duration: '60 phút' },
        { date: '2026-06-03', session: 'Cardio & Giảm cân', duration: '45 phút' },
        { date: '2026-06-01', session: 'Tăng cơ - Chân & Mông', duration: '75 phút' },
        { date: '2026-05-29', session: 'CrossFit', duration: '50 phút' },
      ],
      currentGoals: ['Giảm 5kg trong 2 tháng', 'Tăng sức mạnh cơ tay', 'Cải thiện sức bền tim mạch'],
      previousEvaluations: [
        { month: 'Tháng 5/2026', level: 'Tốt', summary: 'Tiến bộ ổn định, động lực cao' },
        { month: 'Tháng 4/2026', level: 'Xuất sắc', summary: 'Hoàn thành xuất sắc các bài tập' },
      ],
    },
    {
      id: 2,
      name: 'Trần Thị Bích',
      workoutHistory: [
        { date: '2026-06-04', session: 'Yoga & Linh hoạt', duration: '60 phút' },
        { date: '2026-06-02', session: 'Pilates', duration: '45 phút' },
        { date: '2026-05-31', session: 'Yoga & Thư giãn', duration: '50 phút' },
      ],
      currentGoals: ['Tăng độ linh hoạt cơ thể', 'Giảm stress', 'Cải thiện tư thế'],
      previousEvaluations: [
        { month: 'Tháng 5/2026', level: 'Xuất sắc', summary: 'Rất chăm chỉ và cải thiện nhanh' },
      ],
    },
    {
      id: 3,
      name: 'Lê Minh Hà',
      workoutHistory: [
        { date: '2026-06-05', session: 'CrossFit', duration: '55 phút' },
        { date: '2026-06-03', session: 'HIIT Training', duration: '40 phút' },
        { date: '2026-06-01', session: 'Functional Training', duration: '60 phút' },
      ],
      currentGoals: ['Tăng sức mạnh toàn thân', 'Cải thiện thể lực', 'Giảm mỡ bụng'],
      previousEvaluations: [
        { month: 'Tháng 5/2026', level: 'Trung bình', summary: 'Cần cải thiện kỹ thuật' },
      ],
    },
    {
      id: 4,
      name: 'Hoàng Văn Đức',
      workoutHistory: [
        { date: '2026-06-04', session: 'Tăng cơ - Lưng & Tay sau', duration: '70 phút' },
        { date: '2026-06-02', session: 'Tăng sức mạnh - Deadlift', duration: '60 phút' },
      ],
      currentGoals: ['Đạt mốc Deadlift 150kg', 'Tăng khối lượng cơ 3kg', 'Giảm tỷ lệ mỡ'],
      previousEvaluations: [
        { month: 'Tháng 5/2026', level: 'Xuất sắc', summary: 'Tiến bộ vượt bậc' },
        { month: 'Tháng 4/2026', level: 'Tốt', summary: 'Kỹ thuật tốt, cần tăng cường độ' },
      ],
    },
    {
      id: 5,
      name: 'Phạm Thị Thu',
      workoutHistory: [
        { date: '2026-06-05', session: 'Zumba Dance', duration: '50 phút' },
        { date: '2026-06-03', session: 'Cardio Mix', duration: '45 phút' },
      ],
      currentGoals: ['Giảm cân 8kg', 'Tăng sức bền', 'Cải thiện vóc dáng'],
      previousEvaluations: [
        { month: 'Tháng 5/2026', level: 'Tốt', summary: 'Chăm chỉ và có động lực' },
      ],
    },
  ];

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

  const handleSubmit = () => {
    const trainee = trainees.find((t) => t.id === selectedTrainee);
    if (!trainee) return;

    console.log('Submitting evaluation:', {
      trainee: selectedTrainee,
      month: selectedMonth,
      completionLevel,
      ptReview,
      recommendations,
    });

    toast.success(`Đã gửi đánh giá thành công cho học viên ${trainee.name}`);

    // Reset form
    setSelectedTrainee(null);
    setSelectedMonth('');
    setCompletionLevel(null);
    setPtReview('');
    setRecommendations('');
  };

  const selectedTraineeData = trainees.find((t) => t.id === selectedTrainee);

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
                onChange={(e) => setSelectedTrainee(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    {selectedTraineeData.workoutHistory.map((workout, index) => (
                      <div key={index} className="text-sm border-l-2 border-blue-300 pl-3 py-1">
                        <p className="font-semibold text-slate-900">{workout.session}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(workout.date).toLocaleDateString('vi-VN')} • {workout.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Goals */}
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <h4 className="font-bold text-slate-900">Mục tiêu tập luyện</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedTraineeData.currentGoals.map((goal, index) => (
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
                  <div className="space-y-3">
                    {selectedTraineeData.previousEvaluations.map((evaluation, index) => (
                      <div key={index} className="border-l-2 border-orange-300 pl-3">
                        <p className="font-semibold text-sm text-slate-900">{evaluation.month}</p>
                        <p className="text-xs text-emerald-600 font-bold mb-1">{evaluation.level}</p>
                        <p className="text-xs text-slate-600">{evaluation.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Completion Level Pills */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">Mức độ hoàn thành</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {completionLevels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setCompletionLevel(level.id as CompletionLevel)}
                  className={`relative px-4 py-3 rounded-lg border-2 font-medium transition-all ${getColorClasses(
                    level.color,
                    completionLevel === level.id
                  )}`}
                >
                  {completionLevel === level.id && (
                    <div className="absolute top-1 right-1">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                  {level.label}
                </button>
              ))}
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
              className="w-full px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors shadow-md"
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
