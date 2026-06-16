"use client";
import { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader2, Award, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export function PTFeedbackPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRatings = async (ptId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('http://localhost:3001/trainers/ratings/all', { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách đánh giá');

      const data = await res.json();
      const myRatings = data.filter((r: any) => r.ptId === ptId);
      
      // Sort ratings by date descending
      myRatings.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setRatings(myRatings);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
      toast.error('Không thể tải danh sách đánh giá');
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
          fetchRatings(user.id);
        }
      }
    }
  }, []);

  // Compute stats
  const totalReviews = ratings.length;
  const averageRating = totalReviews > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 5.0;

  // Breakdown counts
  const starCounts = [0, 0, 0, 0, 0]; // 1 to 5 stars
  ratings.forEach(r => {
    const starIdx = Math.min(Math.max(Math.round(r.rating), 1), 5) - 1;
    starCounts[starIdx]++;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Đang tải nhận xét và đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Stats Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Đánh giá & Nhận xét của tôi</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Average Rating Block */}
          <div className="text-center md:border-r border-slate-200 py-4">
            <h3 className="text-5xl font-black text-slate-900 mb-2">{averageRating.toFixed(1)}</h3>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(averageRating) ? 'fill-orange-400 text-orange-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 font-medium">{totalReviews} lượt đánh giá</p>
          </div>

          {/* Progress Bars Block */}
          <div className="col-span-2 space-y-2 px-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars - 1];
              const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="w-12 text-slate-600 font-bold text-right flex items-center gap-1 justify-end">
                    {stars} <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400 inline" />
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-slate-500 text-right font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          Chi tiết nhận xét từ hội viên
        </h3>

        {ratings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-lg">
            <Award className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-sm">Bạn chưa nhận được đánh giá nào.</p>
            <p className="text-xs mt-1 text-slate-400">Hãy tiếp tục kèm cặp hội viên thật tốt để nhận những đánh giá đầu tiên!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {ratings.map((rating: any, index: number) => {
              const dateObj = new Date(rating.createdAt);
              const formattedDate = dateObj.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
              });

              return (
                <div key={rating.id || index} className="py-5 first:pt-0 last:pb-0 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {rating.user?.fullName || 'Hội viên ẩn danh'}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rating.rating ? 'fill-orange-400 text-orange-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                    {rating.comment || <span className="italic text-slate-400">Không có lời nhận xét</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
