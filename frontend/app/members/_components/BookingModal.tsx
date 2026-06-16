"use client";

import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Check, Search } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [selectedPT, setSelectedPT] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

  const getPTSpecialty = (name: string) => {
    if (name.includes('Trọng')) return 'STRENGTH CONDITIONING';
    if (name.includes('An')) return 'HIIT CARDIO BLAST';
    if (name.includes('Mai')) return 'YOGA RECOVERY';
    return 'PERSONAL TRAINING';
  };

  const getPTRoom = (type: string) => {
    if (type === 'STRENGTH CONDITIONING') return 'Khu Tạ A';
    if (type === 'HIIT CARDIO BLAST') return 'Studio B';
    if (type === 'YOGA RECOVERY') return 'Phòng Yoga';
    return 'Khu CrossFit';
  };

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedSpecialty === 'ALL' || trainer.specialty === selectedSpecialty;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (!isOpen) {
      setSelectedPT('');
      setSelectedDate('');
      setSelectedTime('');
      setSearchQuery('');
      setSelectedSpecialty('ALL');
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/trainers', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch trainers');
        return res.json();
      })
      .then((data: any[]) => {
        const mapped = data
          .filter(item => item.status === 'working')
          .map(item => ({
            id: String(item.id),
            name: item.fullName,
            specialty: getPTSpecialty(item.fullName),
          }));
        setTrainers(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching trainers:', err);
        setLoading(false);
      });
  }, [isOpen]);

  const isSlotPast = (slotTime: string, dateStr: string) => {
    if (!dateStr) return false;
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    if (dateStr !== todayStr) return false;

    const [startPart] = slotTime.split('-');
    const [sh, sm] = startPart.trim().split(':').map(Number);
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    return sh < currentHour || (sh === currentHour && sm <= currentMinute);
  };

  const timeSlots = [
    { time: '06:00 - 07:00', available: !isSlotPast('06:00 - 07:00', selectedDate) },
    { time: '07:00 - 08:00', available: !isSlotPast('07:00 - 08:00', selectedDate) },
    { time: '08:00 - 09:00', available: !isSlotPast('08:00 - 09:00', selectedDate) },
    { time: '09:00 - 10:00', available: !isSlotPast('09:00 - 10:00', selectedDate) },
    { time: '17:00 - 18:00', available: !isSlotPast('17:00 - 18:00', selectedDate) },
    { time: '18:00 - 19:00', available: !isSlotPast('18:00 - 19:00', selectedDate) },
    { time: '19:00 - 20:00', available: !isSlotPast('19:00 - 20:00', selectedDate) },
    { time: '20:00 - 21:00', available: !isSlotPast('20:00 - 21:00', selectedDate) },
  ];

  const handleConfirm = () => {
    if (!selectedPT || !selectedDate || !selectedTime) {
      alert('Vui lòng chọn đầy đủ thông tin');
      return;
    }

    if (isSlotPast(selectedTime, selectedDate)) {
      alert('Không thể đặt lịch ở khung giờ đã qua trong ngày hôm nay!');
      return;
    }

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

    const trainer = trainers.find(t => t.id === selectedPT);
    const type = getPTSpecialty(trainer ? trainer.name : '');
    const room = getPTRoom(type);

    const body = {
      userId: currentUser.id,
      ptId: parseInt(selectedPT),
      date: selectedDate,
      timeSlot: selectedTime,
      type: type,
      room: room,
    };

    fetch('http://localhost:3001/bookings', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })
      .then(res => {
        if (!res.ok) throw new Error('Đăng ký lịch tập thất bại');
        return res.json();
      })
      .then(() => {
        alert('Đặt lịch tập thành công!');
        window.dispatchEvent(new Event('booking-success'));
        onClose();
        setSelectedPT('');
        setSelectedDate('');
        setSelectedTime('');
      })
      .catch(err => {
        console.error('Lỗi đặt lịch tập:', err);
        alert('Có lỗi xảy ra khi đăng ký lịch tập. Hãy đảm bảo bạn đã nhập thông tin hợp lệ.');
      });
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

              {/* Mode Toggle: Kèm PT vs Không kèm PT */}
              <div className="flex gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setSelectedPT('11')}
                  className={`flex-1 py-3 px-4 font-bold text-sm transition-all border-2 text-center flex items-center justify-center gap-2 ${
                    selectedPT === '11'
                      ? 'bg-[#FF5A00]/10 border-[#FF5A00] text-white shadow-[0_0_15px_rgba(255,90,0,0.2)]'
                      : 'bg-[#1A1A1A] border-[#333333] text-[#A0A0A0] hover:border-[#FF5A00]/50 hover:text-white'
                  }`}
                >
                  Không kèm PT (Tự tập)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedPT === '11') {
                      setSelectedPT('');
                    }
                  }}
                  className={`flex-1 py-3 px-4 font-bold text-sm transition-all border-2 text-center flex items-center justify-center gap-2 ${
                    selectedPT !== '11'
                      ? 'bg-[#FF5A00]/10 border-[#FF5A00] text-white shadow-[0_0_15px_rgba(255,90,0,0.2)]'
                      : 'bg-[#1A1A1A] border-[#333333] text-[#A0A0A0] hover:border-[#FF5A00]/50 hover:text-white'
                  }`}
                >
                  Kèm PT (Chọn HLV)
                </button>
              </div>

              {selectedPT === '11' ? (
                <div className="p-4 bg-[#1A1A1A] border-2 border-dashed border-[#333333] rounded-lg text-center text-[#A0A0A0] text-sm">
                  Bạn đã chọn tự tập luyện tại phòng tập và không có huấn luyện viên đi kèm.
                </div>
              ) : (
                <>
                  {/* Search & Filter Controls */}
                  {!loading && trainers.length > 0 && (
                    <div className="mb-4 space-y-3">
                      {/* Search Bar */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Tìm kiếm tên PT..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-[#1A1A1A] border-2 border-[#333333] focus:border-[#FF5A00] text-white transition-colors text-sm"
                        />
                        <Search className="w-4 h-4 text-[#A0A0A0] absolute left-3 top-3" />
                      </div>

                      {/* Specialty Filter Badges */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          { id: 'ALL', label: 'Tất cả' },
                          { id: 'STRENGTH CONDITIONING', label: 'Strength' },
                          { id: 'HIIT CARDIO BLAST', label: 'HIIT & Cardio' },
                          { id: 'YOGA RECOVERY', label: 'Yoga' },
                          { id: 'PERSONAL TRAINING', label: 'PT chung' }
                        ].map((spec) => (
                          <button
                            key={spec.id}
                            type="button"
                            onClick={() => setSelectedSpecialty(spec.id)}
                            className={`px-3 py-1 text-xs font-bold uppercase transition-all ${
                              selectedSpecialty === spec.id
                                ? 'bg-[#FF5A00] text-white shadow-[0_0_8px_rgba(255,90,0,0.3)]'
                                : 'bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00]/50 text-[#A0A0A0]'
                            }`}
                          >
                            {spec.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {loading ? (
                    <div className="py-4 text-center text-[#A0A0A0] text-sm">Đang tải danh sách huấn luyện viên...</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredTrainers.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 max-h-[180px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                          {filteredTrainers.map((trainer) => (
                            <button
                              key={trainer.id}
                              type="button"
                              onClick={() => setSelectedPT(trainer.id)}
                              className={`p-4 border-2 text-left transition-all flex justify-between items-center ${
                                selectedPT === trainer.id
                                  ? 'border-[#FF5A00] bg-[#FF5A00]/10'
                                  : 'border-[#333333] hover:border-[#FF5A00]/50'
                              }`}
                            >
                              <div>
                                  <p className="font-bold text-white">{trainer.name}</p>
                                  <p className="text-sm text-[#A0A0A0]">{trainer.specialty}</p>
                               </div>
                               {selectedPT === trainer.id && (
                                 <div className="w-6 h-6 rounded-full bg-[#FF5A00] flex items-center justify-center flex-shrink-0">
                                   <Check className="w-4 h-4 text-white" />
                                 </div>
                               )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-[#A0A0A0] text-sm">
                          {trainers.length > 0 ? 'Không tìm thấy PT phù hợp kết quả lọc.' : 'Không tìm thấy huấn luyện viên nào.'}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
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
