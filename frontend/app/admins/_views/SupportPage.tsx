"use client";

import { Star, Send, Paperclip, X, Filter, MessageCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface Feedback {
  id: number;
  userId: number;
  content: string;
  replyContent?: string;
  replierId?: number;
  status: 'pending' | 'responded';
  createdAt: string;
  repliedAt?: string;
  user?: {
    id: number;
    fullName: string;
    email: string;
  };
  replier?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export function SupportPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<number | null>(null);

  const API_BASE = 'http://localhost:3001';
  const getToken = () => localStorage.getItem('token') || '';

  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  };

  const fetchFeedbacks = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/feedbacks`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách phản hồi');
      const data = await res.json();
      setFeedbacks(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi kết nối máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // Lọc theo rating (mặc định tất cả đều là 5 sao vì DB không lưu cột rating)
  const filteredFeedbacks = feedbacks.filter(() => {
    if (ratingFilter === 'all') return true;
    return 5 === ratingFilter;
  });

  const unprocessedFeedbacks = filteredFeedbacks.filter(f => f.status === 'pending');
  const resolvedFeedbacks = filteredFeedbacks.filter(f => f.status === 'responded');

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

  const updateFeedbackStatus = async (feedbackId: number, newStatus: 'pending' | 'responded') => {
    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'pending') {
        payload.replyContent = null;
        payload.replierId = null;
        payload.repliedAt = null;
      } else {
        payload.replierId = getCurrentUser()?.id || null;
      }

      const res = await fetch(`${API_BASE}/feedbacks/${feedbackId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Cập nhật trạng thái thất bại');
      }

      setStatusDropdownOpen(null);
      fetchFeedbacks();

      // Nếu feedback đang mở trong modal chat, cập nhật thông tin trong modal
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        const updatedRes = await fetch(`${API_BASE}/feedbacks/${feedbackId}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (updatedRes.ok) {
          const updatedData = await updatedRes.json();
          setSelectedFeedback(updatedData);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleSendReply = async () => {
    if (!selectedFeedback || !replyMessage.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/feedbacks/${selectedFeedback.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          replyContent: replyMessage.trim(),
          status: 'responded',
          replierId: getCurrentUser()?.id || null,
        }),
      });

      if (!res.ok) {
        throw new Error('Gửi phản hồi thất bại');
      }

      setReplyMessage('');
      fetchFeedbacks();

      // Cập nhật lại feedback đang mở trong modal chat
      const updatedRes = await fetch(`${API_BASE}/feedbacks/${selectedFeedback.id}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (updatedRes.ok) {
        const updatedData = await updatedRes.json();
        setSelectedFeedback(updatedData);
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'HV';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const FeedbackCard = ({ feedback }: { feedback: Feedback }) => {
    const isDropdownOpen = statusDropdownOpen === feedback.id;
    const name = feedback.user?.fullName || 'Hội viên';
    const initials = getInitials(name);
    const dateStr = formatDateTime(feedback.createdAt);

    return (
      <div className="p-4 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-sm hover:shadow-md transition-all">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center text-white font-medium text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-medium text-[var(--foreground)] truncate">{name}</p>
              {renderStars(5)} {/* Mặc định 5 sao */}
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">{dateStr}</p>
          </div>
        </div>
        <p className="text-sm text-[var(--foreground)] line-clamp-3 mb-3">{feedback.content}</p>

        {/* Status Tags with Dropdown */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setStatusDropdownOpen(isDropdownOpen ? null : feedback.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                feedback.status === 'responded'
                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {feedback.status === 'responded' ? 'Đã xử lý' : 'Chưa xử lý'}
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
                    onClick={() => updateFeedbackStatus(feedback.id, 'pending')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    Chưa xử lý
                  </button>
                  <button
                    onClick={() => updateFeedbackStatus(feedback.id, 'responded')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Đã xử lý
                  </button>
                </div>
              </>
            )}
          </div>
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 text-center py-12">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Không thể tải dữ liệu</h3>
        <p className="text-[var(--muted-foreground)] text-sm mb-6">{error}</p>
        <button
          onClick={fetchFeedbacks}
          className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors shadow-md"
        >
          Tải lại trang
        </button>
      </div>
    );
  }

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
        {/* Column 1: Unprocessed */}
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
                    {getInitials(selectedFeedback.user?.fullName || 'Hội viên')}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{selectedFeedback.user?.fullName || 'Hội viên'}</p>
                    <div className="flex items-center gap-2">
                      {renderStars(5)}
                      <span className="text-xs text-[var(--muted-foreground)]">{formatDateTime(selectedFeedback.createdAt)}</span>
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
                {/* Tin nhắn từ khách hàng */}
                <div className="flex justify-start">
                  <div className="max-w-[70%] bg-gray-200 text-[var(--foreground)] rounded-2xl rounded-bl-none px-4 py-3">
                    <p className="text-sm">{selectedFeedback.content}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-1">
                      {formatDateTime(selectedFeedback.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Tin nhắn trả lời từ Admin (nếu có) */}
                {selectedFeedback.replyContent && (
                  <div className="flex justify-end">
                    <div className="max-w-[70%] bg-orange-100 text-[var(--foreground)] rounded-2xl rounded-br-none px-4 py-3">
                      <p className="text-sm">{selectedFeedback.replyContent}</p>
                      <div className="flex items-center gap-1.5 mt-1 justify-end">
                        <span className="text-[10px] bg-orange-600 text-white px-1.5 py-0.5 rounded font-medium">
                          {selectedFeedback.replier?.fullName || 'Admin'}
                        </span>
                        <p className="text-[10px] text-[var(--muted-foreground)]">
                          {selectedFeedback.repliedAt ? formatDateTime(selectedFeedback.repliedAt) : ''}
                        </p>
                      </div>
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
                      disabled={selectedFeedback.status === 'responded'}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    onClick={handleSendReply}
                    disabled={selectedFeedback.status === 'responded' || !replyMessage.trim()}
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
