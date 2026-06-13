"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Lock, Eye, EyeOff, Calendar } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    dateOfBirth: '',
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const [errors, setErrors] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
    agreeToTerms: false,
  });

  const handleRegister = async () => {
    setRegisterError(null);
    // Validate inputs
    const newErrors = {
      fullName: !formData.fullName.trim(),
      email: !formData.email.trim(),
      phone: !formData.phone.trim(),
      password: !formData.password.trim(),
      confirmPassword: !formData.confirmPassword.trim() || formData.password !== formData.confirmPassword,
      agreeToTerms: !formData.agreeToTerms,
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (!Object.values(newErrors).some((error) => error)) {
      try {
        const response = await fetch(`${'http://localhost:3001'}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            fullName: formData.fullName,
            phone: formData.phone,
          }),
        });

        if (!response.ok) {
          let errMsg = 'Đăng ký thất bại. Vui lòng thử lại!';
          try {
            const errData = await response.json();
            errMsg = errData.message || errMsg;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          setRegisterError(errMsg);
          toast.error(errMsg);
          return;
        }

        toast.success('Đăng ký tài khoản thành công!');
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      } catch (error: any) {
        console.error('Registration error:', error);
        setRegisterError(error.message || 'Lỗi hệ thống khi đăng ký!');
        toast.error(error.message || 'Đăng ký thất bại!');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-4">
      <Toaster position="top-right" richColors />
      {/* Register Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Logo Section */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-5xl">🏋️</div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">GymPro</h1>
          <p className="text-orange-100 text-sm">Quản lý phòng tập</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng ký thành viên mới</h2>

          {registerError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center">
              ⚠️ {registerError}
            </div>
          )}

          {/* Two Column Layout for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    setErrors({ ...errors, fullName: false });
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nguyễn Văn A"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.fullName ? 'border-red-500' : 'border-slate-300'
                    }`}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1">Vui lòng nhập họ và tên</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: false });
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="example@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.email ? 'border-red-500' : 'border-slate-300'
                    }`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">Vui lòng nhập email</p>}
            </div>
          </div>

          {/* Phone Number and Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: false });
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="0901234567"
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.phone ? 'border-red-500' : 'border-slate-300'
                    }`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">Vui lòng nhập số điện thoại</p>}
            </div>

            {/* Gender Dropdown */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Giới tính</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Date of Birth */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Ngày sinh</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    setErrors({ ...errors, password: false });
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Mật khẩu"
                  className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">Vui lòng nhập mật khẩu</p>}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nhập lại mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value });
                    setErrors({ ...errors, confirmPassword: false });
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {!formData.confirmPassword.trim()
                    ? 'Vui lòng nhập lại mật khẩu'
                    : 'Mật khẩu không khớp'}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) => {
                  setFormData({ ...formData, agreeToTerms: e.target.checked });
                  setErrors({ ...errors, agreeToTerms: false });
                }}
                className={`mt-1 w-4 h-4 text-emerald-500 border-slate-300 rounded focus:ring-emerald-500 ${errors.agreeToTerms ? 'border-red-500' : ''
                  }`}
              />
              <span className="text-sm text-slate-600">
                Tôi đồng ý với các{' '}
                <a href="#" className="text-blue-600 hover:text-blue-700 hover:underline font-medium">
                  Điều khoản & Chính sách
                </a>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-xs text-red-500 mt-1 ml-7">Vui lòng đồng ý với điều khoản để tiếp tục</p>
            )}
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] mb-6"
          >
            Đăng ký
          </button>

          {/* Back to Login Link */}
          <div className="text-center">
            <p className="text-sm text-slate-600">
              Đã có tài khoản?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Quay lại đăng nhập
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center pb-4 mt-2">
        <p className="text-sm text-slate-500">
          © 2026 GymPro. Hệ thống quản lý phòng tập chuyên nghiệp.
        </p>
      </div>
    </div>
  );
}
