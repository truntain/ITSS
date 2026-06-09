import { useState } from 'react';
import { X, Calendar, Clock, User, Check } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [selectedPT, setSelectedPT] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const trainers = [
    { id: 'pt1', name: 'PT Lê Minh Trọng', specialty: 'Strength & Conditioning' },
    { id: 'pt2', name: 'Coach Nguyễn An', specialty: 'HIIT & Cardio' },
    { id: 'pt3', name: 'Instructor Mai', specialty: 'Yoga & Recovery' },
  ];

  const timeSlots = [
    { time: '06:00 - 07:00', available: true },
    { time: '07:00 - 08:00', available: true },
    { time: '08:00 - 09:00', available: false },
    { time: '09:00 - 10:00', available: true },
    { time: '17:00 - 18:00', available: true },
    { time: '18:00 - 19:00', available: false },
    { time: '19:00 - 20:00', available: true },
    { time: '20:00 - 21:00', available: true },
  ];

  const handleConfirm = () => {
    if (selectedPT && selectedDate && selectedTime) {
      console.log('Booking:', { selectedPT, selectedDate, selectedTime });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-[#242424] border-2 border-[#FF5A00] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#333333] flex items-center justify-between flex-shrink-0">
            <h3 className="text-2xl font-black text-white uppercase">Đặt lịch tập mới</h3>
            <button onClick={onClose} className="p-2 hover:bg-[#1A1A1A] rounded transition-colors">
              <X className="w-6 h-6 text-[#A0A0A0] hover:text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Select PT */}
            <div>
              <label className="flex items-center gap-2 text-white font-black uppercase mb-3">
                <User className="w-5 h-5 text-[#FF5A00]" />
                Chọn huấn luyện viên
              </label>
              <div className="grid grid-cols-1 gap-3">
                {trainers.map((trainer) => (
                  <button
                    key={trainer.id}
                    onClick={() => setSelectedPT(trainer.id)}
                    className={`p-4 border-2 text-left transition-all ${
                      selectedPT === trainer.id
                        ? 'border-[#FF5A00] bg-[#FF5A00]/10'
                        : 'border-[#333333] hover:border-[#FF5A00]/50'
                    }`}
                  >
                    <p className="font-bold text-white">{trainer.name}</p>
                    <p className="text-sm text-[#A0A0A0]">{trainer.specialty}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Select Date */}
            <div>
              <label className="flex items-center gap-2 text-white font-black uppercase mb-3">
                <Calendar className="w-5 h-5 text-[#FF5A00]" />
                Chọn ngày
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[#1A1A1A] border-2 border-[#333333] focus:border-[#FF5A00] text-white transition-colors"
              />
            </div>

            {/* Select Time */}
            <div>
              <label className="flex items-center gap-2 text-white font-black uppercase mb-3">
                <Clock className="w-5 h-5 text-[#FF5A00]" />
                Chọn khung giờ
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedTime(slot.time)}
                    className={`py-3 px-2 font-bold text-sm transition-all ${
                      !slot.available
                        ? 'bg-[#1A1A1A] border border-[#333333] text-[#666666] cursor-not-allowed opacity-50'
                        : selectedTime === slot.time
                          ? 'bg-[#FF5A00] border-2 border-[#FF5A00] text-white shadow-[0_0_15px_rgba(255,90,0,0.4)]'
                          : 'bg-[#1A1A1A] border-2 border-[#333333] hover:border-[#FF5A00] text-white'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[#A0A0A0] mt-2">
                * Khung giờ bị vô hiệu hóa là đã hết chỗ hoặc PT không có lịch
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-[#333333] flex gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedPT || !selectedDate || !selectedTime}
              className={`flex-1 px-6 py-3 font-black uppercase transition-all flex items-center justify-center gap-2 ${
                selectedPT && selectedDate && selectedTime
                  ? 'bg-[#FF5A00] hover:bg-[#FF6A10] text-white shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)]'
                  : 'bg-[#333333] text-[#666666] cursor-not-allowed'
              }`}
            >
              <Check className="w-5 h-5" />
              Xác nhận đặt lịch
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
