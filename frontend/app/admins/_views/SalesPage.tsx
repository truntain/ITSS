"use client";

import { Search, Tag, Check, CreditCard, Banknote, Building2, QrCode, X, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

const API_BASE = 'http://localhost:3001';

interface Member {
  id: string;
  name: string;
  phone: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  duration: string;
}

export function SalesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getToken = () => localStorage.getItem('token') || '';

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      
      const [membersRes, packagesRes, vouchersRes] = await Promise.all([
        fetch(`${API_BASE}/customers`, { headers }),
        fetch(`${API_BASE}/memberships/packages`, { headers }),
        fetch(`${API_BASE}/payments/vouchers`, { headers })
      ]);

      if (!membersRes.ok || !packagesRes.ok || !vouchersRes.ok) {
        throw new Error('Không thể tải một số dữ liệu từ máy chủ. Vui lòng kiểm tra quyền truy cập.');
      }

      const membersData = await membersRes.json();
      const packagesData = await packagesRes.json();
      const vouchersData = await vouchersRes.json();

      setMembers(membersData.map((m: any) => ({
        id: String(m.id),
        name: m.name || m.fullName || m.email,
        phone: m.phone || ''
      })));

      setPackages(packagesData
        .filter((p: any) => p.isVisible)
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          durationMonths: Number(p.durationMonths),
          duration: `${p.durationMonths} tháng`
        }))
      );

      setVouchers(vouchersData);
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu ban đầu:', err);
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    // Reset voucher discount when package changes to avoid outdated calculations
    setVoucherCode('');
    setDiscount(0);
    setSelectedVoucherId(null);
    setVoucherError(null);
  }, [selectedPackage]);

  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.phone.includes(searchTerm)
  );

  const selectedMemberData = members.find(m => m.id === selectedMember);
  const selectedPackageData = packages.find(p => p.id === selectedPackage);

  const subtotal = selectedPackageData?.price || 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyVoucher = () => {
    setVoucherError(null);
    if (!voucherCode.trim()) {
      setDiscount(0);
      setSelectedVoucherId(null);
      return;
    }

    const foundVoucher = vouchers.find(
      v => v.code.toUpperCase() === voucherCode.trim().toUpperCase()
    );

    if (!foundVoucher) {
      setVoucherError('Mã giảm giá không tồn tại!');
      setDiscount(0);
      setSelectedVoucherId(null);
      return;
    }

    // Kiểm tra tính hợp lệ
    const now = new Date();
    const startDate = new Date(foundVoucher.startDate);
    const endDate = new Date(foundVoucher.endDate);
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (foundVoucher.status !== 'active') {
      setVoucherError(`Voucher không còn hoạt động (Trạng thái: ${foundVoucher.status})`);
      setDiscount(0);
      setSelectedVoucherId(null);
      return;
    }

    if (foundVoucher.used >= foundVoucher.total) {
      setVoucherError('Mã giảm giá đã hết lượt sử dụng!');
      setDiscount(0);
      setSelectedVoucherId(null);
      return;
    }

    if (now < startDate || now > endDate) {
      setVoucherError('Mã giảm giá đã hết hạn hoặc chưa đến thời gian áp dụng!');
      setDiscount(0);
      setSelectedVoucherId(null);
      return;
    }

    // Áp dụng chiết khấu
    let discountVal = 0;
    if (foundVoucher.discountType === 'percent') {
      discountVal = subtotal * (Number(foundVoucher.discountValue) / 100);
    } else {
      discountVal = Number(foundVoucher.discountValue);
    }

    discountVal = Math.min(discountVal, subtotal);

    setDiscount(discountVal);
    setSelectedVoucherId(foundVoucher.id);
  };

  const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return undefined;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      return undefined;
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedMember || !selectedPackage || !selectedPackageData) return;
    
    setSubmitting(true);
    setError(null);
    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      };

      // 1. Tạo Đăng ký gói tập (Membership)
      const start = new Date();
      const end = new Date();
      end.setMonth(start.getMonth() + selectedPackageData.durationMonths);

      const membershipRes = await fetch(`${API_BASE}/memberships`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: parseInt(selectedMember),
          packageId: selectedPackage,
          startDate: start.toISOString().split('T')[0],
          endDate: end.toISOString().split('T')[0],
          status: 'active'
        })
      });

      if (!membershipRes.ok) {
        const errData = await membershipRes.json();
        throw new Error(errData.message || 'Đăng ký gói tập thất bại');
      }

      const createdMembership = await membershipRes.json();

      // 2. Tạo Giao dịch thanh toán (Transaction)
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const receiptNo = `REC_${todayStr}_${Math.floor(1000 + Math.random() * 9000)}`;
      const cashierId = getUserIdFromToken();

      const paymentMethodMap = {
        cash: 'Tiền mặt',
        card: 'Quẹt thẻ',
        transfer: 'Chuyển khoản'
      };

      const transactionRes = await fetch(`${API_BASE}/payments/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          receiptNo,
          userId: parseInt(selectedMember),
          membershipId: createdMembership.id,
          packageId: selectedPackage,
          voucherId: selectedVoucherId || undefined,
          originalAmount: subtotal,
          discountAmount: discount,
          finalAmount: total,
          paymentMethod: paymentMethodMap[paymentMethod],
          cashierId: cashierId ? Number(cashierId) : undefined
        })
      });

      if (!transactionRes.ok) {
        const errData = await transactionRes.json();
        throw new Error(errData.message || 'Tạo giao dịch thanh toán thất bại');
      }

      // Thành công
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      fetchInitialData();
    } catch (err: any) {
      console.error('Lỗi khi xử lý thanh toán:', err);
      alert(err.message || 'Đã xảy ra lỗi trong quá trình thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Error Alert */}
      {error && (
        <div className="lg:col-span-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
          {error}
        </div>
      )}

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
                  <p className="text-xs text-[var(--muted-foreground)]">{member.phone}</p>
                </button>
              ))}
            </div>
          )}

          {selectedMemberData && !searchTerm && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <p className="font-medium text-[var(--foreground)]">{selectedMemberData.name}</p>
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

          {voucherError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                ✗ {voucherError}
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
              <p className="text-sm text-[var(--muted-foreground)] mb-3 text-center">Quét mã QR để thanh toán</p>
              <div className="w-48 h-48 mx-auto bg-white rounded-lg border-2 border-[var(--border)] flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-300" />
              </div>
              <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
                GymPro • {total.toLocaleString('vi-VN')}đ
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={!selectedMember || !selectedPackage || submitting || loading}
            className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg transition-colors shadow-md"
          >
            {loading ? 'Đang tải dữ liệu...' : submitting ? 'Đang thanh toán...' : 'Xác nhận & Thu tiền'}
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => !submitting && setShowConfirmModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-4">
                Xác nhận thanh toán
              </h3>
              <p className="text-[var(--foreground)] mb-6">
                Bạn có chắc chắn muốn thanh toán gói tập này không?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-white border border-[var(--border)] hover:bg-[var(--secondary)] text-[var(--foreground)] rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors disabled:bg-gray-300"
                >
                  {submitting ? 'Đang xử lý...' : 'Chắc chắn'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSuccessModal(false)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl p-6 max-w-md w-full text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                Thanh toán thành công!
              </h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Giao dịch đã được xử lý thành công
              </p>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  // Reset form
                  setSelectedMember('');
                  setSelectedPackage('');
                  setVoucherCode('');
                  setDiscount(0);
                  setSelectedVoucherId(null);
                  setVoucherError(null);
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
