"use client";

import { Upload, Save, Plus, Trash2, X, Building2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001';

interface Facility {
  id: number;
  name: string;
  capacity: number;
  description?: string;
}

export function FacilityPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [formData, setFormData] = useState({
    gymName: '',
    address: '',
    phone: '',
    email: '',
    openTime: '06:00',
    closeTime: '22:00',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add area modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArea, setNewArea] = useState({ name: '', capacity: 30 });
  const [isAddingArea, setIsAddingArea] = useState(false);

  const getToken = () => localStorage.getItem('token') || '';

  const fetchFacilities = useCallback(async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [facRes, setRes] = await Promise.all([
        fetch(`${API_BASE}/facilities`, { headers }),
        fetch(`${API_BASE}/facilities/settings`, { headers })
      ]);
      
      if (!facRes.ok || !setRes.ok) throw new Error('Không thể tải dữ liệu phòng tập');
      
      const facData: Facility[] = await facRes.json();
      const setData = await setRes.json();
      
      setFacilities(facData);
      setFormData({
        gymName: setData.name || '',
        address: setData.address || '',
        phone: setData.phone || '',
        email: setData.email || '',
        openTime: setData.openTime || '06:00',
        closeTime: setData.closeTime || '22:00',
      });
      setLogoPreview(setData.logo || null);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

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

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch(`${API_BASE}/facilities/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: formData.gymName,
          address: formData.address,
          phone: formData.phone,
          email: formData.email,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          logo: logoPreview,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lưu thất bại');
      }

      setSaveMessage({ type: 'success', text: 'Lưu cài đặt thành công!' });
      setTimeout(() => setSaveMessage(null), 3000);
      fetchFacilities();
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: err.message || 'Lưu thất bại, vui lòng thử lại' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArea = async (id: number, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa khu vực "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/facilities/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Xóa thất bại');
      }
      fetchFacilities();
    } catch (err: any) {
      alert(err.message || 'Xóa khu vực thất bại!');
    }
  };

  const handleAddArea = async () => {
    if (!newArea.name.trim()) return;
    setIsAddingArea(true);
    try {
      const res = await fetch(`${API_BASE}/facilities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ name: newArea.name, capacity: newArea.capacity }),
      });
      if (!res.ok) throw new Error('Thêm thất bại');
      setShowAddModal(false);
      setNewArea({ name: '', capacity: 30 });
      fetchFacilities();
    } catch (err) {
      alert('Thêm khu vực thất bại!');
    } finally {
      setIsAddingArea(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
      </div>
    );
  }

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
                <span className="ml-2 text-xs font-normal text-[var(--muted-foreground)] bg-[var(--background)] border border-[var(--border)] px-2 py-0.5 rounded-full">
                  {facilities.length} khu vực
                </span>
              </label>
              <div className="space-y-2">
                {facilities.map((area) => (
                  <div
                    key={area.id}
                    className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg border border-[var(--border)]"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="w-4 h-4 text-[var(--muted-foreground)] shrink-0" />
                      <span className="text-[var(--foreground)] font-medium">{area.name}</span>
                      <span className="text-xs text-[var(--muted-foreground)] bg-[var(--card)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                        Sức chứa: {area.capacity} người
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteArea(area.id, area.name)}
                      className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Xóa
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="w-full p-3 border-2 border-dashed border-[var(--border)] rounded-lg text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm khu vực
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
          {saveMessage && (
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
                saveMessage.type === 'success'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {saveMessage.text}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={Object.keys(errors).length > 0 || isSaving}
            className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </div>

      {/* Add Area Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--card)] rounded-xl p-6 w-full max-w-md shadow-2xl border border-[var(--border)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Thêm khu vực tập</h3>
              <button
                onClick={() => { setShowAddModal(false); setNewArea({ name: '', capacity: 30 }); }}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Tên khu vực <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newArea.name}
                  onChange={(e) => setNewArea({ ...newArea, name: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddArea()}
                  placeholder="VD: Khu vực Cardio"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Sức chứa (người) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newArea.capacity}
                  onChange={(e) => setNewArea({ ...newArea, capacity: parseInt(e.target.value) || 1 })}
                  min={1}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowAddModal(false); setNewArea({ name: '', capacity: 30 }); }}
                className="flex-1 px-4 py-2 border border-[var(--border)] rounded-lg text-[var(--foreground)] hover:bg-[var(--background)] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleAddArea}
                disabled={!newArea.name.trim() || isAddingArea}
                className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isAddingArea ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isAddingArea ? 'Đang thêm...' : 'Thêm khu vực'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
