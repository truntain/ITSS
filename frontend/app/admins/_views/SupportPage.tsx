"use client";

import { Star, Send, Paperclip, X, Filter, MessageCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface Feedback {
  id: string;
  customerName: string;
  avatar: string;
  rating: number;
  message: string;
  date: string;
  status: 'unprocessed' | 'priority' | 'resolved';
  replies?: { from: 'customer' | 'admin'; message: string; time: string }[];
}

const feedbacks: Feedback[] = [
  {
    id: 'FB001',
    customerName: 'Nguyễn Văn An',
    avatar: 'NA',
    rating: 5,
    message: 'Phòng tập rất sạch sẽ, thoáng mát. Nhân viên nhiệt tình!',
    date: '13/05/2026 14:30',
    status: 'unprocessed'
  },
  {
    id: 'FB002',
    customerName: 'Trần Thị Bình',
    avatar: 'TB',
    rating: 4,
    message: 'Máy chạy bộ số 3 bị rung lắc. Mong phòng tập kiểm tra lại.',
    date: '12/05/2026 18:15',
    status: 'priority',
    replies: [
      { from: 'customer', message: 'Máy chạy bộ số 3 bị rung lắc. Mong phòng tập kiểm tra lại.', time: '18:15' },
      { from: 'admin', message: 'Cảm ơn bạn đã phản hồi! Chúng tôi sẽ kiểm tra và sửa chữa ngay.', time: '18:30' }
    ]
  },
  {
    id: 'FB003',
    customerName: 'Lê Minh Cường',
    avatar: 'LC',
    rating: 5,
    message: 'Huấn luyện viên PT rất chuyên nghiệp và tận tình!',
    date: '11/05/2026 20:00',
    status: 'resolved',
    replies: [
      { from: 'customer', message: 'Huấn luyện viên PT rất chuyên nghiệp và tận tình!', time: '20:00' },
      { from: 'admin', message: 'Cảm ơn anh đã tin tưởng GymPro. Chúc anh tập luyện hiệu quả!', time: '20:15' }
    ]
  },
  {
    id: 'FB004',
    customerName: 'Phạm Thu Dung',
    avatar: 'PD',
    rating: 3,
    message: 'Phòng thay đồ hơi chật vào giờ cao điểm.',
    date: '10/05/2026 19:45',
    status: 'unprocessed'
  },
  {
    id: 'FB005',
    customerName: 'Hoàng Văn Em',
    avatar: 'HE',
    rating: 2,
    message: 'Điều hòa không mát lắm, trời nóng tập rất khó chịu.',
    date: '09/05/2026 17:30',
    status: 'priority'
  },
  {
    id: 'FB006',
    customerName: 'Vũ Thị Phương',
    avatar: 'VP',
    rating: 5,
    message: 'Không gian đẹp, âm nhạc hay. Rất thích!',
    date: '08/05/2026 21:00',
    status: 'resolved'
  },
];

export function SupportPage() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [feedbackStatuses, setFeedbackStatuses] = useState<Record<string, 'unprocessed' | 'priority' | 'resolved'>>(
    feedbacks.reduce((acc, fb) => ({ ...acc, [fb.id]: fb.status }), {})
  );
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);

  const filteredFeedbacks = feedbacks.map(fb => ({
    ...fb,
    status: feedbackStatuses[fb.id]
  })).filter(f => {
    if (ratingFilter === 'all') return true;
    return f.rating === ratingFilter;
  });

  const unprocessedFeedbacks = filteredFeedbacks.filter(f => f.status === 'unprocessed' || f.status === 'priority');
  const resolvedFeedbacks = filteredFeedbacks.filter(f => f.status === 'resolved');

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-[#FBBF24] text-[#FBBF24]'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const updateFeedbackStatus = (feedbackId: string, newStatus: 'unprocessed' | 'priority' | 'resolved') => {
    setFeedbackStatuses(prev => ({
      ...prev,
      [feedbackId]: newStatus
    }));
    setStatusDropdownOpen(null);
  };

  const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
    const currentStatus = feedbackStatuses[feedback.id];
    const isDropdownOpen = statusDropdownOpen === feedback.id;

    return (
      <div className="p-4 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {feedback.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-[var(--foreground)] truncate">{feedback.customerName}</p>
              {renderStars(feedback.rating)}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{feedback.date}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--foreground)] line-clamp-3 mb-3">{feedback.message}</p>

        {/* Status Tags with Dropdown */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(isDropdownOpen ? null : feedback.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                currentStatus === 'resolved'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {currentStatus === 'resolved' ? 'Đã xử lý' : 'Chưa xử lý'}
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setStatusDropdownOpen(null)}
                ></div>
                <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-[var(--border)] rounded-lg shadow-lg z-20 overflow-hidden">
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'unprocessed')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Chưa xử lý
                  </button>
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'priority')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Ưu tiên xử lý
                  </button>
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'resolved')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Đã xử lý
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Priority Tag (only shown when status is priority) */}
          {currentStatus === 'priority' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              Ưu tiên xử lý
            </span>
          )}
        </div>

        {/* Comment Button */}
        <button
          onClick={() => setSelectedFeedback(feedback)}
          className="flex items-center gap-2 text-sm text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Trả lời
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Chăm sóc khách hàng</h2>
          <p className="text-[var(--muted-foreground)]">Quản lý phản hồi và đánh giá từ hội viên</p>
        </div>

        {/* Rating Filter */}
        <div className="relative">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] appearance-none cursor-pointer"
          >
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 Sao (Rất tốt)</option>
            <option value="4">4 Sao (Tốt)</option>
            <option value="3">3 Sao (Bình thường)</option>
            <option value="2">2 Sao (Tệ)</option>
            <option value="1">1 Sao (Rất tệ)</option>
          </select>
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)] pointer-events-none" />
        </div>
      </div>

      {/* Kanban Board - 2 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Unprocessed (includes unprocessed and priority) */}
        <div className="space-y-4">
          <div className="bg-slate-100 rounded-lg p-3 border-2 border-slate-200">
            <h3 className="font-bold text-slate-900 flex items-center justify-between">
              <span>Chưa xử lý</span>
              <span className="bg-slate-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unprocessedFeedbacks.length}
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {unprocessedFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
            {unprocessedFeedbacks.length === 0 && (
              <p className="text-center text-[var(--muted-foreground)] py-8">Không có phản hồi nào</p>
            )}
          </div>
        </div>

        {/* Column 2: Resolved */}
        <div className="space-y-4">
          <div className="bg-emerald-100 rounded-lg p-3 border-2 border-emerald-200">
            <h3 className="font-bold text-emerald-900 flex items-center justify-between">
              <span>Đã xử lý</span>
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {resolvedFeedbacks.length}
              </span>
            </h3>
          </div>
          <div className="space-y-3">
            {resolvedFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
            {resolvedFeedbacks.length === 0 && (
              <p className="text-center text-[var(--muted-foreground)] py-8">Không có phản hồi nào</p>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {selectedFeedback && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSelectedFeedback(null)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm">
                    {selectedFeedback.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{selectedFeedback.customerName}</p>
                    <div className="flex items-center gap-2">
                      {renderStars(selectedFeedback.rating)}
                      <span className="text-xs text-[var(--muted-foreground)]">{selectedFeedback.date}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '400px' }}>
                {selectedFeedback.replies && selectedFeedback.replies.length > 0 ? (
                  selectedFeedback.replies.map((reply, index) => (
                    <div
                      key={index}
                      className={`flex ${reply.from === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          reply.from === 'admin'
                            ? 'bg-orange-100 text-[var(--foreground)] rounded-br-none'
                            : 'bg-gray-200 text-[var(--foreground)] rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{reply.message}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">{reply.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-start">
                    <div className="max-w-[70%] bg-gray-200 text-[var(--foreground)] rounded-2xl rounded-bl-none px-4 py-3">
                      <p className="text-sm">{selectedFeedback.message}</p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        {selectedFeedback.date.split(' ')[1]}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Input */}
              <div className="p-4 border-t border-[var(--border)]">
                <div className="flex items-end gap-2">
                  <button className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-[var(--muted-foreground)]" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Nhập tin nhắn phản hồi..."
                      rows={3}
                      disabled={feedbackStatuses[selectedFeedback.id] === 'resolved'}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    disabled={feedbackStatuses[selectedFeedback.id] === 'resolved'}
                    className="p-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
