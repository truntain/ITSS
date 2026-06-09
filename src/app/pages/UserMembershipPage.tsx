import { Check, Crown, Zap, Star, Calendar } from 'lucide-react';
import { useState } from 'react';
import { PaymentModal } from '../components/PaymentModal';
import { PackageDetailModal } from '../components/PackageDetailModal';

export function UserMembershipPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    name: string;
    price: string;
    duration: string;
    isRenewal: boolean;
  } | null>(null);

  const currentPackage = {
    name: 'PREMIUM 12 THÁNG',
    daysLeft: 185,
    expiryDate: '20/11/2026',
    benefits: [
      'Truy cập không giới hạn tất cả thiết bị',
      '20 buổi PT cá nhân/tháng',
      'Tham gia tất cả lớp Group Class',
      'Ưu tiên đặt lịch trước',
      'Tủ khóa riêng biệt',
      'Miễn phí đồ uống Protein',
    ],
  };

  const packages = [
    {
      id: 'basic',
      name: 'BASIC',
      price: '500,000',
      duration: '1 tháng',
      icon: Zap,
      popular: false,
      benefits: [
        'Truy cập thiết bị Cardio & Tạ',
        'Tập luyện vào giờ hành chính',
        '5 buổi PT cá nhân/tháng',
        'Tham gia 2 lớp Group Class/tuần',
      ],
    },
    {
      id: 'standard',
      name: 'STANDARD',
      price: '1,200,000',
      duration: '3 tháng',
      icon: Star,
      popular: false,
      benefits: [
        'Truy cập toàn bộ thiết bị',
        'Tập luyện mọi giờ',
        '10 buổi PT cá nhân/tháng',
        'Tham gia không giới hạn Group Class',
        'Tủ khóa cá nhân',
      ],
    },
    {
      id: 'premium',
      name: 'PREMIUM',
      price: '4,000,000',
      duration: '12 tháng',
      icon: Crown,
      popular: true,
      benefits: [
        'Truy cập không giới hạn tất cả thiết bị',
        '20 buổi PT cá nhân/tháng',
        'Tham gia tất cả lớp Group Class',
        'Ưu tiên đặt lịch trước',
        'Tủ khóa riêng biệt',
        'Miễn phí đồ uống Protein',
        'Giảm 20% dịch vụ Spa & Massage',
      ],
    },
  ];

  const handleRenewPackage = () => {
    setSelectedPackage({
      name: currentPackage.name,
      price: '4,000,000',
      duration: '12 tháng',
      isRenewal: true,
    });
    setPaymentModalOpen(true);
  };

  const handlePurchasePackage = (pkg: typeof packages[0]) => {
    setSelectedPackage({
      name: pkg.name,
      price: pkg.price,
      duration: pkg.duration,
      isRenewal: false,
    });
    setPaymentModalOpen(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 uppercase">GÓI TẬP & DỊCH VỤ</h1>
        <p className="text-[#A0A0A0]">Quản lý gói tập hiện tại và nâng cấp gói mới</p>
      </div>

      {/* Current Package Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-3">
          <Crown className="w-7 h-7 text-[#FF5A00]" />
          Gói của tôi
        </h2>

        <div className="bg-gradient-to-r from-[#FF5A00]/20 to-[#242424] border-2 border-[#FF5A00] shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left: Package Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Crown className="w-12 h-12 text-[#FF5A00]" />
                <div>
                  <h3 className="text-3xl font-black text-white">{currentPackage.name}</h3>
                  <p className="text-[#FF5A00] font-bold uppercase text-sm">Đang hoạt động</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-[#A0A0A0] text-sm mb-1">Thời hạn còn lại</p>
                  <p className="text-4xl font-black text-[#FF5A00]">{currentPackage.daysLeft}</p>
                  <p className="text-white text-sm">ngày</p>
                </div>
                <div>
                  <p className="text-[#A0A0A0] text-sm mb-1">Ngày hết hạn</p>
                  <p className="text-2xl font-black text-white">{currentPackage.expiryDate}</p>
                </div>
              </div>

              <div className="space-y-3">
                {currentPackage.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#FF5A00] flex-shrink-0" />
                    <span className="text-white">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="lg:w-64 flex flex-col justify-center gap-4">
              <button
                onClick={handleRenewPackage}
                className="w-full px-6 py-4 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                GIA HẠN GÓI
              </button>
              <button
                onClick={() => setDetailModalOpen(true)}
                className="w-full px-6 py-3 bg-[#242424] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
              >
                XEM CHI TIẾT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Available Packages */}
      <div>
        <h2 className="text-2xl font-black text-white mb-6 uppercase">Mua gói mới</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            return (
              <div
                key={pkg.id}
                className={`relative bg-[#242424] border-2 shadow-xl transition-all hover:scale-105 ${
                  pkg.popular
                    ? 'border-[#FF5A00] shadow-[0_0_30px_rgba(255,90,0,0.3)]'
                    : 'border-[#333333] hover:border-[#FF5A00]'
                }`}
              >
                {/* Popular Badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-[#FF5A00] text-white text-xs font-black uppercase shadow-lg">
                    PHỔ BIẾN NHẤT
                  </div>
                )}

                <div className="p-8">
                  {/* Icon & Name */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                        pkg.popular
                          ? 'bg-[#FF5A00] shadow-[0_0_25px_rgba(255,90,0,0.4)]'
                          : 'bg-[#1A1A1A]'
                      }`}
                    >
                      <Icon className={`w-10 h-10 ${pkg.popular ? 'text-white' : 'text-[#A0A0A0]'}`} />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase">{pkg.name}</h3>
                    <p className="text-[#A0A0A0] text-sm">{pkg.duration}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center mb-6 pb-6 border-b border-[#333333]">
                    <p className="text-5xl font-black text-[#FF5A00] mb-1">{pkg.price}</p>
                    <p className="text-[#A0A0A0] text-sm">VNĐ</p>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3 mb-8">
                    {pkg.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-[#FF5A00] flex-shrink-0 mt-0.5" />
                        <span className="text-white text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handlePurchasePackage(pkg)}
                    className={`w-full py-4 font-black uppercase transition-all ${
                      pkg.popular
                        ? 'bg-[#FF5A00] hover:bg-[#FF6A10] text-white shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)]'
                        : 'bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white'
                    }`}
                  >
                    MUA NGAY
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-12 p-6 bg-[#242424] border border-[#333333]">
        <p className="text-[#A0A0A0] text-sm">
          <span className="text-white font-bold">Lưu ý:</span> Khi nâng cấp gói, số ngày còn lại của gói hiện
          tại sẽ được quy đổi và cộng thêm vào gói mới. Liên hệ{' '}
          <span className="text-[#FF5A00]">hotline: 1900-xxxx</span> để được tư vấn chi tiết.
        </p>
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedPackage(null);
          }}
          packageName={selectedPackage.name}
          price={selectedPackage.price}
          duration={selectedPackage.duration}
          isRenewal={selectedPackage.isRenewal}
        />
      )}

      {/* Package Detail Modal */}
      <PackageDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  );
}
