"use client";

import { Upload, Save } from 'lucide-react';
import { useState } from 'react';

export function FacilityPage() {
  const [formData, setFormData] = useState({
    gymName: 'GymPro Fitness Center',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    phone: '0281234567',
    email: 'contact@gympro.vn',
    openTime: '06:00',
    closeTime: '22:00',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^0\d{9,10}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Real-time validation
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setErrors({ ...errors, email: 'Email không hợp lệ' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.email;
        setErrors(newErrors);
      }
    }

    if (field === 'phone' && value) {
      if (!validatePhone(value)) {
        setErrors({ ...errors, phone: 'SĐT phải bắt đầu bằng 0 và có 10-11 số' });
      } else {
        const newErrors = { ...errors };
        delete newErrors.phone;
        setErrors(newErrors);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (Object.keys(errors).length === 0) {
      alert('Lưu cài đặt thành công!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Quản lý phòng tập</h2>
        <p className="text-[var(--muted-foreground)]">Thông tin chung về phòng tập</p>
      </div>

      {/* Content */}
      <div>
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-sm">
          <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Thông tin chung</h3>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Cấu hình thông tin cơ bản của phòng tập
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Logo phòng tập
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-[var(--border)] bg-[var(--background)] flex items-center justify-center overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <Upload className="w-8 h-8 text-[var(--muted-foreground)]" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors cursor-pointer inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Tải ảnh lên
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      Ảnh PNG, JPG tối đa 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Tên phòng tập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.gymName}
                    onChange={(e) => handleInputChange('gymName', e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.phone
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[var(--border)] focus:ring-[var(--primary)]'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:border-transparent ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[var(--border)] focus:ring-[var(--primary)]'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div></div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Giờ mở cửa
                  </label>
                  <input
                    type="time"
                    value={formData.openTime}
                    onChange={(e) => handleInputChange('openTime', e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Giờ đóng cửa
                  </label>
                  <input
                    type="time"
                    value={formData.closeTime}
                    onChange={(e) => handleInputChange('closeTime', e.target.value)}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Training Areas */}
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
                  Khu vực tập luyện
                </label>
                <div className="space-y-2">
                  {['Khu vực Cardio', 'Khu vực Tạ', 'Phòng Yoga', 'Khu CrossFit', 'Khu Boxing'].map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]">
                      <span className="text-[var(--foreground)]">{area}</span>
                      <button className="text-red-500 hover:text-red-600 text-sm">Xóa</button>
                    </div>
                  ))}
                  <button className="w-full p-3 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                    + Thêm khu vực
                  </button>
                </div>
              </div>
            </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
