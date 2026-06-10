"use client";

import { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Clock, Star, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackTicket {
  id: string;
  type: string;
  title: string;
  date: string;
  status: 'pending' | 'processing' | 'resolved';
  reply?: string;
}

const ticketHistory: FeedbackTicket[] = [
  {
    id: 'FB-2024-041',
    type: 'Thiết bị',
    title: 'Máy chạy bộ số 3 bị hỏng màn hình',
    date: '02/06/2024',
    status: 'resolved',
    reply: 'Cảm ơn bạn đã phản ánh! Thiết bị đã được sửa chữa và hoạt động bình thường trở lại.',
  },
  {
    id: 'FB-2024-038',
    type: 'Dịch vụ',
    title: 'Phòng tắm khu vực B chưa được vệ sinh sạch',
    date: '28/05/2024',
    status: 'resolved',
    reply: 'Chúng tôi đã nhắc nhở đội vệ sinh và cải thiện lịch dọn dẹp. Xin lỗi vì sự bất tiện!',
  },
  {
    id: 'FB-2024-035',
    type: 'Gói tập',
    title: 'Muốn đổi lịch PT nhưng bị báo hết slot',
    date: '20/05/2024',
    status: 'processing',
  },
];

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

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackType || !feedbackTitle || !feedbackContent) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    toast.success('Phản hồi đã được gửi! Chúng tôi sẽ liên hệ trong 24 giờ.');
    setFeedbackType('');
    setFeedbackTitle('');
    setFeedbackContent('');
    setRating(0);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
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
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="w-full bg-[#242424] border border-[#333333] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A00] appearance-none"
                >
                  <option value="">-- Chọn loại phản hồi --</option>
                  <option value="service">Chất lượng dịch vụ</option>
                  <option value="equipment">Thiết bị & Cơ sở vật chất</option>
                  <option value="staff">Nhân viên / Huấn luyện viên</option>
                  <option value="package">Gói tập & Thanh toán</option>
                  <option value="other">Khác</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A0A0] pointer-events-none" />
              </div>
            </div>

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
            {ticketHistory.map((ticket) => {
              const Icon = StatusIcon[ticket.status];
              const isExpanded = expandedTicket === ticket.id;
              return (
                <div key={ticket.id} className="bg-[#242424] border border-[#333333] rounded-xl overflow-hidden">
                  <button
                    className="w-full p-4 text-left flex items-start gap-3"
                    onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                  >
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 flex-shrink-0 ${statusColor[ticket.status]}`}>
                      <Icon className="w-3 h-3" />
                      {statusLabel[ticket.status]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm truncate">{ticket.title}</p>
                      <p className="text-[#A0A0A0] text-xs mt-0.5">{ticket.id} · {ticket.date}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-[#A0A0A0] flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  {isExpanded && ticket.reply && (
                    <div className="px-4 pb-4 border-t border-[#333333]">
                      <p className="text-[#A0A0A0] text-xs uppercase font-bold mt-3 mb-1.5">Phản hồi từ GymPro:</p>
                      <div className="bg-[#FF5A00]/10 border border-[#FF5A00]/20 rounded-xl p-3">
                        <p className="text-[#FFB08A] text-sm">{ticket.reply}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
