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
    fetch(`${'http://localhost:3001'}/checkins/my-status`, { headers })
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
    fetch(`${'http://localhost:3001'}/checkins/my-history`, { headers })
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
      <div className="max-w-[1800px] mx-auto px-8 py-16 flex items-center justify-center">
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
    <div className="max-w-[1800px] mx-auto px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#333333] pb-6">
        <h1 className="text-4xl font-black text-white mb-2 uppercase flex items-center gap-3">
          <QrCode className="w-9 h-9 text-[#FF5A00]" />
          Check-in Thẻ Hội Viên
        </h1>
        <p className="text-[#A0A0A0] text-base">
          Sử dụng mã QR điện tử hoặc vân tay tại quầy lễ tân để check-in ra vào phòng tập.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Digital Card */}
        <div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#333333] rounded-2xl overflow-hidden shadow-2xl">
            {/* Card Header */}
            <div className="relative p-8 bg-gradient-to-r from-[#FF5A00] to-[#FF8C00] overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-bold uppercase tracking-widest">Thẻ hội viên điện tử</p>
                  <h2 className="text-white text-3xl font-black mt-1 tracking-tight">GymPro Club</h2>
                </div>
                <Shield className="w-12 h-12 text-white/90" />
              </div>
              <div className="relative mt-8">
                <p className="text-white text-2xl font-black tracking-wide">{currentUser.fullName || 'Hội viên GymPro'}</p>
                <p className="text-white/90 text-base font-semibold mt-1 opacity-90">Mã số: HV-{currentUser.id}</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-8 flex flex-col items-center">
              <div className="bg-white border-4 border-[#FF5A00]/30 rounded-2xl p-4 w-64 h-64 shadow-[0_0_35px_rgba(255,90,0,0.2)] flex items-center justify-center overflow-hidden transition-transform hover:scale-105 duration-300">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&color=ff5a00&data=${encodeURIComponent(qrData)}`}
                  alt="GymPro Checkin QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="mt-6 text-[#A0A0A0] text-base text-center font-bold">
                Đưa mã QR này lại gần camera quét tại quầy lễ tân
              </p>

              {/* Member Info */}
              <div className="mt-8 w-full grid grid-cols-3 gap-4">
                <div className="bg-[#2A2A2A] rounded-xl p-4 text-center flex flex-col justify-center min-h-[90px] border border-[#333333]">
                  <p className="text-[#FF5A00] font-black text-base md:text-lg truncate">
                    {membershipInfo ? membershipInfo.packageName : 'Chưa đăng ký'}
                  </p>
                  <p className="text-[#A0A0A0] text-xs uppercase font-bold tracking-wider mt-1.5">Gói hiện tại</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl p-4 text-center flex flex-col justify-center min-h-[90px] border border-[#333333]">
                  <p className="text-white font-black text-2xl">
                    {membershipInfo ? membershipInfo.remainingDays : 0}
                  </p>
                  <p className="text-[#A0A0A0] text-xs uppercase font-bold tracking-wider mt-1.5">Ngày còn lại</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl p-4 text-center flex flex-col justify-center min-h-[90px] border border-[#333333]">
                  <p className="text-white font-black text-2xl">
                    {workoutCount}
                  </p>
                  <p className="text-[#A0A0A0] text-xs uppercase font-bold tracking-wider mt-1.5">Buổi đã tập</p>
                </div>
              </div>

              {/* Fingerprint */}
              <div className="mt-6 w-full bg-[#2A2A2A] border border-[#333333] rounded-xl p-5 flex items-center gap-5">
                <div className="w-14 h-14 bg-[#FF5A00]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#FF5A00]/20">
                  <Fingerprint className="w-7 h-7 text-[#FF5A00]" />
                </div>
                <div>
                  <p className="text-white font-black text-base">Xác thực bằng Vân tay</p>
                  <p className="text-[#A0A0A0] text-sm mt-0.5">Đặt ngón tay lên máy quét vân tay tại quầy lễ tân</p>
                </div>
                <div className="ml-auto w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info + History */}
        <div className="space-y-6">
          {/* Today Status */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#FF5A00]/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[#FF5A00]" />
              </div>
              <h3 className="text-white font-black text-xl">Trạng thái hôm nay</h3>
            </div>
            {statusLoading ? (
              <div className="py-4 text-center text-[#A0A0A0] text-base">Đang kiểm tra trạng thái...</div>
            ) : todayCheckin ? (
              <div className="flex items-center gap-5 p-5 bg-green-500/10 border-2 border-green-500/20 rounded-xl">
                <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <div>
                  <p className="text-green-400 font-black text-lg">Đã check-in thành công hôm nay</p>
                  <p className="text-[#A0A0A0] text-base mt-1">
                    Thời gian vào: <span className="text-white font-bold">{formatTime(todayCheckin.checkedInAt)}</span> · Phương thức: <span className="text-white font-bold">{todayCheckin.checkinMethod === 'QR_member' ? 'Quét mã QR' : 'Mã vân tay'}</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-5 p-5 bg-amber-500/10 border-2 border-amber-500/20 rounded-xl">
                <div className="w-14 h-14 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <p className="text-amber-400 font-black text-lg">Chưa check-in hôm nay</p>
                  <p className="text-[#A0A0A0] text-base mt-1">Vui lòng xuất trình thẻ QR hoặc quét vân tay tại quầy để ghi nhận check-in.</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
            <div className="flex gap-3 mb-6">
              {[
                { id: 'qr', label: 'Hướng dẫn Check-in', icon: QrCode },
                { id: 'history', label: 'Lịch sử check-in', icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'qr' | 'history')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-base font-black transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#FF5A00] text-white shadow-[0_0_20px_rgba(255,90,0,0.3)]'
                        : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'qr' ? (
              <div className="space-y-4">
                {[
                  { step: '1', title: 'Mở mã QR trên điện thoại', desc: 'Truy cập trang này và giữ độ sáng màn hình ở mức cao nhất' },
                  { step: '2', title: 'Quét tại camera ở quầy', desc: 'Đưa điện thoại vào trước camera/đầu đọc QR tại quầy lễ tân' },
                  { step: '3', title: 'Hệ thống xác nhận', desc: 'Màn hình hiển thị thông tin hội viên kèm tín hiệu âm thanh và ánh sáng xanh lá' },
                  { step: '4', title: 'Ghi nhận và tập luyện', desc: 'Hệ thống tự động ghi nhận lượt check-in và mở cổng vào phòng tập' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-4 rounded-xl hover:bg-[#242424] transition-colors border border-transparent hover:border-[#333333]">
                    <div className="w-10 h-10 bg-[#FF5A00] text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="font-black text-base">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-white font-black text-base">{item.title}</p>
                      <p className="text-[#A0A0A0] text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {historyLoading ? (
                  <div className="text-center py-8 text-[#A0A0A0] text-base">Đang tải lịch sử...</div>
                ) : history.length > 0 ? (
                  history.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between p-4 bg-[#242424] hover:bg-[#2A2A2A] border border-[#333333] rounded-xl transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/20">
                          <Calendar className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <p className="text-white text-base font-black">{formatDate(item.checkedInAt)}</p>
                          <p className="text-[#A0A0A0] text-sm mt-0.5">Vào tập lúc {formatTime(item.checkedInAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#FF5A00] text-base font-black">{getWorkoutDuration(idx)}</p>
                        <p className="text-green-400 text-xs font-bold mt-0.5">Hoàn thành</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-[#A0A0A0] text-base">
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
