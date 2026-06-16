"use client";

import { useState, useEffect } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: number;
  sender: string;
  preview: string;
  time: string;
  stars?: number;
  full: string;
  title: string;
  type: string;
  replyContent?: string;
  status: 'pending' | 'responded';
}

export function StaffFeedbackPage() {
  const [feedbacksList, setFeedbacksList] = useState<Feedback[]>([]);
  const [selected, setSelected] = useState<Feedback | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentStaffId, setCurrentStaffId] = useState<number | undefined>(undefined);

  const fetchFeedbacks = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch('http://localhost:3001/feedbacks', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const mapped = data.map((fb: any) => {
            const dateObj = new Date(fb.createdAt);
            const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            const dateStr = dateObj.toLocaleDateString('vi-VN');
            const formattedTime = `${timeStr} – ${dateStr}`;

            let fbType = 'service';
            let fbTitle = 'Ý kiến đóng góp';
            let fbText = fb.content;
            let ratingVal = undefined;

            try {
              const parsed = JSON.parse(fb.content);
              fbType = parsed.type || 'service';
              fbTitle = parsed.title || 'Ý kiến đóng góp';
              fbText = parsed.content || '';
              if (parsed.rating !== undefined && parsed.rating !== null) {
                ratingVal = Number(parsed.rating);
              }
            } catch (e) {
              const match = fb.content.match(/^\[(.*?)\]\s*(.*)/);
              if (match) {
                fbType = match[1];
                fbText = match[2];
              }
            }

            return {
              id: fb.id,
              sender: fb.user?.fullName || 'Hội viên ẩn danh',
              preview: fbText.length > 40 ? fbText.substring(0, 40) + '...' : fbText,
              time: formattedTime,
              stars: ratingVal,
              full: fbText,
              title: fbTitle,
              type: fbType,
              replyContent: fb.replyContent,
              status: fb.status,
            };
          });
          setFeedbacksList(mapped);
          
          if (selected) {
            const updated = mapped.find(f => f.id === selected.id);
            if (updated) {
              setSelected(updated);
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching feedbacks:', err);
        toast.error('Không thể tải danh sách phản hồi');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchFeedbacks();

    // Parse current staff user ID
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          setCurrentStaffId(Number(user.id));
        }
      } catch (e) {
        console.error('Error parsing current user:', e);
      }
    }
  }, []);

  const handleResolve = () => {
    if (!selected || !reply.trim()) return;

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const payload = {
      replyContent: reply.trim(),
      status: 'responded',
      replierId: currentStaffId,
    };

    fetch(`http://localhost:3001/feedbacks/${selected.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Gửi câu trả lời thất bại');
        return data;
      })
      .then(() => {
        toast.success('Đã gửi trả lời và đóng ticket phản hồi!');
        setReply('');
        fetchFeedbacks();
      })
      .catch(err => {
        toast.error(err.message || 'Có lỗi xảy ra!');
      });
  };

  const pendingCount = feedbacksList.filter((f) => f.status === 'pending').length;

  if (loading && feedbacksList.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        <span className="ml-3 text-[var(--muted-foreground)]">Đang tải phản hồi góp ý...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-5">
      {/* List */}
      <div className="col-span-2 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-bold text-[var(--foreground)]">Phản hồi hội viên</h2>
          <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount} chưa xử lý</span>
        </div>
        {feedbacksList.map((fb) => {
          const isResolved = fb.status === 'responded';
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
              
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${fb.type === 'trainer' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                  {fb.type === 'trainer' ? 'Huấn luyện viên' : 'Dịch vụ'}
                </span>
                <span className="text-xs font-bold text-[var(--foreground)] truncate">{fb.title}</span>
              </div>

              <p className="text-xs text-[var(--muted-foreground)] truncate mb-1.5">{fb.preview}</p>
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5 min-h-[12px]">
                  {fb.type === 'trainer' && fb.stars !== undefined ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < (fb.stars ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                    ))
                  ) : (
                    <span className="text-[10px] text-[var(--muted-foreground)] italic">Không có đánh giá sao</span>
                  )}
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
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${selected.type === 'trainer' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-purple-100 text-purple-800 border border-purple-200'}`}>
                    {selected.type === 'trainer' ? 'Huấn luyện viên' : 'Dịch vụ'}
                  </span>
                  <span className="text-sm font-bold text-[var(--foreground)]">{selected.title}</span>
                </div>
                <h3 className="font-bold text-[var(--foreground)] text-lg">{selected.sender}</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{selected.time}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${selected.status === 'responded' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {selected.status === 'responded' ? 'Đã giải quyết' : 'Chưa xử lý'}
              </span>
            </div>

            {selected.type === 'trainer' && selected.stars !== undefined && (
              <div className="flex gap-1 items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg inline-flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < (selected.stars ?? 0) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} />
                ))}
                <span className="text-[var(--muted-foreground)] text-xs font-bold ml-1">{selected.stars}/5 sao</span>
              </div>
            )}

            <div className="bg-[var(--secondary)] rounded-lg p-3">
              <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1.5">Nội dung phản hồi</p>
              <p className="text-sm text-[var(--foreground)] leading-relaxed">{selected.full}</p>
            </div>

            {selected.status === 'pending' ? (
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
              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <p className="text-emerald-700 font-semibold text-xs mb-1">✓ Đã phản hồi hội viên</p>
                  <p className="text-sm text-emerald-900 italic">“ {selected.replyContent} ”</p>
                </div>
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
