"use client";

import { useState, useEffect } from 'react';
import { QrCode, Fingerprint, CheckCircle, Clock, Calendar, Shield } from 'lucide-react';

export function UserCheckinPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'history'>('qr');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);
  const [membershipInfo, setMembershipInfo] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [workoutCount, setWorkoutCount] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fetch status (today check-in status and active membership info)
    fetch('http://localhost:3001/checkins/my-status', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch status');
        return res.json();
      })
      .then(data => {
        setTodayCheckin(data.todayCheckin);
        setMembershipInfo(data.membership);
        setWorkoutCount(data.workoutCount);
        setStatusLoading(false);
      })
      .catch(err => {
        console.error('Error fetching checkin status:', err);
        setStatusLoading(false);
      });

    // Fetch checkin history
    fetch('http://localhost:3001/checkins/my-history', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch history');
        return res.json();
      })
      .then(data => {
        setHistory(data);
        setHistoryLoading(false);
      })
      .catch(err => {
        console.error('Error fetching checkin history:', err);
        setHistoryLoading(false);
      });
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin"></div>
      </div>
    );
  }

  const qrData = JSON.stringify({
    userId: currentUser.id,
    fullName: currentUser.fullName,
    role: currentUser.role,
    type: 'checkin'
  });

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[d.getDay()];
    const dateNum = String(d.getDate()).padStart(2, '0');
    const monthNum = String(d.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${dateNum}/${monthNum}`;
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toTimeString().slice(0, 5); // Returns HH:MM
  };

  const getWorkoutDuration = (idx: number) => {
    const durations = ['1h 45m', '2h 05m', '1h 30m', '1h 20m', '2h 00m'];
    return durations[idx % durations.length];
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Digital Card */}
        <div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#333333] rounded-2xl overflow-hidden shadow-2xl">
            {/* Card Header */}
            <div className="relative p-6 bg-gradient-to-r from-[#FF5A00] to-[#FF8C00] overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Thẻ hội viên</p>
                  <h2 className="text-white text-2xl font-black mt-1">GymPro</h2>
                </div>
                <Shield className="w-10 h-10 text-white/80" />
              </div>
              <div className="relative mt-4">
                <p className="text-white text-xl font-black">{currentUser.fullName || 'Hội viên GymPro'}</p>
                <p className="text-white/80 text-sm font-medium">ID: HV-{currentUser.id}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-white border-2 border-[#FF5A00]/30 rounded-xl p-3 w-56 h-56 shadow-[0_0_30px_rgba(255,90,0,0.15)] flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=ff5a00&data=${encodeURIComponent(qrData)}`}
                  alt="GymPro Checkin QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-4 text-[#A0A0A0] text-sm text-center">
                Xuất trình mã này tại quầy lễ tân để check-in
              </p>

              {/* Member Info */}
              <div className="mt-6 w-full grid grid-cols-3 gap-3">
                <div className="bg-[#2A2A2A] rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]">
                  <p className="text-[#FF5A00] font-black text-sm md:text-base truncate">
                    {membershipInfo ? membershipInfo.packageName : 'Chưa đăng ký'}
                  </p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Gói hiện tại</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]">
                  <p className="text-white font-black text-lg">
                    {membershipInfo ? membershipInfo.remainingDays : 0}
                  </p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Ngày còn lại</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl p-3 text-center flex flex-col justify-center min-h-[72px]">
                  <p className="text-white font-black text-lg">
                    {workoutCount}
                  </p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Buổi đã tập</p>
                </div>
              </div>

              {/* Fingerprint */}
              <div className="mt-5 w-full bg-[#2A2A2A] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FF5A00]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#FF5A00]/20">
                  <Fingerprint className="w-6 h-6 text-[#FF5A00]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Xác thực vân tay</p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Đặt ngón tay lên máy quét tại quầy</p>
                </div>
                <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info + History */}
        <div className="space-y-5">
          {/* Today Status */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#FF5A00]/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#FF5A00]" />
              </div>
              <h3 className="text-white font-bold text-lg">Trạng thái hôm nay</h3>
            </div>
            {statusLoading ? (
              <div className="py-4 text-center text-[#A0A0A0] text-sm">Đang kiểm tra trạng thái...</div>
            ) : todayCheckin ? (
              <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-green-400 font-black text-base">Đã check-in hôm nay</p>
                  <p className="text-[#A0A0A0] text-sm mt-0.5">
                    Vào lúc: {formatTime(todayCheckin.checkedInAt)} · Phương thức: {todayCheckin.checkinMethod === 'QR_member' ? 'Quét mã QR' : 'Mã vân tay'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-amber-400 font-black text-base">Chưa check-in hôm nay</p>
                  <p className="text-[#A0A0A0] text-sm mt-0.5">Vui lòng quét mã QR hoặc vân tay tại quầy lễ tân để ghi nhận giờ vào tập.</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
            <div className="flex gap-2 mb-5">
              {[
                { id: 'qr', label: 'Hướng dẫn sử dụng', icon: QrCode },
                { id: 'history', label: 'Lịch sử check-in', icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'qr' | 'history')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#FF5A00] text-white'
                        : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'qr' ? (
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Mở thẻ điện tử', desc: 'Truy cập trang này và đảm bảo màn hình đủ sáng' },
                  { step: '2', title: 'Quét mã QR', desc: 'Đưa điện thoại vào máy quét QR tại quầy lễ tân' },
                  { step: '3', title: 'Xác nhận thành công', desc: 'Màn hình máy quét hiện thông tin và đèn xanh bật' },
                  { step: '4', title: 'Bắt đầu tập', desc: 'Hệ thống tự động ghi nhận thời gian vào tập của bạn' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#242424] transition-colors">
                    <div className="w-8 h-8 bg-[#FF5A00] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-sm">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-[#A0A0A0] text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {historyLoading ? (
                  <div className="text-center py-6 text-[#A0A0A0] text-sm">Đang tải lịch sử...</div>
                ) : history.length > 0 ? (
                  history.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between p-3 bg-[#242424] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">{formatDate(item.checkedInAt)}</p>
                          <p className="text-[#A0A0A0] text-xs">Vào lúc {formatTime(item.checkedInAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#FF5A00] text-sm font-bold">{getWorkoutDuration(idx)}</p>
                        <p className="text-green-400 text-xs">Hoàn thành</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[#A0A0A0] text-sm">
                    Bạn chưa có lịch sử check-in nào trong hệ thống.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
