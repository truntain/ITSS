"use client";

import { Check, Crown, Zap, Star, Calendar, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { PaymentModal } from '@/components/PaymentModal';
import { PackageDetailModal } from '@/components/PackageDetailModal';

export function UserMembershipPage() {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{
    id: string;
    name: string;
    price: string;
    duration: string;
    durationMonths: number;
    isRenewal: boolean;
  } | null>(null);

  // The "display" package: most expensive registered package (name + benefits)
  // but daysLeft/expiryDate come from the active membership (cộng dồn)
  const [currentPackage, setCurrentPackage] = useState<{
    id: string;
    name: string;
    daysLeft: number;
    expiryDate: string;
    startDate: string;
    benefits: string[];
    price: string;
    durationMonths: number;
    remainingSessions?: number;
  } | null>(null);

  // All unique packages the user has ever registered (for renewal dropdown)
  const [myHistory, setMyHistory] = useState<Array<{
    packageId: string;
    packageName: string;
    price: number;
    durationMonths: number;
  }>>([]);

  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Renewal dropdown state
  const [renewalOpen, setRenewalOpen] = useState(false);
  const renewalRef = useRef<HTMLDivElement>(null);

  const formatBenefits = (benefits: any): string[] => {
    if (!benefits) return [];
    if (Array.isArray(benefits)) return benefits;
    if (typeof benefits === 'object') {
      const translations: Record<string, string> = {
        pool_access: 'Sử dụng bể bơi miễn phí',
        towel_service: 'Dịch vụ khăn tắm miễn phí',
        pt_sessions: 'buổi tập với Huấn luyện viên cá nhân (PT)',
        gym_access: 'Truy cập phòng gym 24/7',
        locker_access: 'Sử dụng tủ đồ thông minh',
        water_service: 'Nước uống miễn phí',
        sauna_access: 'Sử dụng phòng xông hơi Sauna',
      };
      const list: string[] = [];
      Object.keys(benefits).forEach(key => {
        const val = benefits[key];
        if (val === true) {
          list.push(translations[key] || key);
        } else if (typeof val === 'number' && val > 0) {
          const label = translations[key] ? `${val} ${translations[key]}` : `${key}: ${val}`;
          list.push(label);
        } else if (typeof val === 'string') {
          list.push(val);
        }
      });
      return list;
    }
    return [];
  };

  const fetchData = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 1. Fetch active membership (for daysLeft / endDate countdown)
    const activePromise = fetch('http://localhost:3001/memberships/my-active', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch active membership');
        return res.text();
      })
      .then(text => (text ? JSON.parse(text) : null));

    // 2. Fetch full membership history (to determine most expensive registered package)
    const historyPromise = fetch('http://localhost:3001/memberships/my-history', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch membership history');
        return res.json();
      });

    // 3. Fetch all available packages for the "Mua gói mới" section
    const packagesPromise = fetch('http://localhost:3001/memberships/packages', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch packages');
        return res.json();
      })
      .then((data: any[]) => {
        const visiblePackages = data.filter(p => p.isVisible).map(p => ({
          ...p,
          benefits: formatBenefits(p.benefits),
        }));
        setPackages(visiblePackages);
        return visiblePackages;
      });

    Promise.all([activePromise, historyPromise, packagesPromise])
      .then(([activeData, historyData]) => {
        // Build unique history list for renewal dropdown
        const seenPkgIds = new Set<string>();
        const historyList: typeof myHistory = [];
        (historyData as any[]).forEach((m: any) => {
          if (m.package && !seenPkgIds.has(m.package.id)) {
            seenPkgIds.add(m.package.id);
            historyList.push({
              packageId: m.package.id,
              packageName: m.package.name,
              price: parseFloat(m.package.price),
              durationMonths: m.package.durationMonths,
            });
          }
        });
        setMyHistory(historyList);

        // Need an active membership to show the "Gói của tôi" card
        if (activeData && activeData.package) {
          const endDate = new Date(activeData.endDate);
          const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
          const dStr = String(endDate.getDate()).padStart(2, '0');
          const mStr = String(endDate.getMonth() + 1).padStart(2, '0');
          const yStr = endDate.getFullYear();
          const expiryDateFormatted = `${dStr}/${mStr}/${yStr}`;

          // Find the most expensive package among ALL registered ones
          let priPkg = activeData.package;
          let maxPrice = parseFloat(activeData.package.price);
          (historyData as any[]).forEach((m: any) => {
            if (m.package) {
              const p = parseFloat(m.package.price);
              if (p > maxPrice) {
                maxPrice = p;
                priPkg = m.package;
              }
            }
          });

          setCurrentPackage({
            id: priPkg.id,
            name: priPkg.name,
            daysLeft,
            expiryDate: expiryDateFormatted,
            startDate: activeData.startDate,
            benefits: formatBenefits(priPkg.benefits),
            price: String(priPkg.price),
            durationMonths: priPkg.durationMonths,
            remainingSessions: activeData.remainingSessions,
          });
        } else {
          setCurrentPackage(null);
        }
      })
      .catch(err => {
        console.error('Error fetching membership data:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Close renewal dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (renewalRef.current && !renewalRef.current.contains(e.target as Node)) {
        setRenewalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPackageIcon = (id: string) => {
    const lower = id.toLowerCase();
    if (lower.includes('vip')) return Crown;
    if (lower.includes('premium')) return Crown;
    if (lower.includes('standard')) return Star;
    return Zap;
  };

  const handleSelectRenewalPackage = (histItem: typeof myHistory[0]) => {
    setSelectedPackage({
      id: histItem.packageId,
      name: histItem.packageName,
      price: histItem.price.toLocaleString('vi-VN'),
      duration: `${histItem.durationMonths} tháng`,
      durationMonths: histItem.durationMonths,
      isRenewal: true,
    });
    setRenewalOpen(false);
    setPaymentModalOpen(true);
  };

  const handlePurchasePackage = (pkg: any) => {
    setSelectedPackage({
      id: pkg.id,
      name: pkg.name,
      price: Number(pkg.price).toLocaleString('vi-VN'),
      duration: `${pkg.durationMonths} tháng`,
      durationMonths: pkg.durationMonths,
      isRenewal: false,
    });
    setPaymentModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-[1800px] mx-auto px-8 py-16 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin mb-4"></div>
        <p className="text-[#A0A0A0]">Đang tải thông tin gói tập...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-white mb-2 uppercase">GÓI TẬP &amp; DỊCH VỤ</h1>
        <p className="text-[#A0A0A0]">Quản lý gói tập hiện tại và nâng cấp gói mới</p>
      </div>

      {/* Current Package Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-3">
          <Crown className="w-7 h-7 text-[#FF5A00]" />
          Gói của tôi
        </h2>

        {currentPackage ? (
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

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-[#A0A0A0] text-sm mb-1">Thời hạn còn lại</p>
                    <p className="text-4xl font-black text-[#FF5A00]">{currentPackage.daysLeft}</p>
                    <p className="text-white text-sm">ngày</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0] text-sm mb-1">Số buổi PT 1-1 còn lại</p>
                    <p className="text-4xl font-black text-[#FF5A00]">{currentPackage.remainingSessions ?? 0}</p>
                    <p className="text-white text-sm">buổi</p>
                  </div>
                  <div>
                    <p className="text-[#A0A0A0] text-sm mb-1">Ngày hết hạn</p>
                    <p className="text-2xl font-black text-white">{currentPackage.expiryDate}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {currentPackage.benefits && currentPackage.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-[#FF5A00] flex-shrink-0" />
                      <span className="text-white">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Actions */}
              <div className="lg:w-64 flex flex-col justify-center gap-4">
                {/* Renewal dropdown */}
                <div ref={renewalRef} className="relative">
                  <button
                    onClick={() => setRenewalOpen(prev => !prev)}
                    className="w-full px-6 py-4 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all flex items-center justify-between gap-2"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      GIA HẠN GÓI
                    </span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${renewalOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {renewalOpen && myHistory.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1A] border border-[#FF5A00]/60 shadow-2xl z-50">
                      <p className="px-4 py-2 text-[#A0A0A0] text-xs uppercase font-bold border-b border-[#333]">
                        Chọn gói để gia hạn
                      </p>
                      {myHistory.map(item => (
                        <button
                          key={item.packageId}
                          onClick={() => handleSelectRenewalPackage(item)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#FF5A00]/10 transition-colors text-left group"
                        >
                          <div>
                            <p className="text-white font-bold text-sm group-hover:text-[#FF5A00] transition-colors">
                              {item.packageName}
                            </p>
                            <p className="text-[#A0A0A0] text-xs">{item.durationMonths} tháng</p>
                          </div>
                          <p className="text-[#FF5A00] font-black text-sm">
                            {item.price.toLocaleString('vi-VN')}đ
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setDetailModalOpen(true)}
                  className="w-full px-6 py-3 bg-[#242424] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
                >
                  XEM CHI TIẾT
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#242424] border border-[#333333] p-8 text-center">
            <p className="text-[#A0A0A0] mb-4">Bạn chưa đăng ký gói tập nào hoặc gói tập đã hết hạn.</p>
            <p className="text-[#FF5A00] font-bold">Hãy chọn một trong các gói dưới đây để đăng ký tập luyện ngay!</p>
          </div>
        )}
      </div>

      {/* Available Packages */}
      <div>
        <h2 className="text-2xl font-black text-white mb-6 uppercase">Mua gói mới</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg) => {
            const Icon = getPackageIcon(pkg.id);
            const isPopular = pkg.id.toLowerCase().includes('premium');
            const isVip = pkg.id.toLowerCase().includes('vip');
            const isHighlighted = isPopular || isVip;
            return (
              <div
                key={pkg.id}
                className={`relative bg-[#242424] border-2 shadow-xl transition-all hover:scale-105 flex flex-col justify-between ${isVip
                  ? 'border-[#FF5A00] shadow-[0_0_30px_rgba(255,90,0,0.4)]'
                  : isPopular
                    ? 'border-[#FF5A00]/70 shadow-[0_0_20px_rgba(255,90,0,0.2)]'
                    : 'border-[#333333] hover:border-[#FF5A00]'
                  }`}
              >
                {isVip && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-[#FF5A00] text-white text-xs font-black uppercase shadow-lg whitespace-nowrap">
                    VIP PT 1 KÈM 1
                  </div>
                )}
                {!isVip && isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1 bg-[#FF5A00]/80 text-white text-xs font-black uppercase shadow-lg whitespace-nowrap">
                    PHỔ BIẾN NHẤT
                  </div>
                )}

                <div className="p-8 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex flex-col items-center mb-6">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${isHighlighted
                          ? 'bg-[#FF5A00] shadow-[0_0_25px_rgba(255,90,0,0.4)]'
                          : 'bg-[#1A1A1A]'
                          }`}
                      >
                        <Icon className={`w-10 h-10 ${isHighlighted ? 'text-white' : 'text-[#A0A0A0]'}`} />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase text-center break-words leading-tight">{pkg.name}</h3>
                      <p className="text-[#A0A0A0] text-sm mt-1">{pkg.durationMonths} tháng</p>
                    </div>

                    <div className="text-center mb-6 pb-6 border-b border-[#333333]">
                      <p className="text-4xl font-black text-[#FF5A00] mb-1">
                        {Number(pkg.price).toLocaleString('vi-VN')}
                      </p>
                      <p className="text-[#A0A0A0] text-sm">VNĐ</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {pkg.benefits && pkg.benefits.map((benefit: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-[#FF5A00] flex-shrink-0 mt-0.5" />
                          <span className="text-white text-sm">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchasePackage(pkg)}
                    className={`w-full py-4 font-black uppercase transition-all mt-auto ${isHighlighted
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
          packageId={selectedPackage.id}
          packageName={selectedPackage.name}
          price={selectedPackage.price}
          duration={selectedPackage.duration}
          isRenewal={selectedPackage.isRenewal}
          onPaymentSuccess={fetchData}
        />
      )}

      {/* Package Detail Modal */}
      <PackageDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        currentPackage={currentPackage}
      />
    </div>
  );
}
