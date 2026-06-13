"use client";

import { X, Crown, Calendar, DollarSign, Check, Clock, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PackageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPackage?: {
    name: string;
    startDate?: string;
    expiryDate: string;
    daysLeft: number;
    price: string;
    benefits: string[];
    durationMonths: number;
  } | null;
}

interface PaymentRecord {
  id: number;
  transactionDate: string;
  package?: { name: string };
  finalAmount: number;
  paymentMethod: string;
}

export function PackageDetailModal({ isOpen, onClose, currentPackage }: PackageDetailModalProps) {
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
  const [totalCheckIns, setTotalCheckIns] = useState(0);
  const [loadingPayments, setLoadingPayments] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const token = localStorage.getItem('token');
    const headers: HeadersInit = { Authorization: `Bearer ${token}` };

    setLoadingPayments(true);

    // Fetch payment history
    fetch('http://localhost:3001/payments/transactions/my-history', { headers })
      .then(res => res.ok ? res.json() : [])
      .then((data: PaymentRecord[]) => setPaymentHistory(Array.isArray(data) ? data : []))
      .catch(() => setPaymentHistory([]))
      .finally(() => setLoadingPayments(false));

    // Fetch check-in stats
    fetch('http://localhost:3001/checkins/my-history', { headers })
      .then(res => res.ok ? res.json() : [])
      .then((data: any[]) => setTotalCheckIns(Array.isArray(data) ? data.length : 0))
      .catch(() => setTotalCheckIns(0));
  }, [isOpen]);

  if (!isOpen) return null;

  const packageDetails = currentPackage ? {
    name: currentPackage.name,
    status: 'Đang hoạt động',
    startDate: currentPackage.startDate
      ? (() => {
          const d = new Date(currentPackage.startDate!);
          return isNaN(d.getTime())
            ? currentPackage.startDate
            : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        })()
      : 'N/A',
    expiryDate: currentPackage.expiryDate,
    daysLeft: currentPackage.daysLeft,
    totalDays: currentPackage.durationMonths * 30 || 30,
    price: Number(currentPackage.price).toLocaleString('vi-VN'),
    benefits: currentPackage.benefits,
  } : null;

  if (!packageDetails) return null;

  const daysUsed = packageDetails.totalDays - packageDetails.daysLeft;
  const progressPercentage = Math.min(100, Math.max(0, (daysUsed / packageDetails.totalDays) * 100));

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#FF5A00]/20 to-[#242424] p-6 border-b border-[#333333] flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-[#FF5A00]" />
              <div>
                <h3 className="text-2xl font-black text-white uppercase">Chi tiết gói tập</h3>
                <p className="text-[#FF5A00] font-bold uppercase text-sm">{packageDetails.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1A1A1A] rounded transition-colors"
            >
              <X className="w-6 h-6 text-[#A0A0A0] hover:text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1A1A1A] border border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#FF5A00]" />
                  <p className="text-[#A0A0A0] text-sm uppercase font-bold">Ngày bắt đầu</p>
                </div>
                <p className="text-2xl font-black text-white">{packageDetails.startDate}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#333333] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-[#FF5A00]" />
                  <p className="text-[#A0A0A0] text-sm uppercase font-bold">Ngày kết thúc</p>
                </div>
                <p className="text-2xl font-black text-white">{packageDetails.expiryDate}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#FF5A00] p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-[#FF5A00]" />
                  <p className="text-[#A0A0A0] text-sm uppercase font-bold">Còn lại</p>
                </div>
                <p className="text-2xl font-black text-[#FF5A00]">{packageDetails.daysLeft} ngày</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-[#1A1A1A] border border-[#333333] p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-bold uppercase">Tiến độ sử dụng gói</p>
                <p className="text-[#FF5A00] font-black">{progressPercentage.toFixed(1)}%</p>
              </div>
              <div className="w-full bg-[#242424] h-4 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5A00] to-[#FF8C00] shadow-[0_0_10px_rgba(255,90,0,0.6)] transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-[#A0A0A0] text-sm mt-2">
                Đã sử dụng {daysUsed} / {packageDetails.totalDays} ngày
              </p>
            </div>

            {/* Usage Statistics */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#FF5A00]" />
                Thống kê sử dụng
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-[#1A1A1A] border border-[#333333] p-4 text-center">
                  <p className="text-3xl font-black text-cyan-500 mb-1">{totalCheckIns}</p>
                  <p className="text-[#A0A0A0] text-xs uppercase">Tổng Check-ins</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#333333] p-4 text-center">
                  <p className="text-3xl font-black text-[#FF5A00] mb-1">{packageDetails.daysLeft}</p>
                  <p className="text-[#A0A0A0] text-xs uppercase">Ngày còn lại</p>
                </div>
                <div className="bg-[#1A1A1A] border border-[#333333] p-4 text-center">
                  <p className="text-3xl font-black text-emerald-500 mb-1">{paymentHistory.length}</p>
                  <p className="text-[#A0A0A0] text-xs uppercase">Lần thanh toán</p>
                </div>
              </div>
            </div>

            {/* Benefits List */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <Check className="w-6 h-6 text-[#FF5A00]" />
                Quyền lợi gói tập
              </h4>
              <div className="bg-[#1A1A1A] border border-[#333333] p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {packageDetails.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#FF5A00] flex-shrink-0" />
                    <span className="text-white text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-[#FF5A00]" />
                Lịch sử thanh toán
              </h4>
              <div className="bg-[#1A1A1A] border border-[#333333] overflow-hidden">
                {loadingPayments ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin"></div>
                    <span className="text-[#A0A0A0] ml-3 text-sm">Đang tải...</span>
                  </div>
                ) : paymentHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-[#A0A0A0] text-sm">Chưa có lịch sử thanh toán</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-[#242424]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase">Ngày</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase">Gói tập</th>
                        <th className="px-4 py-3 text-left text-xs font-black text-white uppercase">Phương thức</th>
                        <th className="px-4 py-3 text-right text-xs font-black text-white uppercase">Số tiền</th>
                        <th className="px-4 py-3 text-center text-xs font-black text-white uppercase">Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-t border-[#333333]">
                          <td className="px-4 py-4 text-white font-bold text-sm">
                            {formatDate(payment.transactionDate)}
                          </td>
                          <td className="px-4 py-4 text-[#A0A0A0] text-sm">
                            {payment.package?.name || 'Gói tập'}
                          </td>
                          <td className="px-4 py-4 text-white text-sm">{payment.paymentMethod}</td>
                          <td className="px-4 py-4 text-right text-[#FF5A00] font-black text-sm">
                            {Number(payment.finalAmount).toLocaleString('vi-VN')} VNĐ
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded">
                              Thành công
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#242424] p-6 border-t border-[#333333] flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
