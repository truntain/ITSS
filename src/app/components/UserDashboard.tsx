import { useState } from 'react';
import { Calendar, TrendingUp, Award, MapPin, User as UserIcon, Clock, Flame, Heart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckInModal } from './CheckInModal';

interface UserDashboardProps {
  onMenuClick: (menu: string) => void;
}

export function UserDashboard({ onMenuClick }: UserDashboardProps) {
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedDay, setSelectedDay] = useState(2); // Index of active day (Wednesday = 2)
  const weekDays = [
    { day: 'T2', date: '15', active: false },
    { day: 'T3', date: '16', active: false },
    { day: 'T4', date: '17', active: true },
    { day: 'T5', date: '18', active: false },
    { day: 'T6', date: '19', active: false },
    { day: 'T7', date: '20', active: false },
    { day: 'CN', date: '21', active: false },
  ];

  const weekSchedule = [
    {
      time: '17:30 - 18:30',
      class: 'STRENGTH CONDITIONING',
      room: 'Khu Tạ A',
      trainer: 'PT Lê Minh Trọng',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop',
      emoji: '💪',
      status: 'upcoming',
    },
    {
      time: '19:00 - 20:00',
      class: 'HIIT CARDIO BLAST',
      room: 'Studio B',
      trainer: 'Coach Nguyễn An',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
      emoji: '🔥',
      status: 'upcoming',
    },
    {
      time: '08:00 - 09:00',
      class: 'YOGA RECOVERY',
      room: 'Phòng Yoga',
      trainer: 'Instructor Mai',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
      emoji: '🧘',
      status: 'scheduled',
    },
  ];

  const bodyMetrics = [
    { month: 'T1', weight: 78, bodyFat: 18 },
    { month: 'T2', weight: 76, bodyFat: 17 },
    { month: 'T3', weight: 75, bodyFat: 16 },
    { month: 'T4', weight: 73, bodyFat: 15 },
    { month: 'T5', weight: 72, bodyFat: 14.5 },
    { month: 'T6', weight: 70, bodyFat: 14 },
  ];

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
          <h1 className="text-7xl font-black text-white mb-4 tracking-tight drop-shadow-2xl">
            XIN CHÀO, TRƯƠNG THẾ THÀNH!
          </h1>
          <p className="text-2xl text-[#A0A0A0] font-medium">Đã đến lúc phá vỡ giới hạn của bạn.</p>
        </div>
      </div>

      {/* Container for overlapping content */}
      <div className="max-w-[1440px] mx-auto px-8">
        {/* KPI Cards - Overlapping Hero */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-20 mb-12 relative z-20">
          {/* Membership Card */}
          <button
            onClick={() => onMenuClick('membership')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left"
          >
            <div className="absolute top-0 right-0 text-9xl opacity-5">🏋️</div>
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Gói hiện tại</p>
              <h3 className="text-xl font-black text-white mb-1">PREMIUM</h3>
              <p className="text-[#FF5A00] text-2xl font-black">12 THÁNG</p>
            </div>
          </button>

          {/* Days Left Card */}
          <button
            onClick={() => onMenuClick('membership')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left"
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{
                background: 'radial-gradient(circle at top right, #FF5A00 0%, transparent 70%)',
              }}
            ></div>
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Thời hạn</p>
              <h3 className="text-4xl font-black text-[#FF5A00]">185</h3>
              <p className="text-[#A0A0A0] text-sm">Ngày còn lại</p>
            </div>
          </button>

          {/* PT Sessions Card */}
          <button
            onClick={() => onMenuClick('schedule')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left"
          >
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Buổi PT</p>
              <h3 className="text-4xl font-black text-white mb-2">12/20</h3>

              {/* Progress Bar */}
              <div className="relative h-2 bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FF5A00] to-[#FF8C00] rounded-full shadow-[0_0_10px_rgba(255,90,0,0.5)]"
                  style={{ width: '60%' }}
                ></div>
              </div>
            </div>
          </button>

          {/* Body Metrics Card */}
          <button
            onClick={() => onMenuClick('tracker')}
            className="relative overflow-hidden bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-2xl p-6 hover:scale-105 transition-transform cursor-pointer text-left"
          >
            <div className="relative z-10">
              <p className="text-[#A0A0A0] text-xs font-bold uppercase tracking-wider mb-2">Chỉ số</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-black text-white">70</h3>
                <span className="text-[#A0A0A0] text-sm">kg</span>
              </div>
              <p className="text-[#FF5A00] text-sm font-bold">14% Body Fat</p>
            </div>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Weekly Schedule - 60% width (3 columns) */}
          <div className="lg:col-span-3 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Flame className="w-8 h-8 text-[#FF5A00]" />
              LỊCH TẬP TUẦN NÀY
            </h2>

            {/* Day Selector */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {weekDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-20 h-20 font-bold transition-all ${
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
              {weekSchedule.map((session, index) => (
                <div
                  key={index}
                  onClick={() => onMenuClick('schedule')}
                  className="relative overflow-hidden bg-[#242424] border border-[#333333] hover:border-[#FF5A00] transition-all group shadow-xl cursor-pointer"
                >
                  <div className="flex items-stretch">
                    {/* Image Thumbnail */}
                    <div
                      className="w-48 bg-cover bg-center relative flex-shrink-0"
                      style={{ backgroundImage: `url(${session.image})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#242424]/90"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl drop-shadow-2xl">{session.emoji}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-black text-[#FF5A00] mb-3 uppercase tracking-tight">
                          {session.class}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-[#A0A0A0] text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-bold">{session.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{session.room}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span>{session.trainer}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session.class);
                          setShowCheckInModal(true);
                        }}
                        className="mt-4 self-end px-8 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase text-sm shadow-lg group-hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
                      >
                        CHECK-IN
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Body Metrics - 40% width (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <Heart className="w-8 h-8 text-[#FF5A00]" />
              CHỈ SỐ CƠ THỂ
            </h2>

            {/* Current Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onMenuClick('tracker')}
                className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-5 hover:scale-105 transition-transform cursor-pointer text-left"
              >
                <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Cân nặng</p>
                <p className="text-5xl font-black text-white">70</p>
                <p className="text-[#A0A0A0] text-sm">kg</p>
              </button>
              <button
                onClick={() => onMenuClick('tracker')}
                className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-5 hover:scale-105 transition-transform cursor-pointer text-left"
              >
                <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Body Fat</p>
                <p className="text-5xl font-black text-[#FF5A00]">14</p>
                <p className="text-[#A0A0A0] text-sm">%</p>
              </button>
            </div>

            {/* Chart */}
            <button
              onClick={() => onMenuClick('tracker')}
              className="bg-[#242424] border border-[#333333] shadow-xl p-6 hover:border-[#FF5A00] transition-all cursor-pointer text-left w-full"
            >
              <h3 className="text-lg font-black text-white mb-4 uppercase">Tiến triển 6 tháng</h3>
              <div className="h-64">
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
              </div>
            </button>

            {/* Progress Note */}
            <button
              onClick={() => onMenuClick('tracker')}
              className="bg-gradient-to-r from-[#FF5A00]/10 to-[#242424] border border-[#FF5A00]/30 p-6 shadow-xl hover:border-[#FF5A00] transition-all cursor-pointer text-left w-full"
            >
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6 text-[#FF5A00]" />
                <span className="text-xl text-white font-black uppercase">Tiến triển tốt!</span>
              </div>
              <p className="text-[#A0A0A0]">
                Bạn đã giảm <span className="text-[#FF5A00] font-black">8kg</span> trong 6 tháng. Tiếp tục phấn
                đấu!
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
      />
    </div>
  );
}
