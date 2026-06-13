"use client";

import { Search, Tag, Check, CreditCard, Banknote, Building2, QrCode, X, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Mock data removed. Data loaded dynamically from the backend APIs.

export function StaffSalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | number>('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [members, setMembers] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    Promise.all([
      fetch('http://localhost:3001/users/members', { headers }).then(res => res.json()),
      fetch('http://localhost:3001/memberships/packages', { headers }).then(res => res.json())
    ])
      .then(([membersData, packagesData]) => {
        const formattedMembers = Array.isArray(membersData)
          ? membersData.map((m: any) => ({
              ...m,
              name: m.fullName
            }))
          : [];
        setMembers(formattedMembers);

        const formattedPackages = Array.isArray(packagesData)
          ? packagesData.map((pkg: any) => ({
              ...pkg,
              price: Number(pkg.price),
              duration: `${pkg.durationMonths} tháng`
            }))
          : [];
        setPackages(formattedPackages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading sales page data:', err);
        setLoading(false);
      });
  }, []);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  const selectedMemberData = members.find(m => m.id === Number(selectedMember));
  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  const subtotal = selectedPackageData?.price || 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};

    fetch(`http://localhost:3001/payments/vouchers/code/${voucherCode}`, { headers })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Mã giảm giá không hợp lệ!');
        }
        return data;
      })
      .then(voucher => {
        let calculatedDiscount = 0;
        if (voucher.discountType === 'percent') {
          calculatedDiscount = (subtotal * Number(voucher.discountValue)) / 100;
        } else {
          calculatedDiscount = Number(voucher.discountValue);
        }
        setDiscount(calculatedDiscount);
        setSelectedVoucher(voucher);
        toast.success(`Áp dụng voucher thành công! Giảm ${calculatedDiscount.toLocaleString('vi-VN')}đ`);
      })
      .catch(err => {
        setDiscount(0);
        setSelectedVoucher(null);
        toast.error(err.message || 'Không áp dụng được voucher!');
      });
  };

  const handleConfirmCheckout = () => {
    if (!selectedMember || !selectedPackage) return;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const payload = {
      userId: Number(selectedMember),
      packageId: selectedPackage,
      voucherCode: selectedVoucher ? selectedVoucher.code : undefined,
      paymentMethod
    };

    fetch('http://localhost:3001/payments/checkout', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Thanh toán thất bại!');
        }
        return data;
      })
      .then(() => {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
        toast.success('Thanh toán thành công!');
      })
      .catch(err => {
        setShowConfirmModal(false);
        toast.error(err.message || 'Có lỗi xảy ra khi thanh toán!');
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
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Side - 60% (3 columns) */}
      <div className="lg:col-span-3 space-y-6">
        {/* Customer Search */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Chọn khách hàng</h3>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Tìm kiếm tên hoặc SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
          </div>

          {searchTerm && filteredMembers.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedMember(member.id);
                    setSearchTerm('');
                  }}
                  className="w-full p-3 bg-[var(--background)] hover:bg-[var(--secondary)] rounded-lg border border-[var(--border)] transition-colors text-left"
                >
                  <p className="font-medium text-[var(--foreground)]">{member.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    HV{String(member.id).padStart(3, '0')} · {member.phone}
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedMemberData && !searchTerm && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="font-medium text-[var(--foreground)]">
                {selectedMemberData.name} (HV{String(selectedMemberData.id).padStart(3, '0')})
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">{selectedMemberData.phone}</p>
            </div>
          )}
        </div>

        {/* Package Selection */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Chọn gói tập</h3>

          <div className="grid grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedPackage === pkg.id
                    ? 'border-[var(--primary)] bg-orange-50'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/50'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-[var(--foreground)]">{pkg.name}</h4>
                  {selectedPackage === pkg.id && (
                    <div className="w-6 h-6 rounded-full bg-[var(--primary)] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <p className="text-2xl font-bold text-[var(--primary)] mb-1">
                  {pkg.price.toLocaleString('vi-VN')}đ
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">{pkg.duration}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Voucher */}
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-[var(--primary)]" />
            Mã giảm giá
          </h3>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nhập mã voucher (VD: WELCOME10)"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
            />
            <button
              onClick={handleApplyVoucher}
              className="px-6 py-2 bg-[var(--secondary)] hover:bg-[var(--muted)] text-[var(--foreground)] rounded-lg font-medium transition-colors"
            >
              Áp dụng
            </button>
          </div>

          {discount > 0 && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="text-sm text-emerald-700">
                ✓ Áp dụng thành công! Giảm {discount.toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right Side - 40% (2 columns) - Payment */}
      <div className="lg:col-span-2">
        <div className="bg-[var(--card)] rounded-lg p-6 border border-[var(--border)] shadow-sm sticky top-20">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Hóa đơn thanh toán</h3>

          {/* Bill Details */}
          <div className="space-y-4 mb-6 pb-6 border-b border-[var(--border)]">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Khách hàng</p>
              <p className="font-medium text-[var(--foreground)]">
                {selectedMemberData?.name || 'Chưa chọn'}
              </p>
            </div>

            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">Gói tập</p>
              <p className="font-medium text-[var(--foreground)]">
                {selectedPackageData?.name || 'Chưa chọn'}
              </p>
            </div>

            <div className="space-y-2 pt-4 border-t border-[var(--border)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Tạm tính</span>
                <span className="text-[var(--foreground)]">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Chiết khấu</span>
                  <span className="text-emerald-600">-{discount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--border)]">
              <span className="text-lg font-bold text-[var(--foreground)]">Tổng tiền</span>
              <span className="text-3xl font-bold text-[var(--primary)]">
                {total.toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[var(--foreground)] mb-3">Phương thức thanh toán</p>
            <div className="space-y-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'cash'
                    ? 'border-[var(--primary)] bg-orange-50'
                    : 'border-[var(--border)] bg-[var(--background)]'
                }`}
              >
                <Banknote className="w-5 h-5 text-[var(--primary)]" />
                <span className="flex-1 text-left text-[var(--foreground)]">Tiền mặt</span>
                {paymentMethod === 'cash' && <Check className="w-5 h-5 text-[var(--primary)]" />}
              </button>

              <button
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'card'
                    ? 'border-[var(--primary)] bg-orange-50'
                    : 'border-[var(--border)] bg-[var(--background)]'
                }`}
              >
                <CreditCard className="w-5 h-5 text-[var(--primary)]" />
                <span className="flex-1 text-left text-[var(--foreground)]">Quẹt thẻ</span>
                {paymentMethod === 'card' && <Check className="w-5 h-5 text-[var(--primary)]" />}
              </button>

              <button
                onClick={() => setPaymentMethod('transfer')}
                className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                  paymentMethod === 'transfer'
                    ? 'border-[var(--primary)] bg-orange-50'
                    : 'border-[var(--border)] bg-[var(--background)]'
                }`}
              >
                <Building2 className="w-5 h-5 text-[var(--primary)]" />
                <span className="flex-1 text-left text-[var(--foreground)]">Chuyển khoản</span>
                {paymentMethod === 'transfer' && <Check className="w-5 h-5 text-[var(--primary)]" />}
              </button>
            </div>
          </div>

          {/* QR Code */}
          {paymentMethod === 'transfer' && (
            <div className="mb-6 p-4 bg-[var(--background)] rounded-lg border border-[var(--border)]">
              <p className="text-sm text-[var(--muted-foreground)] mb-3 text-center">Quét mã VNPay QR để thanh toán</p>
              <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-[var(--border)] overflow-hidden flex items-center justify-center">
                <img
                  src="/vnpay_vibrant_qr.png"
                  alt="VNPay QR Code thanh toán"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
                GymPro • {total.toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedMember || !selectedPackage}
            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors shadow-md"
          >
            Xác nhận & Thu tiền
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowConfirmModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">Xác nhận thanh toán</h3>
              <p className="text-[var(--foreground)] mb-6">Bạn có chắc chắn muốn thanh toán gói tập này không?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 bg-white border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] rounded-lg font-medium transition-colors"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmCheckout}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors"
                >
                  Chắc chắn
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSuccessModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl p-6 max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">Thanh toán thành công!</h3>
              <p className="text-[var(--muted-foreground)] mb-6">Giao dịch đã được xử lý thành công</p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setSelectedMember('');
                  setSelectedPackage('');
                  setVoucherCode('');
                  setDiscount(0);
                  setSelectedVoucher(null);
                }}
                className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
