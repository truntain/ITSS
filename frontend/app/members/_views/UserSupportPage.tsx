"use client";

import { useState, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, Star, ChevronDown } from 'lucide-react';
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
      rating: rating,
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
    <div className="max-w-[1800px] mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submit Form */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
          <h3 className="text-white font-black text-lg mb-5">Gửi phản hồi mới</h3>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wide block mb-1.5">
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
                  className="w-full bg-[#242424] border border-[#333333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A00] appearance-none"
                >
                  <option value="">-- Chọn loại phản hồi --</option>
                  <option value="service">Chất lượng dịch vụ</option>
                  <option value="trainer">Huấn luyện viên</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0] pointer-events-none" />
              </div>
            </div>

            {feedbackType === 'trainer' && (
              <div>
                <label className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wide block mb-1.5">
                  Huấn luyện viên cần đánh giá *
                </label>
                <div className="relative">
                  <select
                    value={selectedPtId}
                    onChange={(e) => setSelectedPtId(e.target.value)}
                    className="w-full bg-[#242424] border border-[#333333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A00] appearance-none"
                  >
                    <option value="">-- Chọn huấn luyện viên --</option>
                    {pts.map((pt) => (
                      <option key={pt.id} value={pt.id}>
                        {pt.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0] pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wide block mb-1.5">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={feedbackTitle}
                onChange={(e) => setFeedbackTitle(e.target.value)}
                placeholder="Mô tả ngắn gọn vấn đề..."
                className="w-full bg-[#242424] border border-[#333333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A00] placeholder:text-[#555555]"
              />
            </div>

            <div>
              <label className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wide block mb-1.5">
                Nội dung chi tiết *
              </label>
              <textarea
                value={feedbackContent}
                onChange={(e) => setFeedbackContent(e.target.value)}
                rows={4}
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                className="w-full bg-[#242424] border border-[#333333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A00] placeholder:text-[#555555] resize-none"
              />
            </div>

            <div>
              <label className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wide block mb-1.5">
                Đánh giá trải nghiệm
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= rating ? 'fill-[#FF5A00] text-[#FF5A00]' : 'text-[#444444]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-[#FF5A00]/30"
            >
              <Send className="w-4 h-4" />
              GỬI PHẢN HỒI
            </button>
          </form>
        </div>

        {/* Ticket History */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
          <h3 className="text-white font-black text-lg mb-5">Lịch sử phản hồi</h3>
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-[#A0A0A0]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A00] mb-4"></div>
                <p className="text-sm">Đang tải lịch sử phản hồi...</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-[#A0A0A0]">
                <AlertCircle className="w-8 h-8 mx-auto mb-3 text-[#555555]" />
                <p className="text-sm">Bạn chưa gửi phản hồi nào.</p>
              </div>
            ) : (
              tickets.map((ticket) => {
                const Icon = StatusIcon[ticket.status];
                const isExpanded = expandedTicket === ticket.id;
                return (
                  <div key={ticket.id} className="bg-[#242424] border border-[#333333] rounded-xl overflow-hidden">
                    <button
                      type="button"
                      className="w-full p-4 text-left flex items-start gap-3"
                      onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                    >
                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 flex-shrink-0 ${statusColor[ticket.status]}`}>
                        <Icon className="w-3 h-3" />
                        {statusLabel[ticket.status]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#FF5A00] bg-[#FF5A00]/10 px-1.5 py-0.5 rounded">
                            {ticket.type}
                          </span>
                          <p className="text-white font-bold text-sm truncate">{ticket.title}</p>
                        </div>
                        <p className="text-[#A0A0A0] text-xs mt-1">{ticket.id} · {ticket.date}</p>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-[#A0A0A0] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[#333333] space-y-3">
                        <div className="mt-3">
                          <p className="text-[#A0A0A0] text-xs uppercase font-bold mb-1">Nội dung phản hồi:</p>
                          <p className="text-white text-sm whitespace-pre-wrap">{ticket.content}</p>
                        </div>
                        {ticket.reply && (
                          <div>
                            <p className="text-[#A0A0A0] text-xs uppercase font-bold mb-1">Phản hồi từ GymPro:</p>
                            <div className="bg-[#FF5A00]/10 border border-[#FF5A00]/20 rounded-xl p-3">
                              <p className="text-[#FFB08A] text-sm whitespace-pre-wrap">{ticket.reply}</p>
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
