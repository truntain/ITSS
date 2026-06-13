"use client";

import { useState, useEffect, useCallback } from 'react';
import { QrCode, CheckCircle, XCircle, AlertTriangle, X, Send } from 'lucide-react';
import { toast } from 'sonner';

type CheckinStatus = 'valid' | 'expired';

interface MemberResult {
  name: string;
  avatar: string;
  package: string;
  status: CheckinStatus;
  daysLeft?: number;
}

// Mock data replaced with backend API loading.

export function StaffCheckinPage() {
  const [query, setQuery] = useState('');
  const [member, setMember] = useState<MemberResult | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [equipment, setEquipment] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const [equipmentList, setEquipmentList] = useState<any[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    morning: { count: 0, max: 60 },
    afternoon: { count: 0, max: 60 }
  });
  const [currentStaffId, setCurrentStaffId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState<string>(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const loadStatsAndRecent = useCallback((headers: HeadersInit, dateStr: string) => {
    Promise.all([
      fetch(`http://localhost:3001/checkins?date=${dateStr}`, { headers }).then(res => res.json()),
      fetch('http://localhost:3001/checkins/today-stats', { headers }).then(res => res.json())
    ])
      .then(([checkinsData, statsData]) => {
        const formattedCheckins = Array.isArray(checkinsData)
          ? checkinsData.map((item: any) => {
              const checkinTime = new Date(item.checkedInAt);
              const formattedTime = `${String(checkinTime.getHours()).padStart(2, '0')}:${String(checkinTime.getMinutes()).padStart(2, '0')}`;
              return {
                name: item.user?.fullName || 'Không rõ',
                time: formattedTime,
                valid: true
              };
            })
          : [];
        setRecentCheckins(formattedCheckins);

        if (statsData && statsData.morning) {
          setStats(statsData);
        }
      })
      .catch(err => console.error('Error loading checkin stats:', err));
  }, []);

  // Fetch checkins list whenever filterDate changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    loadStatsAndRecent(headers, filterDate);
  }, [filterDate, loadStatsAndRecent]);

  // Load equipment, member lists, reports, and staff ID on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.id) {
          setCurrentStaffId(Number(user.id));
        }
      } catch (e) {
        console.error('Error parsing current user:', e);
      }
    }

    Promise.all([
      fetch('http://localhost:3001/facilities/equipment/list', { headers }).then(res => res.json()),
      fetch('http://localhost:3001/users/members', { headers }).then(res => res.json()),
      fetch('http://localhost:3001/facilities/reports/list', { headers }).then(res => res.json())
    ])
      .then(([equipmentData, membersData, reportsData]) => {
        setEquipmentList(Array.isArray(equipmentData) ? equipmentData : []);
        setMembersList(Array.isArray(membersData) ? membersData : []);
        setReportsList(Array.isArray(reportsData) ? reportsData : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading checkin page data:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = (searchCode?: string) => {
    const targetCode = searchCode || query.trim();
    if (!targetCode) return;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`http://localhost:3001/checkins/verify-member/${targetCode}`, { headers })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Không tìm thấy hội viên');
        }
        return data;
      })
      .then(data => {
        setMember(data);
        if (data.status === 'valid') {
          // Perform automatic check-in without confirmation step
          const checkinHeaders: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          };
          fetch('http://localhost:3001/checkins', {
            method: 'POST',
            headers: checkinHeaders,
            body: JSON.stringify({
              userId: data.id,
              checkinMethod: 'QR_staff'
            })
          })
            .then(async (postRes) => {
              const postData = await postRes.json();
              if (!postRes.ok) {
                throw new Error(postData.message || 'Check-in thất bại!');
              }
              return postData;
            })
            .then(() => {
              setCheckedIn(true);
              toast.success('Check-in thành công!');
              loadStatsAndRecent(headers, filterDate);
            })
            .catch(err => {
              toast.error(err.message);
              setCheckedIn(false);
            });
        } else {
          setCheckedIn(false);
        }
      })
      .catch(err => {
        setMember({ name: err.message, avatar: '?', package: '', status: 'expired' } as any);
        setCheckedIn(false);
        toast.error(err.message);
      });
  };

  const handleCancel = () => { setMember(null); setQuery(''); setCheckedIn(false); };

  // Filter suggestions locally
  const filteredSuggestions = query.trim()
    ? membersList.filter(m => {
        const q = query.trim().toLowerCase();
        const code = `HV${String(m.id).padStart(3, '0')}`.toLowerCase();
        return (
          m.fullName.toLowerCase().includes(q) ||
          (m.phone && m.phone.includes(q)) ||
          code.includes(q)
        );
      }).slice(0, 7)
    : [];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightIndex(prev => (prev + 1) % filteredSuggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSelectSuggestion(filteredSuggestions[highlightIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    } else if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const code = `HV${String(item.id).padStart(3, '0')}`;
    setQuery(code);
    setShowSuggestions(false);
    handleSearch(code);
  };

  const handleSendReport = () => {
    if (!equipment || !issueDesc) return;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    fetch('http://localhost:3001/facilities/reports/create', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        equipmentId: Number(equipment),
        reporterId: currentStaffId,
        description: issueDesc
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Gửi báo cáo thất bại!');
        }
        return data;
      })
      .then(() => {
        setReportSent(true);
        toast.success('Gửi báo cáo sự cố thành công!');

        // Refresh the reports list immediately from the backend database
        const token = localStorage.getItem('token');
        const refreshHeaders: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
        fetch('http://localhost:3001/facilities/reports/list', { headers: refreshHeaders })
          .then(res => res.json())
          .then(reportsData => {
            setReportsList(Array.isArray(reportsData) ? reportsData : []);
          })
          .catch(err => console.error('Error refreshing reports:', err));

        setTimeout(() => {
          setShowModal(false);
          setReportSent(false);
          setEquipment('');
          setIssueDesc('');
        }, 1500);
      })
      .catch(err => {
        toast.error(err.message);
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        <span className="ml-3 text-[var(--muted-foreground)]">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* Check-in */}
      <div className="space-y-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-bold text-[var(--foreground)]">Check-in hội viên</h2>
          </div>

          <div className="flex gap-2 mb-4 relative z-20">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                  setHighlightIndex(0);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onKeyDown={handleKeyDown}
                placeholder="Quét QR hoặc nhập mã hội viên... (HV001)"
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-orange-400 bg-[var(--background)]"
              />
              {showSuggestions && query.trim() && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto pr-1">
                  {filteredSuggestions.map((item, index) => {
                    const code = `HV${String(item.id).padStart(3, '0')}`;
                    return (
                      <div
                        key={item.id}
                        onMouseDown={() => handleSelectSuggestion(item)}
                        className={`px-3 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                          index === highlightIndex
                            ? 'bg-orange-500/15 text-orange-500 font-semibold'
                            : 'hover:bg-[var(--secondary)] text-[var(--foreground)]'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{item.fullName}</p>
                          <p className="text-[10px] text-[var(--muted-foreground)]">{item.phone || 'Không có SĐT'}</p>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--secondary)] border border-[var(--border)]">
                          {code}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0"
            >
              Tìm
            </button>
          </div>

          {member && !checkedIn && (
            <div className="rounded-lg border p-4 mb-3 border-red-300 bg-red-50">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 bg-red-500">
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm">{member.name}</p>
                  <p className="text-xs text-slate-500">{member.package}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <XCircle className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-red-700 text-xs font-semibold">Gói tập đã hết hạn</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.warning('Vui lòng hướng dẫn hội viên gia hạn gói tập!')} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-colors">
                  Thông báo gia hạn
                </button>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--foreground)]">Danh sách check-in</h3>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--foreground)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
            {recentCheckins.length > 0 ? (
              recentCheckins.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-sm text-[var(--foreground)]">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--muted-foreground)]">{item.time}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.valid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {item.valid ? 'Hợp lệ' : 'Hết hạn'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[var(--muted-foreground)] text-center py-6">Không có dữ liệu check-in trong ngày này</p>
            )}
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
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <AlertTriangle className="w-4 h-4" />
            + Báo lỗi thiết bị
          </button>

          {/* Incidents List from Database */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-xs font-bold text-[var(--foreground)] mb-3 flex items-center justify-between">
              <span>Sự cố gần đây</span>
              <span className="text-[10px] text-[var(--muted-foreground)] font-normal">Tổng: {reportsList.length}</span>
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {reportsList.length > 0 ? (
                reportsList.map((rep) => (
                  <div key={rep.id} className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-[var(--foreground)] truncate max-w-[150px]">
                        {rep.equipment?.name || `Thiết bị #${rep.equipmentId}`}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        rep.status === 'resolved' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : rep.status === 'in_progress' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {rep.status === 'resolved' ? 'Đã giải quyết' : rep.status === 'in_progress' ? 'Đang sửa' : 'Chờ xử lý'}
                      </span>
                    </div>
                    <p className="text-[var(--muted-foreground)] mb-1.5 line-clamp-2">{rep.description}</p>
                    <div className="flex justify-between items-center text-[10px] text-[var(--muted-foreground)]">
                      <span>Bởi: {rep.reporter?.fullName || 'Nhân viên'}</span>
                      <span>{new Date(rep.reportedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-[var(--muted-foreground)] text-center py-4">Chưa có sự cố nào được báo cáo</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-[var(--foreground)] mb-3">Thống kê check-in hôm nay</h3>
          <div className="space-y-3">
            {[
              { label: 'Ca sáng (06:00–14:00)', count: stats.morning.count, max: stats.morning.max, color: 'bg-orange-500' },
              { label: 'Ca chiều (14:00–22:00)', count: stats.afternoon.count, max: stats.afternoon.max, color: 'bg-blue-500' },
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
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.code} – {eq.name}</option>
                  ))}
                </select>
              </div>
              {equipment && (() => {
                const eq = equipmentList.find(e => e.id === Number(equipment));
                return eq ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Mã thiết bị</p>
                      <p className="text-sm font-semibold text-slate-800">{eq.code}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <p className="text-xs text-slate-500">Phòng tập</p>
                      <p className="text-sm font-semibold text-slate-800">{eq.facility?.name || 'N/A'}</p>
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
