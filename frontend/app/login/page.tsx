"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, User } from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const validatePassword = (pwd: string): string => {
    if (!pwd.trim()) return 'Vui lòng nhập mật khẩu';
    if (pwd.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!/[A-Z]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự in hoa';
    if (!/[0-9]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 chữ số';
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt';
    return '';
  };

  const handleLogin = async () => {
    setLoginError(null);
    // Validate inputs
    const emailErr = !emailOrPhone.trim();
    const pwdErr = validatePassword(password);

    setEmailError(emailErr);
    setPasswordError(pwdErr);

    if (!emailErr && !pwdErr) {
      try {
        const response = await fetch(`${'http://localhost:3001'}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: emailOrPhone,
            password: password,
          }),
        });

        if (!response.ok) {
          let errMsg = 'Email hoặc mật khẩu không hợp lệ!';
          try {
            const errData = await response.json();
            errMsg = errData.message || errMsg;
          } catch (e) {
            console.error('Failed to parse error response:', e);
          }
          setLoginError(errMsg);
          toast.error(errMsg);
          return;
        }

        const data = await response.json();

        // Save to localStorage
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));

        toast.success('Đăng nhập thành công!');

        // Determine destination based on user.role
        const role = data.user.role;
        if (role === 'AD') {
          router.push('/admins');
        } else if (role === 'PT') {
          router.push('/PT');
        } else if (role === 'HV') {
          router.push('/members');
        } else if (role === 'NV') {
          router.push('/staffs');
        } else {
          toast.error('Vai trò người dùng không hợp lệ!');
        }
      } catch (error: any) {
        console.error('Login error:', error);
        setLoginError(error.message || 'Lỗi hệ thống khi đăng nhập!');
        toast.error(error.message || 'Lỗi hệ thống khi đăng nhập!');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Toaster position="top-right" richColors />
      {/* Login Card */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập tài khoản</h2>





          {loginError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium text-center">
              ⚠️ {loginError}
            </div>
          )}

          {/* Email or Phone Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={emailOrPhone}
                onChange={(e) => {
                  setEmailOrPhone(e.target.value);
                  setEmailError(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Email"
                className={`w-full pl-10 pr-4 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${emailError ? 'border-red-500' : 'border-slate-300'
                  }`}
              />
            </div>
            {emailError && (
              <p className="text-xs text-red-500 mt-1">Vui lòng nhập email</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                onKeyPress={handleKeyPress}
                placeholder="Mật khẩu"
                className={`w-full pl-10 pr-12 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${passwordError ? 'border-red-500' : 'border-slate-300'
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
            {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mb-6">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              Quên mật khẩu?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Đăng nhập
          </button>


          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                Đăng ký ngay
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-sm text-slate-500">
          © 2026 GymPro. Hệ thống quản lý phòng tập chuyên nghiệp.
        </p>
      </div>
    </div>
  );
}
