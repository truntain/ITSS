import { X, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageName: string;
  price: string;
  duration: string;
  isRenewal?: boolean;
}

type PaymentMethod = 'momo' | 'vnpay' | 'bank' | null;

export function PaymentModal({ isOpen, onClose, packageName, price, duration, isRenewal = false }: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);

  if (!isOpen) return null;

  const today = new Date();
  const startDate = today.toLocaleDateString('vi-VN');
  const endDate = new Date(today.setMonth(today.getMonth() + parseInt(duration))).toLocaleDateString('vi-VN');

  const handleConfirmPayment = () => {
    if (!selectedMethod) {
      alert('Vui lòng chọn phương thức thanh toán');
      return;
    }
    console.log('Processing payment:', { packageName, price, method: selectedMethod });
    // Handle payment processing here
    onClose();
  };

  const paymentMethods = [
    {
      id: 'momo' as PaymentMethod,
      name: 'MoMo',
      description: 'Ví điện tử MoMo',
      icon: Smartphone,
      color: '#A50064',
    },
    {
      id: 'vnpay' as PaymentMethod,
      name: 'VNPAY',
      description: 'Cổng thanh toán VNPAY',
      icon: CreditCard,
      color: '#0066B3',
    },
    {
      id: 'bank' as PaymentMethod,
      name: 'Chuyển khoản',
      description: 'Chuyển khoản ngân hàng',
      icon: Building2,
      color: '#10B981',
    },
  ];

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

            {/* Section 2: Payment Methods */}
            <div>
              <h4 className="text-lg font-black text-white uppercase mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#FF5A00]"></div>
                Phương thức thanh toán
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;

                  return (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`relative bg-[#1A1A1A] border-2 p-6 transition-all text-left ${
                        isSelected
                          ? 'border-[#FF5A00] shadow-[0_0_25px_rgba(255,90,0,0.5)]'
                          : 'border-[#333333] hover:border-[#FF5A00]/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-[#FF5A00]' : 'bg-[#242424]'
                          }`}
                        >
                          <Icon
                            className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-[#A0A0A0]'}`}
                          />
                        </div>
                        <div className="flex-1">
                          <p className={`text-xl font-black mb-1 ${isSelected ? 'text-[#FF5A00]' : 'text-white'}`}>
                            {method.name}
                          </p>
                          <p className="text-[#A0A0A0] text-sm">{method.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#FF5A00] flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
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
                  onClick={onClose}
                  className="flex-1 px-6 py-4 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
                >
                  Hủy đơn hàng
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={!selectedMethod}
                  className={`flex-1 px-6 py-4 font-black uppercase transition-all ${
                    selectedMethod
                      ? 'bg-[#FF5A00] hover:bg-[#FF6A10] text-white shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)]'
                      : 'bg-[#333333] text-[#666666] cursor-not-allowed'
                  }`}
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
