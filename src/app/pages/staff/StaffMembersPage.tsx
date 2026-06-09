import { useState } from 'react';
import { Search, User, Phone, Calendar, Package, Clock, ChevronRight, X, CheckCircle, AlertCircle } from 'lucide-react';

interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob: string;
  joinDate: string;
  package: string;
  packageExpiry: string;
  status: 'active' | 'expired' | 'suspended';
  ptSessions: number;
  totalCheckins: number;
  lastCheckin: string;
}

const MEMBERS: Member[] = [
  {
    id: 'HV001', name: 'Nguyễn Thị Bích', phone: '0901234567', email: 'bich.nguyen@email.com',
    gender: 'Nữ', dob: '15/03/1995', joinDate: '01/01/2024',
    package: 'Gói Premium 12 tháng', packageExpiry: '01/01/2025',
    status: 'active', ptSessions: 12, totalCheckins: 48, lastCheckin: '08/06/2024',
  },
  {
    id: 'HV002', name: 'Trần Minh Khoa', phone: '0912345678', email: 'khoa.tran@email.com',
    gender: 'Nam', dob: '22/07/1990', joinDate: '15/03/2024',
    package: 'Gói Standard 3 tháng', packageExpiry: '15/06/2024',
    status: 'expired', ptSessions: 0, totalCheckins: 22, lastCheckin: '01/06/2024',
  },
  {
    id: 'HV003', name: 'Lê Thanh Hương', phone: '0923456789', email: 'huong.le@email.com',
    gender: 'Nữ', dob: '08/11/1998', joinDate: '10/04/2024',
    package: 'PT 1-1 (20 buổi)', packageExpiry: '10/07/2024',
    status: 'active', ptSessions: 20, totalCheckins: 15, lastCheckin: '08/06/2024',
  },
  {
    id: 'HV004', name: 'Phạm Đức Long', phone: '0934567890', email: 'long.pham@email.com',
    gender: 'Nam', dob: '30/05/1987', joinDate: '01/05/2024',
    package: 'Gói VIP 6 tháng', packageExpiry: '01/11/2024',
    status: 'active', ptSessions: 8, totalCheckins: 30, lastCheckin: '07/06/2024',
  },
  {
    id: 'HV005', name: 'Võ Thu Ngân', phone: '0945678901', email: 'ngan.vo@email.com',
    gender: 'Nữ', dob: '12/09/2000', joinDate: '20/02/2024',
    package: 'Gói Standard 3 tháng', packageExpiry: '20/05/2024',
    status: 'suspended', ptSessions: 0, totalCheckins: 8, lastCheckin: '15/05/2024',
  },
];

const historyData: Record<string, { date: string; action: string; detail: string }[]> = {
  HV001: [
    { date: '08/06/2024', action: 'Check-in', detail: '07:32 – Buổi tập sáng' },
    { date: '05/06/2024', action: 'Check-in', detail: '18:10 – Buổi tập chiều' },
    { date: '01/06/2024', action: 'Gia hạn gói', detail: 'Gói Premium 12 tháng – 4.800.000đ' },
    { date: '03/06/2024', action: 'PT Session', detail: 'Buổi PT #12 với Minh Anh' },
    { date: '28/05/2024', action: 'Check-in', detail: '09:00 – Buổi tập sáng' },
  ],
  HV002: [
    { date: '01/06/2024', action: 'Check-in', detail: '17:45 – Buổi tập chiều' },
    { date: '15/03/2024', action: 'Đăng ký gói', detail: 'Gói Standard 3 tháng – 1.350.000đ' },
  ],
  HV003: [
    { date: '08/06/2024', action: 'PT Session', detail: 'Buổi PT #15 với Minh Anh' },
    { date: '06/06/2024', action: 'Check-in', detail: '08:00 – Buổi tập sáng' },
  ],
  HV004: [
    { date: '07/06/2024', action: 'Check-in', detail: '06:30 – Buổi tập sáng' },
    { date: '05/06/2024', action: 'PT Session', detail: 'Buổi PT #8 với Văn Hùng' },
    { date: '01/05/2024', action: 'Đăng ký gói', detail: 'Gói VIP 6 tháng – 3.200.000đ' },
  ],
  HV005: [
    { date: '15/05/2024', action: 'Check-in', detail: '10:00 – Buổi tập' },
    { date: '20/02/2024', action: 'Đăng ký gói', detail: 'Gói Standard 3 tháng – 1.350.000đ' },
  ],
};

const statusStyle: Record<Member['status'], string> = {
  active: 'bg-green-500/15 text-green-400 border-green-500/20',
  expired: 'bg-red-500/15 text-red-400 border-red-500/20',
  suspended: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
};
const statusLabel: Record<Member['status'], string> = {
  active: 'Đang hoạt động',
  expired: 'Hết hạn',
  suspended: 'Tạm ngừng',
};

export function StaffMembersPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Member['status']>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filtered = MEMBERS.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* Left: Member List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Tên, SĐT, mã hội viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        {/* Status filter */}
        <div className="flex gap-1.5">
          {(['all', 'active', 'expired', 'suspended'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === s
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {s === 'all' ? 'Tất cả' : s === 'active' ? 'Hoạt động' : s === 'expired' ? 'Hết hạn' : 'Tạm ngừng'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMember(m)}
              className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                selectedMember?.id === m.id
                  ? 'bg-[var(--sidebar-accent)] border-[var(--primary)]'
                  : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)]/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">
                    {m.name.split(' ').slice(-1)[0][0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--foreground)] font-bold text-sm truncate">{m.name}</p>
                  <p className="text-[var(--muted-foreground)] text-xs">{m.id} · {m.phone}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-lg border text-xs font-bold flex-shrink-0 ${statusStyle[m.status]}`}>
                  {m.status === 'active' ? '●' : m.status === 'expired' ? '×' : '⚠'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Member Detail */}
      <div className="flex-1 overflow-y-auto">
        {!selectedMember ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <User className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
              <p className="text-[var(--muted-foreground)] text-sm">Chọn hội viên để xem chi tiết</p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Profile Card */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--primary)] to-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <span className="text-white font-black text-xl">
                    {selectedMember.name.split(' ').slice(-1)[0][0]}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-[var(--foreground)] font-black text-xl">{selectedMember.name}</h2>
                    <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${statusStyle[selectedMember.status]}`}>
                      {statusLabel[selectedMember.status]}
                    </span>
                  </div>
                  <p className="text-[var(--muted-foreground)] text-sm mt-0.5">{selectedMember.id}</p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors text-[var(--muted-foreground)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: Phone, label: 'Điện thoại', value: selectedMember.phone },
                  { icon: User, label: 'Giới tính / Ngày sinh', value: `${selectedMember.gender} · ${selectedMember.dob}` },
                  { icon: Calendar, label: 'Ngày gia nhập', value: selectedMember.joinDate },
                  { icon: Clock, label: 'Check-in gần nhất', value: selectedMember.lastCheckin },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="bg-[var(--secondary)] rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4 text-[var(--primary)]" />
                        <span className="text-[var(--muted-foreground)] text-xs">{item.label}</span>
                      </div>
                      <p className="text-[var(--foreground)] font-bold text-sm">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Package Info */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-[var(--foreground)] font-bold text-base mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--primary)]" />
                Thông tin gói tập
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[var(--secondary)] rounded-xl p-4">
                  <p className="text-[var(--muted-foreground)] text-xs mb-1">Gói hiện tại</p>
                  <p className="text-[var(--foreground)] font-black text-sm">{selectedMember.package}</p>
                </div>
                <div className="bg-[var(--secondary)] rounded-xl p-4">
                  <p className="text-[var(--muted-foreground)] text-xs mb-1">Ngày hết hạn</p>
                  <p className={`font-black text-sm ${selectedMember.status === 'expired' ? 'text-red-500' : 'text-[var(--foreground)]'}`}>
                    {selectedMember.packageExpiry}
                  </p>
                </div>
                <div className="bg-[var(--secondary)] rounded-xl p-4">
                  <p className="text-[var(--muted-foreground)] text-xs mb-1">Buổi PT còn lại</p>
                  <p className="text-[var(--foreground)] font-black text-sm">{selectedMember.ptSessions} buổi</p>
                </div>
              </div>

              <div className="mt-3 flex gap-3">
                <div className="flex-1 bg-[var(--secondary)] rounded-xl p-4">
                  <p className="text-[var(--muted-foreground)] text-xs mb-1">Tổng check-in</p>
                  <p className="text-[var(--primary)] font-black text-xl">{selectedMember.totalCheckins}</p>
                </div>
                <div className="flex-1 flex items-center justify-center gap-2 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl p-4">
                  {selectedMember.status === 'active' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-bold text-sm ${selectedMember.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedMember.status === 'active' ? 'Gói đang hiệu lực' : 'Gói đã hết hạn'}
                  </span>
                </div>
              </div>
            </div>

            {/* Service History */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-[var(--foreground)] font-bold text-base mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Lịch sử sử dụng dịch vụ
              </h3>
              <div className="space-y-2">
                {(historyData[selectedMember.id] || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-[var(--secondary)] transition-colors">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0" />
                    <span className="text-[var(--muted-foreground)] text-xs w-24 flex-shrink-0">{item.date}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${
                      item.action === 'Check-in' ? 'bg-blue-500/15 text-blue-400' :
                      item.action === 'PT Session' ? 'bg-[var(--primary)]/15 text-[var(--primary)]' :
                      'bg-green-500/15 text-green-400'
                    }`}>
                      {item.action}
                    </span>
                    <span className="text-[var(--foreground)] text-sm flex-1">{item.detail}</span>
                    <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
