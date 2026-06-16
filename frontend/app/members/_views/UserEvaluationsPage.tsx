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
      <div className="max-w-[1800px] mx-auto px-8 py-24 flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-10 h-10 text-[#FF5A00] animate-spin mb-4" />
        <p className="text-[#A0A0A0]">Đang tải nhận xét từ Huấn luyện viên...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#333333] pb-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <FileText className="w-9 h-9 text-[#FF5A00]" />
            Đánh giá từ Huấn luyện viên
          </h2>
          <p className="text-[#A0A0A0] text-base mt-2">
            Theo dõi tiến độ, nhận xét chuyên môn và đề xuất cải thiện từ PT của bạn qua từng chu kỳ tập luyện.
          </p>
        </div>

        {averageScore && (
          <div className="flex items-center gap-5 bg-[#242424] border border-[#333333] px-8 py-5 rounded-2xl shadow-2xl self-start md:self-auto">
            <div>
              <p className="text-xs font-black text-[#A0A0A0] uppercase tracking-wider">Điểm số trung bình</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-4xl font-black text-[#FF5A00]">{averageScore}</span>
                <span className="text-base text-[#A0A0A0]">/10</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-[#FF5A00]/10 rounded-full flex items-center justify-center text-3xl shadow-inner border border-[#FF5A00]/15">
              ⭐
            </div>
          </div>
        )}
      </div>

      {evaluations.length === 0 ? (
        <div className="bg-[#242424] border border-[#333333] p-20 text-center text-[#A0A0A0] rounded-2xl shadow-2xl">
          <FileText className="w-20 h-20 text-zinc-600 mx-auto mb-4" />
          <p className="text-xl font-black text-white mb-2 uppercase">Chưa có đánh giá nào từ Huấn luyện viên</p>
          <p className="text-base">PT sẽ tạo đánh giá cho bạn khi kết thúc chu kỳ tập luyện hoặc vào cuối mỗi tháng.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                className="bg-[#242424] border border-[#333333] rounded-2xl p-8 shadow-2xl space-y-6 hover:border-[#FF5A00] transition-all duration-300"
              >
                {/* Header of Evaluation card */}
                <div className="flex items-start justify-between gap-4 border-b border-[#333333] pb-5">
                  <div className="space-y-1.5">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Tháng {dateLabel}</h3>
                    <p className="text-sm text-[#A0A0A0]">
                      Người đánh giá: <span className="text-[#FF5A00] font-black">{evalItem.pt?.fullName || 'Huấn luyện viên'}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2.5">
                    <span className="text-3xl font-black text-[#FF5A00] bg-[#FF5A00]/10 px-4 py-1.5 rounded-xl border border-[#FF5A00]/20 shadow-inner">
                      {evalItem.score} <span className="text-xs uppercase font-bold text-[#A0A0A0] ml-1">Điểm</span>
                    </span>
                    <span className={`text-xs font-black uppercase px-3.5 py-1 rounded-full border tracking-wide ${level.color}`}>
                      {level.label}
                    </span>
                  </div>
                </div>

                {/* Body of Evaluation card */}
                <div className="space-y-5">
                  {/* PT Review Section */}
                  <div className="space-y-2">
                    <h4 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-[#FF5A00]" />
                      Nhận xét chuyên môn
                    </h4>
                    <p className="text-base text-[#D0D0D0] leading-relaxed bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                      {parsed.ptReview || 'Không có nhận xét chi tiết.'}
                    </p>
                  </div>

                  {/* PT Recommendations Section */}
                  {parsed.recommendations && (
                    <div className="space-y-2">
                      <h4 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-emerald-400" />
                        Đề xuất &amp; Hướng dẫn tập luyện
                      </h4>
                      <p className="text-base text-[#D0D0D0] leading-relaxed bg-[#1A1A1A] p-5 rounded-xl border border-[#333333]">
                        {parsed.recommendations}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer of card */}
                <div className="flex items-center gap-2 text-sm text-[#A0A0A0] pt-2 border-t border-[#333333]">
                  <Calendar className="w-4 h-4 text-[#FF5A00]" />
                  <span>Ngày đánh giá: <strong className="text-white font-bold">{new Date(evalItem.createdAt || evalItem.evaluationDate).toLocaleDateString('vi-VN')}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
