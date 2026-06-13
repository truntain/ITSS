"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Lock, Upload, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  HV: 'Hội viên GymPro',
  PT: 'Huấn luyện viên',
  NV: 'Nhân viên',
  AD: 'Quản trị viên',
};

export function PTProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'male',
    role: 'PT',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const fetchProfile = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/auth/profile', { headers })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể tải thông tin cá nhân');
        return res.json();
      })
      .then((data) => {
        setProfileData({
          fullName: data.fullName || '',
          phone: data.phone || '',
          email: data.email || '',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          gender: data.gender || 'male',
          role: data.role || 'PT',
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Lỗi khi tải thông tin hồ sơ');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = () => {
    if (!profileData.fullName || !profileData.phone) {
      toast.error('Họ tên và số điện thoại không được để trống!');
      return;
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/auth/profile', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        fullName: profileData.fullName,
        phone: profileData.phone,
        birthDate: profileData.birthDate || null,
        gender: profileData.gender,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Không thể cập nhật hồ sơ');
        return res.json();
      })
      .then((updated) => {
        toast.success('Cập nhật hồ sơ thành công!');
        const currentUserStr = localStorage.getItem('currentUser');
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr);
          currentUser.fullName = updated.fullName;
          currentUser.phone = updated.phone;
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
          // Dispatch custom event to notify other layout parts (sidebar, header)
          window.dispatchEvent(new Event('currentUserUpdated'));
        }
        fetchProfile();
      })
      .catch((err) => {
        console.error(err);
        toast.error('Lỗi khi cập nhật hồ sơ');
      });
  };

  const handleChangePassword = () => {
    const newErrors = {
      currentPassword: !passwordData.currentPassword,
      newPassword: !passwordData.newPassword,
      confirmPassword: passwordData.newPassword !== passwordData.confirmPassword,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) {
      if (newErrors.confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp!');
      } else {
        toast.error('Vui lòng điền đầy đủ thông tin!');
      }
      return;
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/auth/change-password', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Không thể đổi mật khẩu');
        }
        return res.json();
      })
      .then(() => {
        toast.success('Đổi mật khẩu thành công!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || 'Lỗi khi đổi mật khẩu');
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-slate-500">
        <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-4" />
        <p className="text-sm font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Hồ sơ cá nhân</h1>
        <p className="text-slate-500">Quản lý thông tin tài khoản cá nhân và mật khẩu của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-2.5 font-semibold text-sm rounded-lg border transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-5 py-2.5 font-semibold text-sm rounded-lg border transition-all cursor-pointer ${
            activeTab === 'password'
              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-md">
                <User className="w-12 h-12 text-white" />
              </div>
              <button
                type="button"
                onClick={() => toast.info('Tính năng thay đổi ảnh đại diện đang được phát triển')}
                className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profileData.fullName}</h2>
              <p className="text-emerald-600 font-semibold text-sm mt-0.5">
                {roleLabels[profileData.role] || 'Huấn luyện viên'}
              </p>
              <button
                type="button"
                onClick={() => toast.info('Tính năng thay đổi ảnh đại diện đang được phát triển')}
                className="mt-2 text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Thay đổi ảnh đại diện
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-500 mb-1.5">Email (Không thể thay đổi)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 cursor-not-allowed focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ngày sinh</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Giới tính</label>
              <select
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm cursor-pointer"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleSaveProfile}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer text-sm"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="max-w-xl space-y-4">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Đổi mật khẩu</h2>

            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, currentPassword: e.target.value });
                    setErrors({ ...errors, currentPassword: false });
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-colors text-sm ${
                    errors.currentPassword ? 'border-red-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">Vui lòng nhập mật khẩu hiện tại</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, newPassword: e.target.value });
                    setErrors({ ...errors, newPassword: false });
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-colors text-sm ${
                    errors.newPassword ? 'border-red-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">Vui lòng nhập mật khẩu mới</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => {
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: false });
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none transition-colors text-sm ${
                    errors.confirmPassword ? 'border-red-500' : 'border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent'
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Mật khẩu xác nhận không khớp</p>
              )}
            </div>

            {/* Change Password Button */}
            <div className="pt-4 flex justify-end">
              <button
                onClick={handleChangePassword}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg flex items-center gap-2 shadow-sm transition-colors cursor-pointer text-sm"
              >
                <Lock className="w-4 h-4" />
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
