"use client";

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Award, MapPin, User as UserIcon, Clock, Flame, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckInModal } from '@/components/CheckInModal';

interface UserDashboardProps {
  onMenuClick: (menu: string) => void;
}

export function UserDashboard({ onMenuClick }: UserDashboardProps) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedDay, setSelectedDay] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [membershipInfo, setMembershipInfo] = useState<any>(null);
  const [bodyRecords, setBodyRecords] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekDays, setWeekDays] = useState<any[]>([]);
  const [selectedQrCode, setSelectedQrCode] = useState('');

  useEffect(() => {
    // Generate week days dynamically (Monday to Sunday)
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    // Monday offset
    const diff = todayDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const monday = new Date(todayDate);
    monday.setDate(diff);

    const days = [];
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    let todayIdx = 0;
    
    for (let i = 0; i < 7; i++) {
      const current = new Date(monday);
      current.setDate(monday.getDate() + i);
      const isToday = current.toDateString() === new Date().toDateString();
      if (isToday) todayIdx = i;
      
      days.push({
        day: dayNames[i],
        date: String(current.getDate()).padStart(2, '0'),
        fullDateStr: current.toISOString().split('T')[0],
        isToday,
      });
    }
    setWeekDays(days);
    setSelectedDay(todayIdx);

    // Get current user
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
  }, []);

  const fetchData = () => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. Fetch active membership / status
    const statusPromise = fetch('http://localhost:3001/checkins/my-status', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch status');
        return res.json();
      })
      .then(data => {
        setMembershipInfo(data.membership);
      })
      .catch(err => console.error('Error fetching dashboard status:', err));

    // 2. Fetch body records
    const bodyPromise = fetch('http://localhost:3001/body-records/my-records', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch body records');
        return res.json();
      })
      .then(data => {
        setBodyRecords(data);
      })
      .catch(err => console.error('Error fetching dashboard body records:', err));

    // 3. Fetch bookings
    const bookingsPromise = fetch('http://localhost:3001/bookings/my-bookings', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch bookings');
        return res.json();
      })
      .then(data => {
        setBookings(data);
      })
      .catch(err => console.error('Error fetching dashboard bookings:', err));

    Promise.all([statusPromise, bodyPromise, bookingsPromise]).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  // Calculations for stats
  const currentWeight = bodyRecords.length > 0 ? Number(bodyRecords[bodyRecords.length - 1].weight) : 0;
  const currentBodyFat = bodyRecords.length > 0 ? Number(bodyRecords[bodyRecords.length - 1].bodyFat) : 0;
  
  const totalWeightLoss = bodyRecords.length > 1 ? Number(bodyRecords[0].weight) - currentWeight : 0;
  const totalBodyFatLoss = bodyRecords.length > 1 ? Number(bodyRecords[0].bodyFat) - currentBodyFat : 0;

  // Small area chart data in sidebar
  const bodyMetrics = bodyRecords.map((r: any) => {
    const d = new Date(r.recordedDate);
    return {
      month: `T${d.getMonth() + 1}`,
      weight: Number(r.weight),
      bodyFat: Number(r.bodyFat),
    };
  });

  const totalPt = membershipInfo ? membershipInfo.totalSessions : 0;
  const remainingPt = membershipInfo ? membershipInfo.remainingSessions : 0;
  const usedPt = totalPt - remainingPt;
  const ptProgressPct = totalPt > 0 ? (usedPt / totalPt) * 100 : 0;

  // Filter bookings for current day
  const selectedDateStr = weekDays[selectedDay]?.fullDateStr;
  const filteredBookings = bookings.filter((b: any) => b.date === selectedDateStr && b.status !== 'cancelled');

  const getBookingImage = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes('yoga')) {
      return {
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
        emoji: '🧘'
      };
    }
    if (lower.includes('cardio') || lower.includes('hiit')) {
      return {
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
        emoji: '🔥'
      };
    }
    return {
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      emoji: '💪'
    };
  };

  if (loading || !currentUser) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-24 flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-10 h-10 border-4 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin mb-4"></div>
        <p className="text-[#A0A0A0]">Đang tải dữ liệu tổng quan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Width */}
      <div
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.8), rgba(255,90,0,0.3)), url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&h=600&fit=crop)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#121212]"></div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-8 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-2xl uppercase">
            XIN CHÀO, {currentUser.fullName || 'HỘI VIÊN'}!
          </h1>
          <p className="text-xl md:text-2xl text-[#A0A0A0] font-medium">Đã đến lúc phá vỡ giới hạn của bạn.</p>
        </div>
      </div>

      {/* Container for overlapping content */}
      <div className="max-w-[1440px] mx-auto px-8">
        {/* KPI Cards - Overlapping Hero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-20 mb-12 relative z-20">
          {/* Membership Card */}
          <button
            onClick={() => onMenuClick('membership')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left focus:outline-none"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-5">🏋️</div>
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Gói hiện tại</p>
              <h3 className="text-xl font-black text-white mb-1 uppercase truncate">
                {membershipInfo ? membershipInfo.packageName : 'CHƯA ĐĂNG KÝ'}
              </h3>
              <p className="text-[#FF5A00] text-lg font-black uppercase">GymPro Member</p>
            </div>
          </button>

          {/* Days Left Card */}
          <button
            onClick={() => onMenuClick('membership')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left focus:outline-none"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at top right, #FF5A00 0%, transparent 70%)',
              }}
            ></div>
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Thời hạn</p>
              <h3 className="text-4xl font-black text-[#FF5A00]">
                {membershipInfo ? membershipInfo.remainingDays : 0}
              </h3>
              <p className="text-[#A0A0A0] text-sm">Ngày còn lại</p>
            </div>
          </button>

          {/* PT Sessions Card */}
          <button
            onClick={() => onMenuClick('schedule')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left focus:outline-none"
          >
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Buổi PT</p>
              <h3 className="text-4xl font-black text-white mb-2">
                {totalPt > 0 ? `${usedPt}/${totalPt}` : '0/0'}
              </h3>

              {/* Progress Bar */}
              <div className="relative h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF5A00] to-[#FF8C00] rounded-full shadow-[0_0_10px_rgba(255,90,0,0.5)]"
                  style={{ width: `${ptProgressPct}%` }}
                ></div>
              </div>
            </div>
          </button>

          {/* Body Metrics Card */}
          <button
            onClick={() => onMenuClick('tracker')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left focus:outline-none"
          >
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Chỉ số</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white">
                  {currentWeight > 0 ? currentWeight.toFixed(1) : '--'}
                </h3>
                <span className="text-[#A0A0A0] text-sm">kg</span>
              </div>
              <p className="text-[#FF5A00] text-sm font-bold">
                {currentBodyFat > 0 ? `${currentBodyFat.toFixed(1)}% Body Fat` : 'Chưa có dữ liệu mỡ'}
              </p>
            </div>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Flame className="w-8 h-8 text-[#FF5A00]" />
              LỊCH TẬP TUẦN NÀY
            </h2>

            {/* Day Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 font-bold transition-all focus:outline-none cursor-pointer ${
                    selectedDay === index
                      ? 'bg-[#FF5A00] text-white shadow-[0_0_25px_rgba(255,90,0,0.5)]'
                      : 'bg-[#242424] border border-[#333333] text-[#A0A0A0] hover:border-[#FF5A00]'
                  }`}
                >
                  <span className="text-xs uppercase">{day.day}</span>
                  <span className="text-2xl font-black">{day.date}</span>
                </button>
              ))}
            </div>

            {/* Schedule Cards */}
            <div className="space-y-4">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((session, index) => {
                  const media = getBookingImage(session.type);
                  return (
                    <div
                      key={session.id || index}
                      onClick={() => onMenuClick('schedule')}
                      className="relative overflow-hidden bg-[#242424] border border-[#333333] hover:border-[#FF5A00] transition-all group shadow-xl cursor-pointer"
                    >
                      <div className="flex items-stretch flex-col md:flex-row">
                        {/* Image Thumbnail */}
                        <div
                          className="w-full md:w-48 h-32 md:h-auto bg-cover bg-center relative flex-shrink-0"
                          style={{ backgroundImage: `url(${media.image})` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#242424]/90"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl md:text-6xl drop-shadow-2xl">{media.emoji}</span>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 p-6 flex flex-col justify-between">
                          <div>
                            <h3 className="text-2xl font-black text-[#FF5A00] mb-3 uppercase tracking-tight">
                              {session.type}
                            </h3>
                            <div className="flex flex-wrap gap-4 text-[#A0A0A0] text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span className="font-bold">{session.timeSlot}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{session.room || 'Phòng tập chung'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4" />
                                <span>{session.pt ? `PT ${session.pt.fullName}` : 'Tập tự do'}</span>
                              </div>
                            </div>
                          </div>

                          {session.attendanceStatus === 'checked_in' ? (
                            <span className="mt-4 self-end px-8 py-3 bg-green-600/20 border border-green-600/30 text-green-400 font-black uppercase text-sm shadow-md cursor-default">
                              ĐÃ ĐIỂM DANH
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSession(session.type);
                                // Generate QR code JSON structure representing the electronic card check-in
                                if (currentUser) {
                                  const code = JSON.stringify({
                                    userId: currentUser.id,
                                    fullName: currentUser.fullName,
                                    role: currentUser.role,
                                    type: 'checkin'
                                  });
                                  setSelectedQrCode(code);
                                } else {
                                  setSelectedQrCode('');
                                }
                                setShowCheckInModal(true);
                              }}
                              className="mt-4 self-end px-8 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase text-sm shadow-lg group-hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
                            >
                              CHECK-IN
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-[#242424] border border-[#333333] p-12 text-center text-[#A0A0A0]">
                  <p className="text-lg font-bold">Không có ca trực hoặc buổi hẹn đặt trước nào trong ngày này</p>
                  <button
                    onClick={() => onMenuClick('schedule')}
                    className="mt-4 px-6 py-2 border border-[#FF5A00] text-[#FF5A00] font-bold hover:bg-[#FF5A00] hover:text-white transition-all uppercase text-sm"
                  >
                    Đặt lịch tập ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Body Metrics Progress */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#FF5A00]" />
              CHỈ SỐ TIẾN TRIỂN
            </h2>

            {/* Current Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onMenuClick('tracker')}
                className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-5 hover:scale-105 transition-transform cursor-pointer text-left focus:outline-none"
              >
                <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Cân nặng</p>
                <p className="text-4xl md:text-5xl font-black text-white">{currentWeight > 0 ? currentWeight.toFixed(1) : '--'}</p>
                <p className="text-[#A0A0A0] text-sm">kg</p>
              </button>
              <button
                onClick={() => onMenuClick('tracker')}
                className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-5 hover:scale-105 transition-transform cursor-pointer text-left focus:outline-none"
              >
                <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Body Fat</p>
                <p className="text-4xl md:text-5xl font-black text-[#FF5A00]">{currentBodyFat > 0 ? currentBodyFat.toFixed(1) : '--'}</p>
                <p className="text-[#A0A0A0] text-sm">%</p>
              </button>
            </div>

            {/* Chart */}
            <button
              onClick={() => onMenuClick('tracker')}
              className="bg-[#242424] border border-[#333333] shadow-xl p-6 hover:border-[#FF5A00] transition-all cursor-pointer text-left w-full focus:outline-none"
            >
              <h3 className="text-lg font-black text-white mb-4 uppercase">Tiến triển đo lường</h3>
              <div className="h-64 flex items-center justify-center">
                {bodyMetrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={bodyMetrics} id="user-body-chart">
                      <defs>
                        <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF5A00" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#FF5A00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid key="grid-user" strokeDasharray="3 3" stroke="#333333" />
                      <XAxis key="xaxis-user" dataKey="month" stroke="#A0A0A0" style={{ fontSize: '12px' }} />
                      <YAxis key="yaxis-user" stroke="#A0A0A0" style={{ fontSize: '12px' }} />
                      <Tooltip
                        key="tooltip-user"
                        contentStyle={{
                          backgroundColor: '#1A1A1A',
                          border: '1px solid #333333',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                        }}
                      />
                      <Area
                        key="area-weight"
                        type="monotone"
                        dataKey="weight"
                        stroke="#FF5A00"
                        strokeWidth={4}
                        fill="url(#colorWeight)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-[#A0A0A0] text-sm">
                    Chưa có lịch sử cân nặng
                  </div>
                )}
              </div>
            </button>

            {/* Progress Note */}
            <button
              onClick={() => onMenuClick('tracker')}
              className="bg-gradient-to-r from-[#FF5A00]/10 to-[#242424] border border-[#FF5A00]/30 p-6 shadow-xl hover:border-[#FF5A00] transition-all cursor-pointer text-left w-full focus:outline-none"
            >
              <div className="flex items-center gap-3 mb-3">
                {totalWeightLoss >= 0 ? (
                  <TrendingDown className="w-6 h-6 text-emerald-500" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-[#FF5A00]" />
                )}
                <span className="text-xl text-white font-black uppercase">
                  {totalWeightLoss >= 0 ? 'Tiến triển tốt!' : 'Đang tăng cân'}
                </span>
              </div>
              <p className="text-[#A0A0A0] text-sm">
                {totalWeightLoss >= 0 ? (
                  <>Bạn đã giảm được <span className="text-emerald-400 font-black">{totalWeightLoss.toFixed(1)}kg</span> kể từ mốc đo đầu tiên. Tiếp tục phấn đấu!</>
                ) : (
                  <>Bạn đã tăng <span className="text-[#FF5A00] font-black">{Math.abs(totalWeightLoss).toFixed(1)}kg</span> so với ban đầu. Hãy quản lý chặt calo nạp vào!</>
                )}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Check-in Modal */}
      <CheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        sessionName={selectedSession}
        qrCode={selectedQrCode}
      />
    </div>
  );
}
