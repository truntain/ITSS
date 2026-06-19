"use client";

import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, Star, ChevronDown, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackTicket {
  id: string;
  type: string;
  title: string;
  content?: string;
  date: string;
  status: 'pending' | 'processing' | 'resolved';
  reply?: string;
}

const statusColor: Record<FeedbackTicket['status'], string> = {
  pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  processing: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  resolved: 'bg-green-500/15 text-green-400 border-green-500/20',
};
const statusLabel: Record<FeedbackTicket['status'], string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  resolved: 'Đã giải quyết',
};
const StatusIcon: Record<FeedbackTicket['status'], typeof AlertCircle> = {
  pending: Clock,
  processing: AlertCircle,
  resolved: CheckCircle,
};

export function UserSupportPage() {
  const [feedbackType, setFeedbackType] = useState('');
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [rating, setRating] = useState(0);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  const [tickets, setTickets] = useState<FeedbackTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // PT state
  const [pts, setPts] = useState<any[]>([]);
  const [selectedPtId, setSelectedPtId] = useState('');

  const fetchTickets = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/feedbacks/my-feedbacks', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tickets');
        return res.json();
      })
      .then((data: any[]) => {
        const mapped = data.map(item => {
          let type = 'other';
          let title = 'Phản hồi';
          let bodyContent = item.content;

          try {
            const parsed = JSON.parse(item.content);
            if (parsed.type) type = parsed.type;
            if (parsed.title) title = parsed.title;
            if (parsed.content) bodyContent = parsed.content;
          } catch (e) {
            const match = item.content.match(/^\[(.*?)\]\s*(.*)/);
            if (match) {
              type = match[1];
              title = match[2];
            } else {
              title = item.content.slice(0, 35) + (item.content.length > 35 ? '...' : '');
            }
          }

          const createdDate = new Date(item.createdAt);
          const dStr = String(createdDate.getDate()).padStart(2, '0');
          const mStr = String(createdDate.getMonth() + 1).padStart(2, '0');
          const yStr = createdDate.getFullYear();
          const dateFormatted = `${dStr}/${mStr}/${yStr}`;

          const typeLabels: Record<string, string> = {
            service: 'Chất lượng dịch vụ',
            trainer: 'Huấn luyện viên',
          };
          const resolvedType = typeLabels[type] || type;

          return {
            id: `FB-${createdDate.getFullYear()}-${String(item.id).padStart(3, '0')}`,
            type: resolvedType,
            title: title,
            content: bodyContent,
            date: dateFormatted,
            status: (item.status === 'responded' ? 'resolved' : 'pending') as FeedbackTicket['status'],
            reply: item.replyContent,
          };
        });
        setTickets(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching tickets:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();

    // Fetch member's bookings to get their personal trainers
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/bookings/my-bookings', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
      })
      .then((data: any[]) => {
        const uniquePtsMap = new Map();
        data.forEach(booking => {
          if (booking.pt) {
            uniquePtsMap.set(booking.pt.id, booking.pt);
          }
        });
        setPts(Array.from(uniquePtsMap.values()));
      })
      .catch(err => {
        console.error('Error fetching PT list:', err);
      });
  }, []);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType || !feedbackTitle || !feedbackContent) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (feedbackType === 'trainer' && !selectedPtId) {
      toast.error('Vui lòng chọn huấn luyện viên cần đánh giá');
      return;
    }

    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      toast.error('Không tìm thấy thông tin đăng nhập');
      return;
    }
    const currentUser = JSON.parse(currentUserStr);

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const structuredContent = JSON.stringify({
      type: feedbackType,
      title: feedbackTitle,
      content: feedbackContent,
      rating: feedbackType === 'trainer' ? rating : undefined,
      ptId: selectedPtId ? parseInt(selectedPtId) : undefined,
    });

    // 1. Submit feedback
    const feedbackPromise = fetch('http://localhost:3001/feedbacks', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        userId: currentUser.id,
        content: structuredContent,
      }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to submit feedback');
      return res.json();
    });

    // 2. Submit rating for PT if feedback is about trainer
    const ratingPromise = feedbackType === 'trainer'
      ? fetch('http://localhost:3001/trainers/ratings', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            userId: currentUser.id,
            ptId: parseInt(selectedPtId),
            rating: rating || 5, // Default to 5 stars if not rated
            comment: feedbackContent,
          }),
        }).then(res => {
          if (!res.ok) throw new Error('Failed to submit PT rating');
          return res.json();
        })
      : Promise.resolve();

    Promise.all([feedbackPromise, ratingPromise])
      .then(() => {
        toast.success('Phản hồi và đánh giá đã được gửi thành công!');
        setFeedbackType('');
        setSelectedPtId('');
        setFeedbackTitle('');
        setFeedbackContent('');
        setRating(0);
        fetchTickets();
      })
      .catch(err => {
        console.error('Error submitting feedback/rating:', err);
        toast.error('Có lỗi xảy ra khi gửi phản hồi');
      });
  };

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#333333] pb-6">
        <h1 className="text-4xl font-black text-white mb-2 uppercase flex items-center gap-3">
          <MessageSquare className="w-9 h-9 text-[#FF5A00]" />
          Hỗ trợ &amp; Phản hồi
        </h1>
        <p className="text-[#A0A0A0] text-base">
          Gửi phản hồi đóng góp ý kiến về chất lượng dịch vụ hoặc đánh giá huấn luyện viên cá nhân của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Submit Form */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-8 shadow-2xl">
          <h3 className="text-white font-black text-2xl mb-6">Gửi phản hồi mới</h3>
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
            <div>
              <label className="text-[#A0A0A0] text-sm font-black uppercase tracking-wider block mb-2">
                Loại phản hồi *
              </label>
              <div className="relative">
                <select
                  value={feedbackType}
                  onChange={(e) => {
                    setFeedbackType(e.target.value);
                    if (e.target.value !== 'trainer') {
                      setSelectedPtId('');
                    }
                  }}
                  className="w-full bg-[#242424] border-2 border-[#333333] text-white rounded-xl px-5 py-4 text-base focus:outline-none focus:border-[#FF5A00] appearance-none"
                >
                  <option value="">-- Chọn loại phản hồi --</option>
                  <option value="service">Chất lượng dịch vụ phòng tập</option>
                  <option value="trainer">Đánh giá Huấn luyện viên (PT)</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0] pointer-events-none" />
              </div>
            </div>

            {feedbackType === 'trainer' && (
              <div>
                <label className="text-[#A0A0A0] text-sm font-black uppercase tracking-wider block mb-2">
                  Huấn luyện viên cần đánh giá *
                </label>
                <div className="relative">
                  <select
                    value={selectedPtId}
                    onChange={(e) => setSelectedPtId(e.target.value)}
                    className="w-full bg-[#242424] border-2 border-[#333333] text-white rounded-xl px-5 py-4 text-base focus:outline-none focus:border-[#FF5A00] appearance-none"
                  >
                    <option value="">-- Chọn huấn luyện viên --</option>
                    {pts.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0] pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[#A0A0A0] text-sm font-black uppercase tracking-wider block mb-2">
                Tiêu đề phản hồi *
              </label>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                disabled={!feedbackType}
                placeholder={feedbackType ? "Mô tả ngắn gọn tiêu đề phản hồi..." : "Vui lòng chọn loại phản hồi trước..."}
                className="w-full bg-[#242424] border-2 border-[#333333] text-white rounded-xl px-5 py-4 text-base focus:outline-none focus:border-[#FF5A00] placeholder:text-[#555555] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="text-[#A0A0A0] text-sm font-black uppercase tracking-wider block mb-2">
                Nội dung chi tiết *
              </label>
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                disabled={!feedbackType}
                rows={5}
                placeholder={feedbackType ? "Nhập nội dung phản hồi chi tiết của bạn..." : "Vui lòng chọn loại phản hồi trước..."}
                className="w-full bg-[#242424] border-2 border-[#333333] text-white rounded-xl px-5 py-4 text-base focus:outline-none focus:border-[#FF5A00] placeholder:text-[#555555] resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {feedbackType === 'trainer' && (
              <div className="bg-[#242424] p-5 rounded-xl border border-[#333333]">
                <label className="text-[#A0A0A0] text-sm font-black uppercase tracking-wider block mb-3">
                  Số sao đánh giá (PT)
                </label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-120 duration-200"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors ${
                          star <= rating ? 'fill-[#FF5A00] text-[#FF5A00]' : 'text-[#444444]'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!feedbackType}
              className="w-full py-4 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#FF5A00]/30 text-base uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              GỬI PHẢN HỒI NGAY
            </button>
          </form>
        </div>

        {/* Ticket History */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-8 shadow-2xl">
          <h3 className="text-white font-black text-2xl mb-6">Lịch sử phản hồi</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[#A0A0A0]">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF5A00] mb-4"></div>
                <p className="text-base font-bold">Đang tải lịch sử phản hồi...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-16 text-[#A0A0A0]">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-[#555555]" />
                <p className="text-base font-bold">Bạn chưa gửi phản hồi nào.</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const Icon = StatusIcon[ticket.status];
                const isExpanded = expandedTicket === ticket.id;
                return (
                  <div key={ticket.id} className="bg-[#242424] border border-[#333333] rounded-xl overflow-hidden hover:border-[#FF5A00]/40 transition-colors">
                    <button
                      type="button"
                      className="w-full p-5 text-left flex items-start gap-4"
                      onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    >
                      <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 flex-shrink-0 ${statusColor[ticket.status]}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {statusLabel[ticket.status]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-xs font-black text-[#FF5A00] bg-[#FF5A00]/10 px-2 py-0.5 rounded border border-[#FF5A00]/10 uppercase">
                            {ticket.type}
                          </span>
                          <p className="text-white font-black text-base truncate">{ticket.title}</p>
                        </div>
                        <p className="text-[#A0A0A0] text-sm mt-1.5">{ticket.id} · {ticket.date}</p>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-[#A0A0A0] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''} self-center`} />
                    </button>
                    {isExpanded && (
                      <div className="px-5 pb-5 border-t border-[#333333] space-y-4 bg-[#1e1e1e]/40">
                        <div className="mt-4">
                          <p className="text-[#A0A0A0] text-xs uppercase font-black tracking-wider mb-2">Nội dung phản hồi:</p>
                          <p className="text-white text-base leading-relaxed whitespace-pre-wrap bg-[#1A1A1A] p-4 rounded-xl border border-[#333333]">{ticket.content}</p>
                        </div>
                        {ticket.reply && (
                          <div>
                            <p className="text-[#A0A0A0] text-xs uppercase font-black tracking-wider mb-2">Phản hồi giải quyết từ GymPro:</p>
                            <div className="bg-[#FF5A00]/10 border-2 border-[#FF5A00]/20 rounded-xl p-4 shadow-inner">
                              <p className="text-[#FFB08A] text-base font-medium leading-relaxed whitespace-pre-wrap">{ticket.reply}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
