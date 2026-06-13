"use client";

import { useState } from 'react';
import { QrCode, CheckCircle, XCircle, AlertTriangle, X, Send } from 'lucide-react';

type CheckinStatus = 'valid' | 'expired';

interface MemberResult {
  name: string;
  avatar: string;
  package: string;
  status: CheckinStatus;
  daysLeft?: number;
}

const DEMO_MEMBERS: Record<string, MemberResult> = {
  'HV001': { name: 'Nguyễn Thị Bích', avatar: 'NB', package: 'Gói Premium 12 tháng', status: 'valid', daysLeft: 120 },
  'HV002': { name: 'Trần Minh Khoa', avatar: 'TK', package: 'Gói Standard 3 tháng', status: 'expired' },
  'HV003': { name: 'Lê Thanh Hương', avatar: 'LH', package: 'PT 1-1 (20 buổi)', status: 'valid', daysLeft: 45 },
};

const EQUIPMENT_LIST = [
  { id: 'EQ001', name: 'Máy chạy bộ Impulse PT300', category: 'Cardio', location: 'Khu Cardio A' },
  { id: 'EQ002', name: 'Ghế tập ngực đa năng', category: 'Tạ & Sức mạnh', location: 'Khu Tạ B' },
  { id: 'EQ003', name: 'Xe đạp Spin Bike S500', category: 'Cardio', location: 'Khu Cardio A' },
  { id: 'EQ004', name: 'Máy kéo xô CrossFit', category: 'CrossFit', location: 'Khu CrossFit' },
  { id: 'EQ005', name: 'Tạ đơn Dumbbells Set', category: 'Tạ & Sức mạnh', location: 'Khu Tạ A' },
  { id: 'EQ006', name: 'Máy chèo thuyền Concept2', category: 'Cardio', location: 'Khu Cardio B' },
];

export function StaffCheckinPage() {
  const [query, setQuery] = useState('');
  const [member, setMember] = useState<MemberResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [equipment, setEquipment] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleSearch = () => {
    const key = query.trim().toUpperCase();
    setMember(DEMO_MEMBERS[key] ?? { name: 'Không tìm thấy hội viên', avatar: '?', package: '', status: 'expired' });
    setCheckedIn(false);
  };

  const handleCancel = () => { setMember(null); setQuery(''); setCheckedIn(false); };

  const handleSendReport = () => {
    setReportSent(true);
    setTimeout(() => { setShowModal(false); setReportSent(false); setEquipment(''); setIssueDesc(''); }, 1500);
  };

  const recentCheckins = [
    { name: 'Lê Thanh Hương', time: '11:42', valid: true },
    { name: 'Phan Minh Đức', time: '11:35', valid: true },
    { name: 'Võ Thu Ngân', time: '11:18', valid: true },
    { name: 'Đỗ Quốc Trung', time: '11:05', valid: false },
  ];

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Check-in */}
      <div className="space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">Check-in hội viên</h2>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Quét QR hoặc nhập mã hội viên... (HV001)"
              className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[var(--background)]"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Tìm
            </button>
          </div>

          {member && !checkedIn && (
            <div className={`rounded-lg border p-4 mb-3 ${member.status === 'valid' ? 'border-emerald-300 bg-emerald-50' : 'border-red-300 bg-red-50'}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${member.status === 'valid' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.package}</p>
                  {member.status === 'valid' ? (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 text-xs font-semibold">Hợp lệ – Còn {member.daysLeft} ngày</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1">
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span className="text-red-700 text-xs font-semibold">Gói tập đã hết hạn</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {member.status === 'valid' && (
                  <button onClick={() => setCheckedIn(true)} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Xác nhận Check-in
                  </button>
                )}
                {member.status === 'expired' && (
                  <button className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
                    Thông báo gia hạn
                  </button>
                )}
                <button onClick={handleCancel} className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {checkedIn && (
            <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-emerald-700 font-bold text-sm">Check-in thành công!</p>
              <p className="text-slate-500 text-xs mt-0.5">{member?.name} đã vào phòng tập</p>
              <button onClick={handleCancel} className="mt-3 px-4 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold rounded-lg transition-colors">
                Quét tiếp
              </button>
            </div>
          )}
        </div>

        {/* Recent */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">Check-in gần đây</h3>
          <div className="space-y-1">
            {recentCheckins.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-sm text-[var(--foreground)]">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--muted-foreground)]">{item.time}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                    {item.valid ? 'Hợp lệ' : 'Hết hạn'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Report */}
      <div className="space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">Báo cáo sự cố thiết bị</h2>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mb-4">Ghi nhận và gửi báo cáo thiết bị gặp sự cố đến Admin</p>
          <button
            onClick={() => setShowModal(true)}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            + Báo lỗi thiết bị
          </button>
        </div>

        {/* Stats */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">Thống kê check-in hôm nay</h3>
          <div className="space-y-3">
            {[
              { label: 'Ca sáng (06:00–14:00)', count: 47, max: 60, color: 'bg-orange-500' },
              { label: 'Ca chiều (14:00–22:00)', count: 0, max: 60, color: 'bg-blue-500' },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[var(--muted-foreground)]">{s.label}</span>
                  <span className="font-bold text-[var(--foreground)]">{s.count}</span>
                </div>
                <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${s.color}`} style={{ width: `${Math.min((s.count / s.max) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800">Báo lỗi thiết bị</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Tên thiết bị</label>
                <select
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">-- Chọn thiết bị --</option>
                  {EQUIPMENT_LIST.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.id} – {eq.name}</option>
                  ))}
                </select>
              </div>
              {equipment && (() => {
                const eq = EQUIPMENT_LIST.find(e => e.id === equipment);
                return eq ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Danh mục</p>
                      <p className="text-sm font-semibold text-slate-800">{eq.category}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Vị trí</p>
                      <p className="text-sm font-semibold text-slate-800">{eq.location}</p>
                    </div>
                  </div>
                ) : null;
              })()}
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">Mô tả lỗi</label>
                <textarea
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  rows={3}
                  placeholder="Mô tả chi tiết sự cố..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              {reportSent ? (
                <div className="flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-300 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold text-sm">Đã gửi cho Admin!</span>
                </div>
              ) : (
                <button
                  onClick={handleSendReport}
                  disabled={!equipment || !issueDesc}
                  className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Gửi báo cáo cho Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
