"use client";

import { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';

interface Feedback {
  id: number;
  sender: string;
  preview: string;
  time: string;
  stars: number;
  full: string;
}

const FEEDBACKS: Feedback[] = [
  { id: 1, sender: 'Nguyễn Thị Bích', preview: 'Máy chạy bộ số 2 phát ra tiếng ồn lớn...', time: '10:24', stars: 2, full: 'Máy chạy bộ số 2 phát ra tiếng ồn rất lớn khi chạy tốc độ cao. Tôi đã phải chuyển sang máy khác. Mong phòng tập kiểm tra và sửa chữa sớm.' },
  { id: 2, sender: 'Trần Minh Khoa', preview: 'Phòng tắm khu nam bị rò nước ở vòi...', time: '09:51', stars: 3, full: 'Phòng tắm khu nam bị rò nước ở vòi số 3, nước chảy liên tục dù đã khóa vòi. Khá bất tiện cho các thành viên.' },
  { id: 3, sender: 'Lê Thanh Hương', preview: 'Dịch vụ PT rất tốt, coach Minh Tuấn...', time: '09:12', stars: 5, full: 'Dịch vụ PT rất tốt, coach Minh Tuấn hỗ trợ nhiệt tình và chuyên nghiệp. Rất hài lòng với lịch tập được lên kế hoạch chi tiết.' },
  { id: 4, sender: 'Phạm Quốc Hùng', preview: 'Quầy lễ tân xử lý nhanh, thái độ...', time: 'Hôm qua', stars: 5, full: 'Quầy lễ tân xử lý nhanh, thái độ phục vụ rất chuyên nghiệp và thân thiện. Cảm ơn đội ngũ nhân viên!' },
  { id: 5, sender: 'Võ Thu Ngân', preview: 'Phòng yoga thiếu thảm, chỉ có 8/15...', time: 'Hôm qua', stars: 3, full: 'Phòng yoga thiếu thảm, chỉ có 8/15 thảm có thể dùng được. Mong phòng tập bổ sung thêm dụng cụ.' },
];

export function StaffFeedbackPage() {
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [reply, setReply] = useState('');
  const [resolved, setResolved] = useState<Set<number>>(new Set([4, 5]));

  const handleResolve = () => {
    if (!selected) return;
    setResolved((prev) => new Set([...prev, selected.id]));
    setReply('');
    setSelected(null);
  };

  const pendingCount = FEEDBACKS.filter((f) => !resolved.has(f.id)).length;

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* List */}
      <div className="col-span-2 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Phản hồi hội viên</h2>
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} chưa xử lý</span>
        </div>
        {FEEDBACKS.map((fb) => {
          const isResolved = resolved.has(fb.id);
          const isSelected = selected?.id === fb.id;
          return (
            <button
              key={fb.id}
              onClick={() => setSelected(fb)}
              className={`w-full text-left p-3 rounded-xl border transition-all ${isSelected ? 'border-orange-400 bg-orange-50' : 'border-[var(--border)] bg-[var(--card)] hover:border-slate-300'}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                    {fb.sender.charAt(0)}
                  </div>
                  <span className={`text-sm font-semibold ${isResolved ? 'text-[var(--muted-foreground)]' : 'text-[var(--foreground)]'}`}>{fb.sender}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {isResolved ? 'Đã xử lý' : 'Chờ xử lý'}
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] truncate mb-1.5">{fb.preview}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < fb.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="text-[var(--muted-foreground)] text-[10px]">{fb.time}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail */}
      <div className="col-span-3">
        {selected ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-[var(--foreground)]">{selected.sender}</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{selected.time}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${resolved.has(selected.id) ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {resolved.has(selected.id) ? 'Đã giải quyết' : 'Chưa xử lý'}
              </span>
            </div>

            <div className="flex gap-1 items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < selected.stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
              ))}
              <span className="text-[var(--muted-foreground)] text-sm ml-1">{selected.stars}/5 sao</span>
            </div>

            <div className="bg-[var(--secondary)] rounded-lg p-3">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5">Nội dung phản hồi</p>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">{selected.full}</p>
            </div>

            {!resolved.has(selected.id) ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 block">Trả lời khách hàng</label>
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                    className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[var(--background)] resize-none"
                  />
                </div>
                <button
                  onClick={handleResolve}
                  disabled={!reply.trim()}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Gửi trả lời & Đóng ticket
                </button>
              </>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <p className="text-emerald-700 font-semibold text-sm">✓ Ticket này đã được xử lý</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-10 flex flex-col items-center justify-center min-h-[300px] shadow-sm">
            <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-[var(--muted-foreground)] text-sm">Chọn một phản hồi để xem chi tiết</p>
          </div>
        )}
      </div>
    </div>
  );
}
