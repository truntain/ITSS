"use client";

import { useState } from 'react';
import { QrCode, Fingerprint, CheckCircle, Clock, Calendar, Shield } from 'lucide-react';

const QR_SVG = () => (
  <svg viewBox="0 0 200 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Top-left finder pattern */}
    <rect x="10" y="10" width="60" height="60" rx="4" fill="none" stroke="#FF5A00" strokeWidth="5"/>
    <rect x="24" y="24" width="32" height="32" rx="2" fill="#FF5A00"/>
    {/* Top-right finder pattern */}
    <rect x="130" y="10" width="60" height="60" rx="4" fill="none" stroke="#FF5A00" strokeWidth="5"/>
    <rect x="144" y="24" width="32" height="32" rx="2" fill="#FF5A00"/>
    {/* Bottom-left finder pattern */}
    <rect x="10" y="130" width="60" height="60" rx="4" fill="none" stroke="#FF5A00" strokeWidth="5"/>
    <rect x="24" y="144" width="32" height="32" rx="2" fill="#FF5A00"/>
    {/* Data modules */}
    <rect x="82" y="10" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="10" width="8" height="8" fill="#FF5A00"/>
    <rect x="106" y="10" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="22" width="8" height="8" fill="#FF5A00"/>
    <rect x="106" y="22" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="34" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="34" width="8" height="8" fill="#FF5A00"/>
    <rect x="106" y="34" width="8" height="8" fill="#FF5A00"/>
    {/* Middle data */}
    <rect x="10" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="22" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="46" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="58" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="118" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="130" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="154" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="178" y="82" width="8" height="8" fill="#FF5A00"/>
    <rect x="10" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="34" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="58" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="106" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="130" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="154" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="178" y="94" width="8" height="8" fill="#FF5A00"/>
    <rect x="10" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="22" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="46" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="70" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="118" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="142" y="106" width="8" height="8" fill="#FF5A00"/>
    <rect x="166" y="106" width="8" height="8" fill="#FF5A00"/>
    {/* Bottom right data */}
    <rect x="82" y="130" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="130" width="8" height="8" fill="#FF5A00"/>
    <rect x="118" y="130" width="8" height="8" fill="#FF5A00"/>
    <rect x="142" y="130" width="8" height="8" fill="#FF5A00"/>
    <rect x="166" y="130" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="142" width="8" height="8" fill="#FF5A00"/>
    <rect x="106" y="142" width="8" height="8" fill="#FF5A00"/>
    <rect x="130" y="142" width="8" height="8" fill="#FF5A00"/>
    <rect x="154" y="142" width="8" height="8" fill="#FF5A00"/>
    <rect x="178" y="142" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="154" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="154" width="8" height="8" fill="#FF5A00"/>
    <rect x="118" y="154" width="8" height="8" fill="#FF5A00"/>
    <rect x="166" y="154" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="166" width="8" height="8" fill="#FF5A00"/>
    <rect x="106" y="166" width="8" height="8" fill="#FF5A00"/>
    <rect x="130" y="166" width="8" height="8" fill="#FF5A00"/>
    <rect x="154" y="166" width="8" height="8" fill="#FF5A00"/>
    <rect x="178" y="166" width="8" height="8" fill="#FF5A00"/>
    <rect x="82" y="178" width="8" height="8" fill="#FF5A00"/>
    <rect x="94" y="178" width="8" height="8" fill="#FF5A00"/>
    <rect x="118" y="178" width="8" height="8" fill="#FF5A00"/>
    <rect x="142" y="178" width="8" height="8" fill="#FF5A00"/>
    <rect x="166" y="178" width="8" height="8" fill="#FF5A00"/>
  </svg>
);

const checkinHistory = [
  { date: 'Hôm nay', time: '07:32', duration: '1h 45m', status: 'done' },
  { date: 'T5, 05/06', time: '18:10', duration: '2h 05m', status: 'done' },
  { date: 'T3, 03/06', time: '07:15', duration: '1h 30m', status: 'done' },
  { date: 'T2, 02/06', time: '08:00', duration: '1h 20m', status: 'done' },
  { date: 'CN, 01/06', time: '09:45', duration: '2h 00m', status: 'done' },
];

export function UserCheckinPage() {
  const [activeTab, setActiveTab] = useState<'qr' | 'history'>('qr');

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Digital Card */}
        <div>
          <div className="bg-gradient-to-br from-[#1A1A1A] to-[#242424] border border-[#333333] rounded-2xl overflow-hidden shadow-2xl">
            {/* Card Header */}
            <div className="relative p-6 bg-gradient-to-r from-[#FF5A00] to-[#FF8C00] overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Thẻ hội viên</p>
                  <h2 className="text-white text-2xl font-black mt-1">GymPro</h2>
                </div>
                <Shield className="w-10 h-10 text-white/80" />
              </div>
              <div className="relative mt-4">
                <p className="text-white text-xl font-black">Trương Thế Thành</p>
                <p className="text-white/80 text-sm font-medium">ID: HV-2024-00891</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="p-6 flex flex-col items-center">
              <div className="bg-[#1A1A1A] border-2 border-[#FF5A00]/30 rounded-xl p-5 w-56 h-56 shadow-[0_0_30px_rgba(255,90,0,0.15)]">
                <QR_SVG />
              </div>
              <p className="mt-4 text-[#A0A0A0] text-sm text-center">
                Xuất trình mã này tại quầy lễ tân để check-in
              </p>

              {/* Member Info */}
              <div className="mt-6 w-full grid grid-cols-3 gap-3">
                <div className="bg-[#2A2A2A] rounded-xl p-3 text-center">
                  <p className="text-[#FF5A00] font-black text-lg">Premium</p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Gói hiện tại</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl p-3 text-center">
                  <p className="text-white font-black text-lg">127</p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Ngày còn lại</p>
                </div>
                <div className="bg-[#2A2A2A] rounded-xl p-3 text-center">
                  <p className="text-white font-black text-lg">48</p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Buổi đã tập</p>
                </div>
              </div>

              {/* Fingerprint */}
              <div className="mt-5 w-full bg-[#2A2A2A] border border-[#333333] rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FF5A00]/10 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#FF5A00]/20">
                  <Fingerprint className="w-6 h-6 text-[#FF5A00]" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Xác thực vân tay</p>
                  <p className="text-[#A0A0A0] text-xs mt-0.5">Đặt ngón tay lên máy quét tại quầy</p>
                </div>
                <div className="ml-auto w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info + History */}
        <div className="space-y-5">
          {/* Today Status */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#FF5A00]/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-[#FF5A00]" />
              </div>
              <h3 className="text-white font-bold text-lg">Trạng thái hôm nay</h3>
            </div>
            <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-green-400 font-black text-base">Đã check-in hôm nay</p>
                <p className="text-[#A0A0A0] text-sm mt-0.5">07:32 · Thời gian tập: 1h 45m</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-[#1A1A1A] border border-[#333333] rounded-2xl p-6">
            <div className="flex gap-2 mb-5">
              {[
                { id: 'qr', label: 'Hướng dẫn sử dụng', icon: QrCode },
                { id: 'history', label: 'Lịch sử check-in', icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'qr' | 'history')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab.id
                        ? 'bg-[#FF5A00] text-white'
                        : 'bg-[#242424] text-[#A0A0A0] hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {activeTab === 'qr' ? (
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Mở thẻ điện tử', desc: 'Truy cập trang này và đảm bảo màn hình đủ sáng' },
                  { step: '2', title: 'Quét mã QR', desc: 'Đưa điện thoại vào máy quét QR tại quầy lễ tân' },
                  { step: '3', title: 'Xác nhận thành công', desc: 'Màn hình máy quét hiện thông tin và đèn xanh bật' },
                  { step: '4', title: 'Bắt đầu tập', desc: 'Hệ thống tự động ghi nhận thời gian vào tập của bạn' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4 p-3 rounded-xl hover:bg-[#242424] transition-colors">
                    <div className="w-8 h-8 bg-[#FF5A00] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-black text-sm">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-[#A0A0A0] text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {checkinHistory.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-[#242424] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/15 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-bold">{item.date}</p>
                        <p className="text-[#A0A0A0] text-xs">{item.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[#FF5A00] text-sm font-bold">{item.duration}</p>
                      <p className="text-green-400 text-xs">Hoàn thành</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
