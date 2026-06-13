import { X, QrCode } from 'lucide-react';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionName: string;
  qrCode: string;
}

export function CheckInModal({ isOpen, onClose, sessionName, qrCode }: CheckInModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-sm w-full">
          {/* Header */}
          <div className="p-4 border-b border-[#333333] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <QrCode className="w-6 h-6 text-[#FF5A00]" />
              <h3 className="text-xl font-black text-white uppercase">Check-in</h3>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-[#1A1A1A] rounded transition-colors">
              <X className="w-5 h-5 text-[#A0A0A0] hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Session Info */}
            <div className="text-center mb-3">
              <h4 className="text-lg font-black text-[#FF5A00] mb-1">{sessionName}</h4>
              <p className="text-[#A0A0A0] text-xs">Hôm nay, 17:30 - 18:30</p>
            </div>

            {/* Instructions */}
            <div className="mb-3 p-3 bg-[#1A1A1A] border border-[#333333]">
              <p className="text-white text-center font-bold text-sm">Đưa mã này cho Lễ tân để Check-in</p>
            </div>

            {/* QR Code */}
            <div className="bg-white p-4 mb-3 flex items-center justify-center rounded-xl shadow-[0_0_20px_rgba(255,90,0,0.15)] border border-[#FF5A00]/30">
              <div className="w-48 h-48 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&color=ff5a00&data=${encodeURIComponent(qrCode)}`}
                  alt="GymPro Checkin QR"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* QR Code Text */}
            <div className="text-center mb-2">
              <p className="text-[#A0A0A0] text-xs mb-1">Mã thẻ điện tử:</p>
              <p className="text-xl font-black text-white tracking-wider">
                {(() => {
                  try {
                    const parsed = JSON.parse(qrCode);
                    if (parsed && parsed.userId) {
                      return `HV-${parsed.userId}`;
                    }
                  } catch (e) {}
                  return qrCode;
                })()}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#333333]">
            <button
              onClick={onClose}
              className="w-full px-6 py-2.5 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase shadow-lg hover:shadow-[0_0_20px_rgba(255,90,0,0.4)] text-sm transition-all"
            >
              ĐÓNG
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
