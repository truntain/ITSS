import { X } from 'lucide-react';

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
  if (!isOpen) return null;

  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${date}`;
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
                    <p className="text-3xl font-black text-[#FF5A00]">{price} VNĐ</p>
                  </div>
                </div>
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
                      `GymPro: ${packageName} (${duration}) - ${price} VNĐ`
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
                  <p className="text-5xl font-black text-[#FF5A00]">{price}</p>
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
