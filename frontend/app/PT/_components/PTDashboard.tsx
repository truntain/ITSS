import { Calendar, Users, Star, CheckCircle, Clock, MapPin, MessageCircle, RefreshCw } from 'lucide-react';

export function PTDashboard() {
  const scheduleBlocks = [
    { time: '08:00 - 09:00', client: 'Nguyễn Văn An', type: 'Cardio & Giảm cân', room: 'Phòng A1', status: 'completed' },
    { time: '09:30 - 10:30', client: 'Trần Thị Bích', type: 'Yoga & Linh hoạt', room: 'Phòng Yoga', status: 'completed' },
    { time: '10:00 - 11:00', client: 'Trương Thế Thành', type: 'Tăng cơ', room: 'Khu Tạ A', status: 'in-progress' },
    { time: '14:00 - 15:00', client: 'Lê Minh Hà', type: 'CrossFit', room: 'Khu CrossFit', status: 'upcoming' },
    { time: '16:00 - 17:00', client: 'Phạm Quốc Tuấn', type: 'Tăng cơ & Sức mạnh', room: 'Khu Tạ B', status: 'upcoming' },
  ];

  const clientsNeedingAttention = [
    { id: 1, name: 'Nguyễn Văn An', avatar: '👨', package: '20 buổi PT', remaining: 2, status: 'urgent' },
    { id: 2, name: 'Trần Thị Bích', avatar: '👩', package: '15 buổi PT', remaining: 3, status: 'warning' },
    { id: 3, name: 'Lê Minh Hà', avatar: '👩', package: '10 buổi PT', remaining: 1, status: 'urgent' },
    { id: 4, name: 'Hoàng Văn Đức', avatar: '👨', package: '20 buổi PT', remaining: 4, status: 'warning' },
    { id: 5, name: 'Phạm Thị Thu', avatar: '👩', package: '12 buổi PT', remaining: 2, status: 'urgent' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-slate-100 border-slate-300 text-slate-600';
      case 'in-progress':
        return 'bg-emerald-50 border-emerald-300 text-emerald-700';
      case 'upcoming':
        return 'bg-blue-50 border-blue-300 text-blue-700';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-600';
    }
  };

  const getRemainingBadge = (remaining: number, status: string) => {
    if (status === 'urgent') {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    return 'bg-orange-100 text-orange-700 border-orange-300';
  };

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Chào Lê Minh Trọng, chúc một ngày làm việc hiệu quả!</h2>
        <p className="text-emerald-100">Hôm nay bạn có 5 buổi dạy. Hãy chuẩn bị tinh thần tốt nhất!</p>
      </div>

      {/* PT Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sessions */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Buổi dạy hôm nay</p>
          <p className="text-3xl font-bold text-slate-900">5 Buổi</p>
        </div>

        {/* Active Clients */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Hội viên đang kèm</p>
          <p className="text-3xl font-bold text-slate-900">14 Người</p>
        </div>

        {/* Average Rating */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Đánh giá trung bình</p>
          <p className="text-3xl font-bold text-slate-900 mb-2">4.9/5.0</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${star <= 4 ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Monthly Hours */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600 mb-1">Số giờ hoàn thành (Tháng)</p>
          <p className="text-3xl font-bold text-slate-900">86 Giờ</p>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Lịch trình hôm nay</h3>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock className="w-4 h-4" />
            <span>08:00 - 20:00</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {scheduleBlocks.map((block, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getStatusColor(
                block.status
              )}`}
            >
              {/* Time */}
              <div className="flex-shrink-0 w-32">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-bold text-sm">{block.time}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="w-px h-12 bg-slate-200"></div>

              {/* Session Info */}
              <div className="flex-1">
                <p className="font-bold text-slate-900 mb-1">{block.client}</p>
                <p className="text-sm text-slate-600 mb-1">{block.type}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>{block.room}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {block.status === 'completed' && (
                  <div className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
                    Đã hoàn thành
                  </div>
                )}
                {block.status === 'in-progress' && (
                  <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-xs font-medium animate-pulse">
                    Đang diễn ra
                  </div>
                )}
                {block.status === 'upcoming' && (
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                    Check-in
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clients Needing Attention */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Hội viên cần chú ý / Sắp hết hạn gói PT</h3>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Khách hàng</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Gói PT</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Số buổi còn lại</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {clientsNeedingAttention.map((client) => (
                <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  {/* Client */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                        {client.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{client.name}</p>
                      </div>
                    </div>
                  </td>

                  {/* Package */}
                  <td className="py-4 px-4">
                    <span className="text-slate-700">{client.package}</span>
                  </td>

                  {/* Remaining Sessions */}
                  <td className="py-4 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold border ${getRemainingBadge(
                        client.remaining,
                        client.status
                      )}`}
                    >
                      {client.remaining} buổi
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                        <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-emerald-50 rounded-lg transition-colors group">
                        <RefreshCw className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
