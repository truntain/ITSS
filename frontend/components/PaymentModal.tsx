import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  packageName: string;
  price: string;
  duration: string;
  isRenewal?: boolean;
  onPaymentSuccess?: () => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  packageId,
  packageName,
  price,
  duration,
  isRenewal = false,
  onPaymentSuccess,
}: PaymentModalProps) {
  const [voucherCode, setVoucherCode] = useState('');
  const [vouchersList, setVouchersList] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [showVoucherSuggestions, setShowVoucherSuggestions] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch('http://localhost:3001/payments/vouchers', { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVouchersList(data);
        }
      })
      .catch(err => console.error('Error fetching vouchers in PaymentModal:', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${date}`;
  };

  const basePrice = Number(price.replace(/\D/g, ''));
  const finalPrice = Math.max(0, basePrice - discount);

  const isVoucherActive = (v: any) => {
    if (!v) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return v.status === 'active' && todayStr >= v.startDate && todayStr <= v.endDate && v.used < v.total;
  };

  const filteredVouchers = vouchersList.filter((v) => {
    if (!isVoucherActive(v)) return false;
    if (voucherCode) {
      return v.code.toLowerCase().includes(voucherCode.toLowerCase());
    }
    return true;
  });

  const applyVoucherObj = (voucher: any) => {
    let calculatedDiscount = 0;
    if (voucher.discountType === 'percent') {
      calculatedDiscount = (basePrice * Number(voucher.discountValue)) / 100;
    } else {
      calculatedDiscount = Number(voucher.discountValue);
    }
    setDiscount(calculatedDiscount);
    setSelectedVoucher(voucher);
    toast.success(`Áp dụng voucher thành công! Giảm ${calculatedDiscount.toLocaleString('vi-VN')}đ`);
  };

  const handleApplyVoucher = () => {
    if (!voucherCode) return;
    const match = vouchersList.find(v => v.code === voucherCode.toUpperCase());
    if (match) {
      if (isVoucherActive(match)) {
        applyVoucherObj(match);
      } else {
        toast.error('Mã giảm giá đã hết hạn hoặc không hoạt động!');
      }
      return;
    }

    const token = localStorage.getItem('token');
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    fetch(`http://localhost:3001/payments/vouchers/code/${voucherCode}`, { headers })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Mã giảm giá không hợp lệ!');
        return data;
      })
      .then(voucher => {
        applyVoucherObj(voucher);
      })
      .catch(err => {
        setDiscount(0);
        setSelectedVoucher(null);
        toast.error(err.message || 'Không thể áp dụng mã giảm giá');
      });
  };

  const today = new Date();
  const startDate = today.toLocaleDateString('vi-VN');
  const endDate = new Date(today.setMonth(today.getMonth() + parseInt(duration))).toLocaleDateString('vi-VN');

  const handleConfirmPayment = () => {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
      alert('Không tìm thấy thông tin người dùng đăng nhập');
      return;
    }
    const currentUser = JSON.parse(currentUserStr);

    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const tDate = new Date();
    const startDateStr = formatYYYYMMDD(tDate);
    const end = new Date();
    end.setMonth(end.getMonth() + parseInt(duration));
    const endDateStr = formatYYYYMMDD(end);

    const body = {
      userId: currentUser.id,
      packageId: packageId,
      startDate: startDateStr,
      endDate: endDateStr,
      status: 'paused',
      voucherCode: selectedVoucher ? selectedVoucher.code : undefined,
    };

    fetch('http://localhost:3001/memberships', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Đăng ký gói tập thất bại');
        return res.json();
      })
      .then(() => {
        alert('Chờ xác nhận');
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
        onClose();
      })
      .catch((err) => {
        console.error('Lỗi thanh toán/đăng ký:', err);
        alert('Có lỗi xảy ra trong quá trình xử lý giao dịch');
      });
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
        <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[#242424] p-6 border-b border-[#333333] flex items-center justify-between z-10">
            <h3 className="text-2xl font-black text-white uppercase">
              {isRenewal ? 'GIA HẠN GÓI TẬP' : 'THANH TOÁN GÓI TẬP'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#1A1A1A] rounded transition-colors"
            >
              <X className="w-6 h-6 text-[#A0A0A0] hover:text-white" />
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Section 1: Order Summary */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF5A00]"></div>
                Thông tin đơn hàng
              </h4>
              <div className="bg-[#1A1A1A] border border-[#333333] p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[#A0A0A0] text-sm mb-1">Tên gói</p>
                    <p className="text-xl font-black text-white uppercase">{packageName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#A0A0A0] text-sm mb-1">Thời hạn</p>
                    <p className="text-lg font-bold text-[#FF5A00]">{duration}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#333333]">
                  <div>
                    <p className="text-[#A0A0A0] text-sm mb-1">Ngày bắt đầu</p>
                    <p className="text-white font-bold">{startDate}</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0] text-sm mb-1">Ngày kết thúc</p>
                    <p className="text-white font-bold">{endDate}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#333333]">
                  <div className="flex justify-between items-baseline">
                    <p className="text-[#A0A0A0] uppercase text-sm">Giá gói</p>
                    <div className="text-right">
                      {discount > 0 ? (
                        <>
                          <span className="text-sm text-[#A0A0A0] line-through mr-2">{basePrice.toLocaleString('vi-VN')} VNĐ</span>
                          <span className="text-3xl font-black text-[#FF5A00]">{finalPrice.toLocaleString('vi-VN')} VNĐ</span>
                        </>
                      ) : (
                        <span className="text-3xl font-black text-[#FF5A00]">{price} VNĐ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Voucher Section */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF5A00]"></div>
                Mã giảm giá
              </h4>
              <div className="bg-[#1A1A1A] border border-[#333333] p-6 space-y-4">
                <div className="flex gap-3 relative">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Nhập mã voucher (VD: WELCOME10)"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setShowVoucherSuggestions(true);
                      }}
                      onFocus={() => setShowVoucherSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowVoucherSuggestions(false), 200)}
                      className="w-full px-4 py-3 bg-[#242424] border border-[#333333] rounded text-white placeholder:text-[#A0A0A0] focus:outline-none focus:border-[#FF5A00]"
                    />
                    {showVoucherSuggestions && filteredVouchers.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#333333] rounded shadow-2xl z-50 max-h-48 overflow-y-auto">
                        {filteredVouchers.map((v) => (
                          <div
                            key={v.id}
                            onMouseDown={() => {
                              setVoucherCode(v.code);
                              setSelectedVoucher(v);
                              setShowVoucherSuggestions(false);
                              applyVoucherObj(v);
                            }}
                            className="px-4 py-3 text-sm hover:bg-[#242424] cursor-pointer flex justify-between items-center border-b border-[#333333] last:border-0"
                          >
                            <div>
                              <span className="font-bold text-[#FF5A00]">{v.code}</span>
                              <span className="text-xs text-[#A0A0A0] ml-2">
                                ({v.discountType === 'percent' ? `Giảm ${v.discountValue}%` : `Giảm ${Number(v.discountValue).toLocaleString('vi-VN')}đ`})
                              </span>
                            </div>
                            <span className="text-[10px] text-[#A0A0A0]">
                              HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    className="px-6 py-3 bg-[#242424] hover:bg-[#333333] border border-[#333333] text-white font-bold uppercase transition-all"
                  >
                    Áp dụng
                  </button>
                </div>
                {discount > 0 && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-900 rounded">
                    <p className="text-sm text-emerald-400 font-semibold">
                      ✓ Áp dụng thành công! Giảm {discount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section 2: QR Code Payment */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF5A00]"></div>
                Quét mã QR thanh toán
              </h4>
              <div className="bg-[#1A1A1A] border border-[#333333] p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-lg border border-[#FF5A00]/20">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                      `GymPro: ${packageName} (${duration}) - ${finalPrice.toLocaleString('vi-VN')} VNĐ`
                    )}`}
                    alt="QR Code thanh toán"
                    className="w-48 h-48"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-white font-bold text-sm">Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử</p>
                  <p className="text-[#A0A0A0] text-xs">Sau khi quét mã và chuyển khoản thành công, vui lòng nhấn "Xác nhận thanh toán" bên dưới.</p>
                </div>
              </div>
            </div>

            {/* Section 3: Total & Actions */}
            <div>
              <div className="bg-[#1A1A1A] border-2 border-[#FF5A00] p-6 mb-4">
                <div className="flex justify-between items-center">
                  <p className="text-white font-bold uppercase text-lg">Tổng thanh toán</p>
                  <p className="text-5xl font-black text-[#FF5A00]">{finalPrice.toLocaleString('vi-VN')}</p>
                </div>
                <p className="text-right text-[#A0A0A0] text-sm mt-1">VNĐ</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
                >
                  Hủy đơn hàng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPayment}
                  className="flex-1 px-6 py-4 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
                >
                  Xác nhận thanh toán
                </button>
              </div>

              <p className="text-center text-[#A0A0A0] text-xs mt-4">
                <span className="text-emerald-500">🔒</span> Thanh toán được bảo mật bởi hệ thống mã hóa SSL 256-bit
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
