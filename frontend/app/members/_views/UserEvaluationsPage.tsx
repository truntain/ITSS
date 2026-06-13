"use client";

import { useState, useEffect } from 'react';
import { FileText, Calendar, Star, MessageSquare, Lightbulb, Loader2 } from 'lucide-react';

export function UserEvaluationsPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const completionLevels = {
    excellent: { label: 'Xuất sắc', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    good: { label: 'Tốt', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
    average: { label: 'Trung bình', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
    poor: { label: 'Cần cải thiện', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  };

  const fetchEvaluations = async (userId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:3001/trainers/evaluations/trainee/${userId}`, { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách đánh giá');
      const data = await res.json();
      setEvaluations(data);
    } catch (err) {
      console.error('Lỗi khi tải đánh giá từ PT:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user?.id) {
          fetchEvaluations(user.id);
        }
      }
    }
  }, []);

  const averageScore = evaluations.length > 0
    ? (evaluations.reduce((acc, curr) => acc + curr.score, 0) / evaluations.length).toFixed(1)
    : null;

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-24 flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-[#FF5A00] animate-spin mb-4" />
        <p className="text-[#A0A0A0]">Đang tải nhận xét từ Huấn luyện viên...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#333333] pb-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#FF5A00]" />
            Đánh giá từ Huấn luyện viên
          </h2>
          <p className="text-[#A0A0A0] text-sm mt-1">
            Theo dõi tiến độ, nhận xét chuyên môn và đề xuất cải thiện từ PT của bạn.
          </p>
        </div>

        {averageScore && (
          <div className="flex items-center gap-4 bg-[#242424] border border-[#333333] px-6 py-4 rounded-lg shadow-xl self-start md:self-auto">
            <div>
              <p className="text-xs font-bold text-[#A0A0A0] uppercase tracking-wider">Điểm trung bình</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-[#FF5A00]">{averageScore}</span>
                <span className="text-sm text-[#A0A0A0]">/10</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-[#FF5A00]/10 rounded-full flex items-center justify-center text-2xl shadow-inner">
              ⭐
            </div>
          </div>
        )}
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-[#242424] border border-[#333333] p-16 text-center text-[#A0A0A0] rounded-lg shadow-2xl">
          <FileText className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <p className="text-lg font-bold text-white mb-2">Chưa có đánh giá nào từ Huấn luyện viên</p>
          <p className="text-sm">PT sẽ tạo đánh giá cho bạn khi kết thúc chu kỳ tập luyện hoặc vào cuối tháng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {evaluations.map((evalItem: any, index: number) => {
            let parsed = { completionLevel: '', ptReview: '', recommendations: '' };
            try {
              parsed = JSON.parse(evalItem.content);
            } catch (e) {
              parsed.ptReview = evalItem.content;
            }

            const level = completionLevels[parsed.completionLevel as keyof typeof completionLevels] || {
              label: 'Đang đánh giá',
              color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'
            };

            const dateLabel = new Date(evalItem.evaluationDate).toLocaleDateString('vi-VN', {
              month: 'numeric',
              year: 'numeric'
            });

            return (
              <div
                key={evalItem.id || index}
                className="bg-[#242424] border border-[#333333] rounded-lg p-6 shadow-xl space-y-6 hover:border-[#FF5A00] transition-colors"
              >
                {/* Header of Evaluation card */}
                <div className="flex items-start justify-between gap-4 border-b border-[#333333] pb-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-white uppercase">Tháng {dateLabel}</h3>
                    <p className="text-xs text-[#A0A0A0]">
                      Người đánh giá: <span className="text-white font-bold">{evalItem.pt?.fullName || 'Huấn luyện viên'}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-2xl font-black text-[#FF5A00] bg-[#FF5A00]/10 px-3 py-1 rounded-md border border-[#FF5A00]/20">
                      {evalItem.score} <span className="text-xs text-[#A0A0A0]">Điểm</span>
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${level.color}`}>
                      {level.label}
                    </span>
                  </div>
                </div>

                {/* Body of Evaluation card */}
                <div className="space-y-4">
                  {/* PT Review Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#FF5A00]" />
                      Nhận xét chuyên môn
                    </h4>
                    <p className="text-sm text-[#D0D0D0] leading-relaxed bg-[#1A1A1A] p-4 rounded border border-[#333333]">
                      {parsed.ptReview || 'Không có nhận xét chi tiết.'}
                    </p>
                  </div>

                  {/* PT Recommendations Section */}
                  {parsed.recommendations && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-emerald-400" />
                        Đề xuất từ PT
                      </h4>
                      <p className="text-sm text-[#D0D0D0] leading-relaxed bg-[#1A1A1A] p-4 rounded border border-[#333333]">
                        {parsed.recommendations}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer of card */}
                <div className="flex items-center gap-2 text-xs text-[#A0A0A0]">
                  <Calendar className="w-4 h-4" />
                  <span>Ngày đánh giá: {new Date(evalItem.createdAt || evalItem.evaluationDate).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
