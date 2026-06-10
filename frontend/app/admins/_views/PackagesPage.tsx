"use client";

import { Search, Plus, Edit, Trash2, Tag, Dumbbell, X, Check } from 'lucide-react';
import { useState } from 'react';

interface Package {
  id: string;
  name: string;
  type: 'Cơ bản' | 'VIP' | 'PT Kèm 1-1';
  duration: string;
  price: number;
  activeMembers: number;
  isVisible: boolean;
  benefits: string[];
}

interface Voucher {
  id: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  used: number;
  total: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'depleted';
}

const initialPackages: Package[] = [
  {
    id: 'PKG001',
    name: 'Gói Khởi Động',
    type: 'Cơ bản',
    duration: '1 tháng',
    price: 500000,
    activeMembers: 124,
    isVisible: true,
    benefits: ['Tập luyện không giới hạn', 'Sử dụng phòng tập toàn thời gian', 'Hỗ trợ từ nhân viên']
  },
  {
    id: 'PKG002',
    name: 'Gói Tiêu Chuẩn',
    type: 'VIP',
    duration: '3 tháng',
    price: 1350000,
    activeMembers: 203,
    isVisible: true,
    benefits: ['Tất cả quyền lợi gói Khởi Động', 'Tặng 1 buổi tư vấn PT', 'Đo chỉ số cơ thể miễn phí']
  },
  {
    id: 'PKG003',
    name: 'Gói VIP',
    type: 'VIP',
    duration: '6 tháng',
    price: 2500000,
    activeMembers: 156,
    isVisible: true,
    benefits: ['Tất cả quyền lợi gói Tiêu Chuẩn', 'Tặng 3 buổi PT riêng', 'Ưu tiên đặt lịch', 'Tủ khóa cá nhân']
  },
  {
    id: 'PKG004',
    name: 'Gói Premium',
    type: 'VIP',
    duration: '12 tháng',
    price: 4200000,
    activeMembers: 89,
    isVisible: true,
    benefits: ['Tất cả quyền lợi gói VIP', 'Tặng 10 buổi PT riêng', 'Kế hoạch tập luyện cá nhân hóa']
  },
  {
    id: 'PKG005',
    name: 'Gói PT 1-1',
    type: 'PT Kèm 1-1',
    duration: '1 tháng',
    price: 3000000,
    activeMembers: 45,
    isVisible: true,
    benefits: ['Huấn luyện viên riêng', 'Kế hoạch cá nhân hóa', 'Theo dõi tiến độ hàng tuần']
  },
];

const initialVouchers: Voucher[] = [
  { id: 'V001', code: 'SUMMER2026', discountType: 'percent', discountValue: 20, used: 45, total: 100, startDate: '01/05/2026', endDate: '30/06/2026', status: 'active' },
  { id: 'V002', code: 'NEWYEAR50', discountType: 'fixed', discountValue: 50000, used: 150, total: 150, startDate: '01/01/2026', endDate: '31/01/2026', status: 'depleted' },
  { id: 'V003', code: 'FIRSTTIME', discountType: 'percent', discountValue: 15, used: 23, total: 50, startDate: '01/01/2026', endDate: '31/12/2026', status: 'active' },
  { id: 'V004', code: 'STUDENT30', discountType: 'fixed', discountValue: 30000, used: 12, total: 30, startDate: '01/03/2026', endDate: '15/08/2026', status: 'active' },
  { id: 'V005', code: 'BLACKFRIDAY', discountType: 'percent', discountValue: 50, used: 200, total: 200, startDate: '25/11/2025', endDate: '30/11/2025', status: 'expired' },
];

export function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>(initialPackages);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [activeTab, setActiveTab] = useState<'packages' | 'vouchers'>('packages');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [newBenefit, setNewBenefit] = useState('');
  const [benefits, setBenefits] = useState<string[]>([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Package Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    duration: '1 tháng',
    type: 'Cơ bản' as 'Cơ bản' | 'VIP' | 'PT Kèm 1-1',
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    price: false,
    benefits: false,
  });

  // Voucher Form state
  const [voucherFormData, setVoucherFormData] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: '',
    startDate: '',
    endDate: '',
  });

  const [voucherFormErrors, setVoucherFormErrors] = useState({
    code: false,
    discountValue: false,
    startDate: false,
    endDate: false,
  });

  const handleAddPackage = () => {
    // Validate form
    const errors = {
      name: !formData.name.trim(),
      price: !formData.price || Number(formData.price) <= 0,
      benefits: benefits.length === 0,
    };

    setFormErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(error => error)) {
      return;
    }

    if (editingPackage) {
      // Update existing package
      setPackages(packages.map(pkg =>
        pkg.id === editingPackage.id
          ? {
              ...pkg,
              name: formData.name.trim(),
              type: formData.type,
              duration: formData.duration,
              price: Number(formData.price),
              benefits: benefits,
            }
          : pkg
      ));
      setSuccessMessage('Cập nhật gói tập thành công!');
    } else {
      // Generate package ID
      const newId = `PKG${String(packages.length + 1).padStart(3, '0')}`;

      const newPackage: Package = {
        id: newId,
        name: formData.name.trim(),
        type: formData.type,
        duration: formData.duration,
        price: Number(formData.price),
        activeMembers: 0,
        isVisible: true,
        benefits: benefits,
      };

      setPackages([newPackage, ...packages]);
      setSuccessMessage('Thêm gói tập thành công!');
    }

    setShowPackageModal(false);

    // Reset form
    setFormData({ name: '', price: '', duration: '1 tháng', type: 'Cơ bản' });
    setFormErrors({ name: false, price: false, benefits: false });
    setBenefits([]);
    setEditingPackage(null);

    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleAddVoucher = () => {
    // Validate form
    const errors = {
      code: !voucherFormData.code.trim(),
      discountValue: !voucherFormData.discountValue || Number(voucherFormData.discountValue) <= 0,
      startDate: !voucherFormData.startDate,
      endDate: !voucherFormData.endDate,
    };

    setVoucherFormErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(error => error)) {
      return;
    }

    if (editingVoucher) {
      // Update existing voucher
      setVouchers(vouchers.map(v =>
        v.id === editingVoucher.id
          ? {
              ...v,
              code: voucherFormData.code.trim().toUpperCase(),
              discountType: voucherFormData.discountType,
              discountValue: Number(voucherFormData.discountValue),
              startDate: voucherFormData.startDate,
              endDate: voucherFormData.endDate,
            }
          : v
      ));
      setSuccessMessage('Cập nhật mã khuyến mãi thành công!');
    } else {
      // Generate voucher ID
      const newId = `V${String(vouchers.length + 1).padStart(3, '0')}`;

      const newVoucher: Voucher = {
        id: newId,
        code: voucherFormData.code.trim().toUpperCase(),
        discountType: voucherFormData.discountType,
        discountValue: Number(voucherFormData.discountValue),
        used: 0,
        total: 100,
        startDate: voucherFormData.startDate,
        endDate: voucherFormData.endDate,
        status: 'active',
      };

      setVouchers([newVoucher, ...vouchers]);
      setSuccessMessage('Thêm mã khuyến mãi thành công!');
    }

    setShowVoucherModal(false);

    // Reset form
    setVoucherFormData({ code: '', discountType: 'percent', discountValue: '', startDate: '', endDate: '' });
    setVoucherFormErrors({ code: false, discountValue: false, startDate: false, endDate: false });
    setEditingVoucher(null);

    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleDeleteConfirm = () => {
    if (!showDeleteConfirm) return;

    if (activeTab === 'packages') {
      setPackages(packages.filter(pkg => pkg.id !== showDeleteConfirm));
      setSuccessMessage('Đã xóa gói tập thành công!');
    } else {
      setVouchers(vouchers.filter(v => v.id !== showDeleteConfirm));
      setSuccessMessage('Đã xóa mã khuyến mãi thành công!');
    }

    setShowDeleteConfirm(null);

    // Show success notification
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Cơ bản':
        return 'bg-blue-100 text-blue-700';
      case 'VIP':
        return 'bg-purple-100 text-purple-700';
      case 'PT Kèm 1-1':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVoucherStatus = (voucher: Voucher) => {
    // Auto-calculate status based on current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse endDate (format: DD/MM/YYYY)
    const [day, month, year] = voucher.endDate.split('/').map(Number);
    const endDate = new Date(year, month - 1, day);
    endDate.setHours(0, 0, 0, 0);

    if (endDate >= today) {
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', label: 'Đang chạy' };
    } else {
      return { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Đã kết thúc' };
    }
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Gói tập & Khuyến mãi</h2>
        <p className="text-[var(--muted-foreground)]">Quản lý gói tập và mã giảm giá</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab('packages')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'packages'
              ? 'text-[var(--primary)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Quản lý Gói tập
          {activeTab === 'packages' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          className={`px-6 py-3 font-medium transition-all relative ${
            activeTab === 'vouchers'
              ? 'text-[var(--primary)]'
              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
          }`}
        >
          Quản lý Khuyến mãi
          {activeTab === 'vouchers' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]"></div>
          )}
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'packages' ? 'Tìm kiếm gói tập...' : 'Tìm kiếm mã khuyến mãi...'}
            className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            if (activeTab === 'packages') {
              setFormData({ name: '', price: '', duration: '1 tháng', type: 'Cơ bản' });
              setFormErrors({ name: false, price: false, benefits: false });
              setBenefits([]);
              setEditingPackage(null);
              setShowPackageModal(true);
            } else {
              setVoucherFormData({ code: '', discountType: 'percent', discountValue: '', startDate: '', endDate: '' });
              setVoucherFormErrors({ code: false, discountValue: false, startDate: false, endDate: false });
              setEditingVoucher(null);
              setShowVoucherModal(true);
            }
          }}
          className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'packages' ? 'Thêm gói tập' : 'Tạo mã mới'}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'packages' ? (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--secondary)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Tên gói</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Loại gói</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Thời hạn</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Mức giá</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Hội viên đang dùng</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-[var(--foreground)]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-[#F1F5F9] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-[var(--muted-foreground)] flex-shrink-0" />
                      <span className="font-bold text-[var(--foreground)]">{pkg.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(pkg.type)}`}>
                      {pkg.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{pkg.duration}</td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[var(--primary)]">
                      {pkg.price.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--foreground)]">{pkg.activeMembers} khách</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingPackage(pkg);
                          setBenefits(pkg.benefits);
                          setFormData({
                            name: pkg.name,
                            price: pkg.price.toString(),
                            duration: pkg.duration,
                            type: pkg.type,
                          });
                          setShowPackageModal(true);
                        }}
                        className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-[var(--foreground)]" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(pkg.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--secondary)]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Mã Khuyến Mãi</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Mức giảm</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Thời gian áp dụng</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-[var(--foreground)]">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-[var(--foreground)]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {vouchers.map((voucher) => {
                const statusInfo = getVoucherStatus(voucher);

                return (
                  <tr key={voucher.id} className="hover:bg-[#F1F5F9] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded font-mono text-sm font-bold text-[var(--foreground)]">
                          {voucher.code}
                        </span>
                        <button className="p-1 hover:bg-[var(--secondary)] rounded transition-colors">
                          <Tag className="w-4 h-4 text-[var(--muted-foreground)]" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[var(--foreground)]">
                        {voucher.discountType === 'percent'
                          ? `${voucher.discountValue}%`
                          : `${voucher.discountValue.toLocaleString('vi-VN')} VNĐ`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                      {voucher.startDate} - {voucher.endDate}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingVoucher(voucher);
                            setVoucherFormData({
                              code: voucher.code,
                              discountType: voucher.discountType,
                              discountValue: voucher.discountValue.toString(),
                              startDate: voucher.startDate,
                              endDate: voucher.endDate,
                            });
                            setShowVoucherModal(true);
                          }}
                          className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-[var(--foreground)]" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(voucher.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => {
              setShowPackageModal(false);
              setEditingPackage(null);
              setBenefits([]);
              setFormData({ name: '', price: '', duration: '1 tháng', type: 'Cơ bản' });
              setFormErrors({ name: false, price: false, benefits: false });
            }}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between sticky top-0 bg-[var(--card)]">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {editingPackage ? 'Chỉnh sửa gói tập' : 'Thêm gói tập mới'}
                </h3>
                <button
                  onClick={() => {
                    setShowPackageModal(false);
                    setEditingPackage(null);
                    setBenefits([]);
                    setFormData({ name: '', price: '', duration: '1 tháng', type: 'Cơ bản' });
                    setFormErrors({ name: false, price: false, benefits: false });
                  }}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Tên gói tập <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setFormErrors({ ...formErrors, name: false });
                      }}
                      placeholder="VD: Gói VIP 6 tháng"
                      className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00] ${
                        formErrors.name ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                    />
                    {formErrors.name && <p className="text-xs text-red-500 mt-1">Vui lòng nhập tên gói tập</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Mức giá (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => {
                        setFormData({ ...formData, price: e.target.value });
                        setFormErrors({ ...formErrors, price: false });
                      }}
                      placeholder="2500000"
                      className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00] ${
                        formErrors.price ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                    />
                    {formErrors.price && <p className="text-xs text-red-500 mt-1">Vui lòng nhập mức giá hợp lệ (lớn hơn 0)</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Thời hạn <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    >
                      <option>1 tháng</option>
                      <option>3 tháng</option>
                      <option>6 tháng</option>
                      <option>12 tháng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Loại gói
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Cơ bản' | 'VIP' | 'PT Kèm 1-1' })}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    >
                      <option>Cơ bản</option>
                      <option>VIP</option>
                      <option>PT Kèm 1-1</option>
                    </select>
                  </div>
                </div>

                {/* Benefits Section */}
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Quyền lợi gói tập <span className="text-red-500">*</span>
                  </label>
                  {formErrors.benefits && <p className="text-xs text-red-500 mb-2">Vui lòng thêm ít nhất 1 quyền lợi</p>}
                  <div className="space-y-2">
                    {benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={benefit}
                          readOnly
                          className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)]"
                        />
                        <button
                          onClick={() => handleRemoveBenefit(index)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddBenefit()}
                        placeholder="Nhập quyền lợi mới..."
                        className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                      <button
                        onClick={() => {
                          handleAddBenefit();
                          setFormErrors({ ...formErrors, benefits: false });
                        }}
                        className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowPackageModal(false);
                    setEditingPackage(null);
                    setBenefits([]);
                    setFormData({ name: '', price: '', duration: '1 tháng', type: 'Cơ bản' });
                    setFormErrors({ name: false, price: false, benefits: false });
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddPackage}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors"
                >
                  {editingPackage ? 'Cập nhật' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Voucher Modal */}
      {showVoucherModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => {
              setShowVoucherModal(false);
              setEditingVoucher(null);
              setVoucherFormData({ code: '', discountType: 'percent', discountValue: '', startDate: '', endDate: '' });
              setVoucherFormErrors({ code: false, discountValue: false, startDate: false, endDate: false });
            }}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-2xl w-full max-w-lg">
              {/* Header */}
              <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                  {editingVoucher ? 'Chỉnh sửa mã khuyến mãi' : 'Tạo mã khuyến mãi mới'}
                </h3>
                <button
                  onClick={() => {
                    setShowVoucherModal(false);
                    setEditingVoucher(null);
                    setVoucherFormData({ code: '', discountType: 'percent', discountValue: '', startDate: '', endDate: '' });
                    setVoucherFormErrors({ code: false, discountValue: false, startDate: false, endDate: false });
                  }}
                  className="p-2 hover:bg-[var(--secondary)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--muted-foreground)]" />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                    Mã khuyến mãi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={voucherFormData.code}
                    onChange={(e) => {
                      setVoucherFormData({ ...voucherFormData, code: e.target.value.toUpperCase() });
                      setVoucherFormErrors({ ...voucherFormErrors, code: false });
                    }}
                    placeholder="VD: SUMMER2026"
                    className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] uppercase focus:outline-none focus:ring-2 focus:ring-[#FF7A00] ${
                      voucherFormErrors.code ? 'border-red-500' : 'border-[var(--border)]'
                    }`}
                  />
                  {voucherFormErrors.code && <p className="text-xs text-red-500 mt-1">Vui lòng nhập mã khuyến mãi</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Loại giảm giá
                    </label>
                    <select
                      value={voucherFormData.discountType}
                      onChange={(e) => setVoucherFormData({ ...voucherFormData, discountType: e.target.value as 'percent' | 'fixed' })}
                      className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (VNĐ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Mức giảm <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={voucherFormData.discountValue}
                      onChange={(e) => {
                        setVoucherFormData({ ...voucherFormData, discountValue: e.target.value });
                        setVoucherFormErrors({ ...voucherFormErrors, discountValue: false });
                      }}
                      placeholder={voucherFormData.discountType === 'percent' ? '20' : '50000'}
                      className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00] ${
                        voucherFormErrors.discountValue ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                    />
                    {voucherFormErrors.discountValue && <p className="text-xs text-red-500 mt-1">Vui lòng nhập mức giảm hợp lệ</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={voucherFormData.startDate}
                      onChange={(e) => {
                        setVoucherFormData({ ...voucherFormData, startDate: e.target.value });
                        setVoucherFormErrors({ ...voucherFormErrors, startDate: false });
                      }}
                      placeholder="DD/MM/YYYY"
                      className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00] ${
                        voucherFormErrors.startDate ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                    />
                    {voucherFormErrors.startDate && <p className="text-xs text-red-500 mt-1">Vui lòng nhập ngày bắt đầu</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                      Ngày kết thúc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={voucherFormData.endDate}
                      onChange={(e) => {
                        setVoucherFormData({ ...voucherFormData, endDate: e.target.value });
                        setVoucherFormErrors({ ...voucherFormErrors, endDate: false });
                      }}
                      placeholder="DD/MM/YYYY"
                      className={`w-full px-4 py-2 bg-[var(--background)] border rounded-lg text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#FF7A00] ${
                        voucherFormErrors.endDate ? 'border-red-500' : 'border-[var(--border)]'
                      }`}
                    />
                    {voucherFormErrors.endDate && <p className="text-xs text-red-500 mt-1">Vui lòng nhập ngày kết thúc</p>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[var(--border)] flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowVoucherModal(false);
                    setEditingVoucher(null);
                    setVoucherFormData({ code: '', discountType: 'percent', discountValue: '', startDate: '', endDate: '' });
                    setVoucherFormErrors({ code: false, discountValue: false, startDate: false, endDate: false });
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddVoucher}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors"
                >
                  {editingVoucher ? 'Cập nhật' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDeleteConfirm(null)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Xác nhận xóa</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Hành động này không thể hoàn tác
                  </p>
                </div>
              </div>
              <p className="text-sm text-[var(--foreground)] mb-6">
                Bạn có chắc chắn muốn xóa {activeTab === 'packages' ? 'gói tập' : 'mã khuyến mãi'} này không?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] rounded-lg font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Xóa ngay
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn">
          <Check className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}
    </div>
  );
}
