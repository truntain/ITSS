import { useState, useEffect } from 'react';
import { X, QrCode, RefreshCw } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName: string;
}

export function CheckInModal({ isOpen, onClose, sessionName }: CheckInModalProps) {
  const [countdown, setCountdown] = useState(30);
  const [qrCode] = useState('GYMPRO-CHECKIN-' + Math.random().toString(36).substring(7).toUpperCase());

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset to 30 when reaches 0
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="p-6 border-b border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="w-7 h-7 text-[#FF5A00]" />
              <h3 className="text-2xl font-black text-white uppercase">Check-in</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded transition-colors">
              <X className="w-6 h-6 text-[#A0A0A0] hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8">
            {/* Session Info */}
            <div className="text-center mb-6">
              <h4 className="text-xl font-black text-[#FF5A00] mb-2">{sessionName}</h4>
              <p className="text-[#A0A0A0] text-sm">Hôm nay, 17:30 - 18:30</p>
            </div>

            {/* Instructions */}
            <div className="mb-6 p-4 bg-[#1A1A1A] border border-[#333333]">
              <p className="text-white text-center font-bold">Đưa mã này cho Lễ tân để Check-in</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-8 mb-6 flex items-center justify-center">
              {/* Placeholder QR Code - In production, use a QR library like qrcode.react */}
              <div className="w-64 h-64 border-8 border-[#FF5A00] flex items-center justify-center relative">
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-1 p-2">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="relative z-10 w-16 h-16 bg-white border-4 border-[#FF5A00] flex items-center justify-center">
                  <span className="text-2xl">🏋️</span>
                </div>
              </div>
            </div>

            {/* QR Code Text */}
            <div className="text-center mb-6">
              <p className="text-[#A0A0A0] text-xs mb-2">Mã code:</p>
              <p className="text-2xl font-black text-white tracking-wider">{qrCode}</p>
            </div>

            {/* Countdown */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] border border-[#333333] rounded-full">
                <RefreshCw className="w-4 h-4 text-[#FF5A00] animate-spin" style={{ animationDuration: '2s' }} />
                <p className="text-[#A0A0A0] text-sm">
                  Mã làm mới sau{' '}
                  <span className="text-[#FF5A00] font-black text-lg">{countdown}</span> giây
                </p>
              </div>
            </div>

            {/* Security Note */}
            <div className="mt-6 p-3 bg-[#FF5A00]/10 border border-[#FF5A00]/30">
              <p className="text-[#A0A0A0] text-xs text-center">
                <span className="text-[#FF5A00] font-bold">Lưu ý:</span> Mã QR này chỉ có hiệu lực trong 30
                giây để đảm bảo an toàn
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#333333]">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
