"use client";

import { useState } from 'react';
import { User, Mail, Phone, Calendar, Ruler, Lock, Upload, Save } from 'lucide-react';

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [profileData, setProfileData] = useState({
    fullName: 'Trương Thế Thành',
    phone: '0901234567',
    email: 'truongthethanhgymgmail.com',
    birthDate: '1995-03-15',
    gender: 'male',
    height: '175',
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

  const handleSaveProfile = () => {
    console.log('Saving profile:', profileData);
    // Show success notification
  };

  const handleChangePassword = () => {
    const newErrors = {
      currentPassword: !passwordData.currentPassword,
      newPassword: !passwordData.newPassword,
      confirmPassword: passwordData.newPassword !== passwordData.confirmPassword,
    };

    setErrors(newErrors);

    if (!Object.values(newErrors).some((error) => error)) {
      console.log('Changing password');
      // Reset form
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12">
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
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF5A00] rounded-full flex items-center justify-center shadow-lg hover:bg-[#FF6A10] transition-colors">
                <Upload className="w-5 h-5 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-1">{profileData.fullName}</h2>
              <p className="text-[#FF5A00] font-bold uppercase text-sm">Hội viên Premium</p>
              <button className="mt-3 text-sm text-[#A0A0A0] hover:text-white flex items-center gap-2 transition-colors">
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
              <label className="block text-sm font-bold text-white mb-2 uppercase">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0A0A0]" />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] text-white focus:border-[#FF5A00] focus:outline-none transition-colors"
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
