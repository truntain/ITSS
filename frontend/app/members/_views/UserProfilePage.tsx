"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Ruler, Lock, Upload, Save } from 'lucide-react';
import { toast } from 'sonner';

const roleLabels: Record<string, string> = {
  HV: 'Hội viên GymPro',
  PT: 'Huấn luyện viên',
  NV: 'Nhân viên',
  AD: 'Quản trị viên',
};

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: 'male',
    height: '',
    role: 'HV',
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
          height: data.height ? String(Math.round(Number(data.height))) : '',
          role: data.role || 'HV',
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
        height: profileData.height ? Number(profileData.height) : null,
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
      <div className="max-w-[1800px] mx-auto px-8 py-12 flex flex-col items-center justify-center min-h-[400px] text-[#A0A0A0]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A00] mb-4"></div>
        <p className="text-sm">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2 uppercase">HỒ SƠ CÁ NHÂN</h1>
        <p className="text-[#A0A0A0]">Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 font-black uppercase text-sm transition-all ${
            activeTab === 'profile'
              ? 'bg-[#FF5A00] text-white shadow-[0_0_20px_rgba(255,90,0,0.4)]'
              : 'bg-[#242424] text-[#A0A0A0] hover:text-white border border-[#333333]'
          }`}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-6 py-3 font-black uppercase text-sm transition-all ${
            activeTab === 'password'
              ? 'bg-[#FF5A00] text-white shadow-[0_0_20px_rgba(255,90,0,0.4)]'
              : 'bg-[#242424] text-[#A0A0A0] hover:text-white border border-[#333333]'
          }`}
        >
          Đổi mật khẩu
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-[#242424] border border-[#333333] shadow-2xl p-8">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#333333]">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-[#FF5A00] to-[#FF8C00] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,90,0,0.4)]">
                <User className="w-16 h-16 text-white" />
              </div>
              <button 
                type="button"
                onClick={() => toast.info('Tính năng thay đổi ảnh đại diện đang được phát triển')}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF5A00] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF6A10] transition-colors"
              >
                <Upload className="w-5 h-5 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1">{profileData.fullName}</h2>
              <p className="text-[#FF5A00] font-bold uppercase text-sm">
                {roleLabels[profileData.role] || 'Hội viên GymPro'}
              </p>
              <button 
                type="button"
                onClick={() => toast.info('Tính năng thay đổi ảnh đại diện đang được phát triển')}
                className="mt-3 text-sm text-[#A0A0A0] hover:text-white flex items-center gap-2 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Thay đổi ảnh đại diện
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Họ và tên</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] text-white focus:border-[#FF5A00] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] text-white focus:border-[#FF5A00] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-[#A0A0A0] mb-2 uppercase">Email (Không thể thay đổi)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666666]" />
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full pl-12 pr-4 py-3 bg-[#161616] border border-[#262626] text-[#666666] cursor-not-allowed focus:outline-none"
                />
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Ngày sinh</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="date"
                  value={profileData.birthDate}
                  onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] text-white focus:border-[#FF5A00] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Giới tính</label>
              <select
                value={profileData.gender}
                onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] text-white focus:border-[#FF5A00] focus:outline-none transition-colors"
              >
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Chiều cao (cm)</label>
              <div className="relative">
                <Ruler className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="number"
                  value={profileData.height}
                  onChange={(e) => setProfileData({ ...profileData, height: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] text-white focus:border-[#FF5A00] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="px-8 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase flex items-center gap-2 shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
            >
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </button>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-[#242424] border border-[#333333] shadow-2xl p-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-black text-white mb-6 uppercase">Đổi mật khẩu</h2>

            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, currentPassword: e.target.value });
                      setErrors({ ...errors, currentPassword: false });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border text-white focus:outline-none transition-colors ${
                      errors.currentPassword ? 'border-red-500' : 'border-[#333333] focus:border-[#FF5A00]'
                    }`}
                  />
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">Vui lòng nhập mật khẩu hiện tại</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, newPassword: e.target.value });
                      setErrors({ ...errors, newPassword: false });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border text-white focus:outline-none transition-colors ${
                      errors.newPassword ? 'border-red-500' : 'border-[#333333] focus:border-[#FF5A00]'
                    }`}
                  />
                </div>
                {errors.newPassword && <p className="text-red-500 text-sm mt-1">Vui lòng nhập mật khẩu mới</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-bold text-white mb-2 uppercase">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => {
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                      setErrors({ ...errors, confirmPassword: false });
                    }}
                    className={`w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border text-white focus:outline-none transition-colors ${
                      errors.confirmPassword ? 'border-red-500' : 'border-[#333333] focus:border-[#FF5A00]'
                    }`}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">Mật khẩu xác nhận không khớp</p>
                )}
              </div>
            </div>

            {/* Change Password Button */}
            <div className="mt-8">
              <button
                onClick={handleChangePassword}
                className="px-8 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase flex items-center gap-2 shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
              >
                <Lock className="w-5 h-5" />
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
