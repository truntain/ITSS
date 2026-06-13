"use client";

import { useState, useEffect } from 'react';
import { Search, User, Phone, Calendar, Package, Clock, ChevronRight, X, CheckCircle, AlertCircle, Plus, Edit2, Pause, Play } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  dbId: number;
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
  history?: { date: string; action: string; detail: string }[];
  membershipId?: number | null;
}

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
  const [membersList, setMembersList] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'male',
    birthDate: '',
    password: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    dbId: 0,
    fullName: '',
    email: '',
    phone: '',
    gender: 'male',
    birthDate: '',
  });

  const fetchMembers = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch('http://localhost:3001/users/members-detailed', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMembersList(data);
          if (selectedMember) {
            const updated = data.find(m => m.dbId === selectedMember.dbId);
            if (updated) {
              setSelectedMember(updated);
            }
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching members:', err);
        toast.error('Không thể tải danh sách hội viên');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.fullName || !addForm.email || !addForm.phone) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    fetch('http://localhost:3001/users/members', {
      method: 'POST',
      headers,
      body: JSON.stringify(addForm),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Không thể tạo hội viên');
        return data;
      })
      .then(() => {
        toast.success('Thêm hội viên mới thành công!');
        setShowAddModal(false);
        setAddForm({
          fullName: '',
          email: '',
          phone: '',
          gender: 'male',
          birthDate: '',
          password: '',
        });
        fetchMembers();
      })
      .catch(err => {
        toast.error(err.message || 'Có lỗi xảy ra!');
      });
  };

  const handleUpdateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.fullName || !editForm.email || !editForm.phone) {
      toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc!');
      return;
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const payload = {
      fullName: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
      gender: editForm.gender,
      birthDate: editForm.birthDate || undefined,
    };

    fetch(`http://localhost:3001/users/members/${editForm.dbId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Không thể cập nhật hội viên');
        return data;
      })
      .then(() => {
        toast.success('Cập nhật thông tin hội viên thành công!');
        setShowEditModal(false);
        fetchMembers();
      })
      .catch(err => {
        toast.error(err.message || 'Có lỗi xảy ra!');
      });
  };

  const handleToggleMembershipStatus = (membershipId: number, currentStatus: string) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    const actionText = nextStatus === 'paused' ? 'Tạm ngừng' : 'Kích hoạt lại';

    fetch(`http://localhost:3001/memberships/${membershipId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: nextStatus }),
    })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || `Không thể ${actionText.toLowerCase()} gói tập`);
        return data;
      })
      .then(() => {
        toast.success(`${actionText} gói tập thành công!`);
        fetchMembers();
      })
      .catch(err => {
        toast.error(err.message || 'Có lỗi xảy ra!');
      });
  };

  const filtered = membersList.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || m.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
        <span className="ml-3 text-[var(--muted-foreground)]">Đang tải danh sách hội viên...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* Left: Member List */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-3">
        {/* Search & Add */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Tên, SĐT, mã..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
            title="Thêm hội viên"
          >
            <Plus className="w-4 h-4" />
          </button>
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
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      let formattedDob = '';
                      if (selectedMember.dob && selectedMember.dob !== 'Không rõ') {
                        const parts = selectedMember.dob.split('/');
                        if (parts.length === 3) {
                          formattedDob = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        }
                      }
                      
                      setEditForm({
                        dbId: selectedMember.dbId,
                        fullName: selectedMember.name,
                        email: selectedMember.email,
                        phone: selectedMember.phone,
                        gender: selectedMember.gender === 'Nam' ? 'male' : selectedMember.gender === 'Nữ' ? 'female' : 'other',
                        birthDate: formattedDob,
                      });
                      setShowEditModal(true);
                    }}
                    className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors text-[var(--muted-foreground)] hover:text-[var(--primary)]"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors text-[var(--muted-foreground)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
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
                  <span className={`font-bold text-sm ${selectedMember.status === 'active' ? 'text-green-500' : selectedMember.status === 'suspended' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {selectedMember.status === 'active' ? 'Gói đang hiệu lực' : selectedMember.status === 'suspended' ? 'Gói đang tạm ngừng' : 'Gói đã hết hạn'}
                  </span>
                </div>
              </div>

              {selectedMember.membershipId && (selectedMember.status === 'active' || selectedMember.status === 'suspended') && (
                <div className="mt-3">
                  {selectedMember.status === 'active' ? (
                    <button
                      onClick={() => handleToggleMembershipStatus(selectedMember.membershipId!, 'active')}
                      className="w-full py-3 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-500 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Tạm ngừng gói tập (Đóng băng)
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleMembershipStatus(selectedMember.membershipId!, 'paused')}
                      className="w-full py-3 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-500 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Kích hoạt lại gói tập
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Service History */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="text-[var(--foreground)] font-bold text-base mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[var(--primary)]" />
                Lịch sử sử dụng dịch vụ
              </h3>
              <div className="space-y-2">
                {(selectedMember.history || []).map((item, idx) => (
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

      {/* Add Member Modal */}
      {showAddModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowAddModal(false)} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-[var(--secondary)] rounded-lg text-[var(--muted-foreground)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-5">Thêm hội viên mới</h3>
              <form onSubmit={handleCreateMember} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={addForm.fullName}
                    onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                    placeholder="0987654321"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Email *</label>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Giới tính</label>
                    <select
                      value={addForm.gender}
                      onChange={(e) => setAddForm({ ...addForm, gender: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Ngày sinh</label>
                    <input
                      type="date"
                      value={addForm.birthDate}
                      onChange={(e) => setAddForm({ ...addForm, birthDate: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Mật khẩu (mặc định: 123456)</label>
                  <input
                    type="password"
                    value={addForm.password}
                    onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] placeholder:text-[var(--muted-foreground)]"
                    placeholder="Mật khẩu tài khoản"
                  />
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2 bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)] rounded-xl font-bold text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                  >
                    Thêm mới
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
              <button
                onClick={() => setShowEditModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-[var(--secondary)] rounded-lg text-[var(--muted-foreground)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-5">Chỉnh sửa thông tin hội viên</h3>
              <form onSubmit={handleUpdateMember} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Số điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Email *</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Giới tính</label>
                    <select
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--muted-foreground)] mb-1 block">Ngày sinh</label>
                    <input
                      type="date"
                      value={editForm.birthDate}
                      onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
                      className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-2 bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)] rounded-xl font-bold text-sm transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold text-sm transition-colors shadow-md"
                  >
                    Lưu thay đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
