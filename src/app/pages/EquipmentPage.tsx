import { Dumbbell, AlertTriangle, Wrench, X, Camera, Plus, Check } from 'lucide-react';
import { useState } from 'react';

interface Equipment {
  id: string;
  name: string;
  category: string;
  image: string;
  status: 'available' | 'maintenance';
  location: string;
  lastMaintenance: string;
  priority?: 'normal' | 'urgent';
  issueDescription?: string;
  issueImage?: string;
}

const initialEquipments: Equipment[] = [
  { id: 'EQ001', name: 'Máy chạy bộ Impulse PT300', category: 'Cardio', image: '🏃', status: 'available', location: 'Khu Cardio A', lastMaintenance: '01/04/2026' },
  { id: 'EQ002', name: 'Ghế tập ngực đa năng', category: 'Tạ & Sức mạnh', image: '💪', status: 'available', location: 'Khu Tạ B', lastMaintenance: '15/03/2026' },
  { id: 'EQ003', name: 'Xe đạp Spin Bike S500', category: 'Cardio', image: '🚴', status: 'maintenance', location: 'Khu Cardio A', lastMaintenance: '10/05/2026', priority: 'normal', issueDescription: 'Bàn đạp bị lỏng, cần thay thế vít' },
  { id: 'EQ004', name: 'Máy kéo xô CrossFit', category: 'CrossFit', image: '⚡', status: 'available', location: 'Khu CrossFit', lastMaintenance: '20/02/2026' },
  { id: 'EQ005', name: 'Tạ đơn Dumbbells Set', category: 'Tạ & Sức mạnh', image: '🏋️', status: 'available', location: 'Khu Tạ A', lastMaintenance: '05/04/2026' },
  { id: 'EQ006', name: 'Máy chèo thuyền Concept2', category: 'Cardio', image: '🚣', status: 'maintenance', location: 'Khu Cardio B', lastMaintenance: '25/04/2026', priority: 'urgent', issueDescription: 'Màn hình bị lỗi, không hiển thị số liệu' },
];

export function EquipmentPage() {
  const [equipments, setEquipments] = useState<Equipment[]>(initialEquipments);
  const [showReportModal, setShowReportModal] = useState<Equipment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState<Equipment | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmFixModal, setShowConfirmFixModal] = useState<Equipment | null>(null);
  const [priority, setPriority] = useState('normal');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Add Equipment Form state
  const [addFormData, setAddFormData] = useState({
    name: '',
    category: '',
    location: '',
    maintenanceDate: '',
  });

  const [addFormErrors, setAddFormErrors] = useState({
    name: false,
    category: false,
    location: false,
  });

  const handleAddEquipment = () => {
    // Validate form
    const errors = {
      name: !addFormData.name.trim(),
      category: !addFormData.category,
      location: !addFormData.location,
    };

    setAddFormErrors(errors);

    // Check if there are any errors
    if (Object.values(errors).some(error => error)) {
      return;
    }

    // Generate equipment ID
    const newId = `EQ${String(equipments.length + 1).padStart(3, '0')}`;

    // Equipment emoji mapping
    const categoryEmojis: Record<string, string> = {
      'Cardio': '🏃',
      'Tạ & Sức mạnh': '💪',
      'Lớp học': '🧘',
      'Khác': '🏋️',
    };

    const newEquipment: Equipment = {
      id: newId,
      name: addFormData.name.trim(),
      category: addFormData.category,
      image: categoryEmojis[addFormData.category] || '🏋️',
      status: 'available',
      location: addFormData.location,
      lastMaintenance: addFormData.maintenanceDate || new Date().toLocaleDateString('vi-VN'),
    };

    // Add to beginning of array
    setEquipments([newEquipment, ...equipments]);

    // Close modal
    setShowAddModal(false);

    // Reset form
    setAddFormData({ name: '', category: '', location: '', maintenanceDate: '' });
    setAddFormErrors({ name: false, category: false, location: false });

    // Show success notification
    setSuccessMessage('Đã thêm thiết bị mới thành công!');
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleSubmitReport = () => {
    // Validate description
    if (!description.trim()) {
      setDescriptionError(true);
      return;
    }

    if (!showReportModal) return;

    // Update equipment status to maintenance with priority and description
    setEquipments(equipments.map(eq =>
      eq.id === showReportModal.id
        ? { ...eq, status: 'maintenance', priority: priority as 'normal' | 'urgent', issueDescription: description.trim() }
        : eq
    ));

    // Close modal
    setShowReportModal(null);

    // Reset form
    setPriority('normal');
    setDescription('');
    setDescriptionError(false);

    // Show success notification
    setSuccessMessage('Đã ghi nhận sự cố thành công!');
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleConfirmFix = () => {
    if (!showConfirmFixModal) return;

    // Update equipment status back to available and clear maintenance data
    setEquipments(equipments.map(eq =>
      eq.id === showConfirmFixModal.id
        ? { ...eq, status: 'available', priority: undefined, issueDescription: undefined, issueImage: undefined, lastMaintenance: new Date().toLocaleDateString('vi-VN') }
        : eq
    ));

    // Close modal
    setShowConfirmFixModal(null);

    // Show success notification
    setSuccessMessage('Thiết bị đã được chuyển về trạng thái Sẵn sàng!');
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const getFilteredEquipments = (status: 'available' | 'maintenance') => {
    return equipments.filter(eq => {
      const matchStatus = eq.status === status;
      const matchLocation = locationFilter === 'all' || eq.location === locationFilter;

      // Priority filter only applies to maintenance items
      let matchPriority = true;
      if (status === 'maintenance' && priorityFilter !== 'all') {
        matchPriority = eq.priority === priorityFilter;
      }

      return matchStatus && matchLocation && matchPriority;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return { bg: 'bg-emerald-500', text: 'text-white', label: 'Sẵn sàng' };
      case 'maintenance':
        return { bg: 'bg-orange-500', text: 'text-white', label: 'Đang bảo trì' };
      default:
        return { bg: 'bg-gray-500', text: 'text-white', label: 'Không xác định' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--foreground)]">Quản lý thiết bị</h2>
          <p className="text-[var(--muted-foreground)]">Danh sách máy tập và trạng thái</p>
        </div>

        <button
          onClick={() => {
            setAddFormData({ name: '', category: '', location: '', maintenanceDate: '' });
            setAddFormErrors({ name: false, category: false, location: false });
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md"
        >
          <Plus className="w-5 h-5" />
          Thêm thiết bị
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-100 rounded-lg border border-emerald-200">
          <p className="text-sm text-emerald-700 mb-1">Sẵn sàng</p>
          <p className="text-2xl font-bold text-emerald-900">
            {equipments.filter(e => e.status === 'available').length}
          </p>
        </div>
        <div className="p-4 bg-orange-100 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-700 mb-1">Đang bảo trì</p>
          <p className="text-2xl font-bold text-orange-900">
            {equipments.filter(e => e.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Vị trí</label>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
          >
            <option value="all">Tất cả vị trí</option>
            <option value="Khu Cardio A">Khu Cardio A</option>
            <option value="Khu Cardio B">Khu Cardio B</option>
            <option value="Khu Tạ A">Khu Tạ A</option>
            <option value="Khu Tạ B">Khu Tạ B</option>
            <option value="Phòng Yoga">Phòng Yoga</option>
            <option value="Khu CrossFit">Khu CrossFit</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">Mức độ ưu tiên</label>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="normal">Bình thường</option>
            <option value="urgent">Ưu tiên sửa chữa</option>
          </select>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Equipment */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
            Sẵn sàng ({getFilteredEquipments('available').length})
          </h3>
          <div className="space-y-4">
            {getFilteredEquipments('available').map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Image */}
                <div className="h-32 bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-5xl relative">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {equipment.image}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1">{equipment.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{equipment.category}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Vị trí:</span>
                      <span className="font-medium text-slate-900">{equipment.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-500">Bảo trì: {equipment.lastMaintenance}</span>
                    </div>
                  </div>

                  {/* Report Issue Button */}
                  <button
                    onClick={() => {
                      setShowReportModal(equipment);
                      setPriority('normal');
                      setDescription('');
                      setDescriptionError(false);
                    }}
                    className="w-full py-2 bg-white border border-slate-300 hover:border-[#FF7A00] text-slate-700 hover:text-[#FF7A00] rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Báo sự cố
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Equipment */}
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
            Đang bảo trì ({getFilteredEquipments('maintenance').length})
          </h3>
          <div className="space-y-4">
            {getFilteredEquipments('maintenance').map((equipment) => (
              <div
                key={equipment.id}
                className="bg-white rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                {/* Image */}
                <div className="h-32 bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-5xl relative">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {equipment.image}
                  </div>

                  {/* Priority Tag */}
                  {equipment.priority === 'urgent' && (
                    <div className="absolute top-3 right-3">
                      <div className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Ưu tiên sửa chữa
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-1">{equipment.name}</h3>
                  <p className="text-sm text-slate-600 mb-3">{equipment.category}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Vị trí:</span>
                      <span className="font-medium text-slate-900">{equipment.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="w-4 h-4 text-slate-500" />
                      <span className="text-slate-500">Bảo trì: {equipment.lastMaintenance}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowDetailsModal(equipment)}
                      className="w-full py-2 bg-orange-50 border border-orange-300 hover:bg-orange-100 text-orange-700 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Xem chi tiết hỏng hóc
                    </button>
                    <button
                      onClick={() => setShowConfirmFixModal(equipment)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Đã sửa xong
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Report Issue Modal */}
      {showReportModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => {
              setShowReportModal(null);
              setPriority('normal');
              setDescription('');
              setDescriptionError(false);
            }}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xl font-bold text-slate-900">Báo cáo sự cố thiết bị</h3>
                <button
                  onClick={() => {
                    setShowReportModal(null);
                    setPriority('normal');
                    setDescription('');
                    setDescriptionError(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {/* Equipment Info (Read-only) */}
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Tên thiết bị</p>
                      <p className="text-sm font-bold text-slate-900">{showReportModal.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Vị trí</p>
                      <p className="text-sm font-bold text-slate-900">{showReportModal.location}</p>
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Mức độ ưu tiên
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50">
                      <input
                        type="radio"
                        name="priority"
                        value="normal"
                        checked={priority === 'normal'}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-4 h-4 text-[#FF7A00] focus:ring-[#FF7A00]"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Bình thường</p>
                        <p className="text-xs text-slate-600">Có thể sửa trong vài ngày</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-slate-50">
                      <input
                        type="radio"
                        name="priority"
                        value="urgent"
                        checked={priority === 'urgent'}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-4 h-4 text-red-500 focus:ring-red-500"
                      />
                      <div>
                        <p className="font-medium text-slate-900">Ưu tiên sửa chữa</p>
                        <p className="text-xs text-slate-600">Cần sửa sớm để tránh ảnh hưởng khách hàng</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setDescriptionError(false);
                    }}
                    placeholder="Mô tả chi tiết bộ phận bị hỏng, âm thanh lạ hoặc tình trạng hiện tại..."
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent resize-none ${
                      descriptionError ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {descriptionError && <p className="text-xs text-red-500 mt-1">Vui lòng nhập mô tả chi tiết sự cố</p>}
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Đính kèm ảnh (Tùy chọn)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[var(--primary)] hover:bg-slate-50 transition-all cursor-pointer">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                      Kéo thả ảnh vào đây hoặc bấm để tải lên
                    </p>
                    <p className="text-xs text-slate-500">PNG, JPG tối đa 5MB</p>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="p-4 border-t border-slate-100 flex gap-3 justify-end flex-shrink-0">
                <button
                  onClick={() => {
                    setShowReportModal(null);
                    setPriority('normal');
                    setDescription('');
                    setDescriptionError(false);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors"
                >
                  Gửi báo cáo
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Details Modal for Maintenance Equipment */}
      {showDetailsModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowDetailsModal(null)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col">
              {/* Header - Fixed */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <h3 className="text-xl font-bold text-slate-900">Chi tiết hỏng hóc</h3>
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {/* Equipment Info */}
                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-4xl">{showDetailsModal.image}</div>
                    <div>
                      <p className="font-bold text-slate-900">{showDetailsModal.name}</p>
                      <p className="text-sm text-slate-600">{showDetailsModal.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Vị trí</p>
                      <p className="text-sm font-bold text-slate-900">{showDetailsModal.location}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Bảo trì lần cuối</p>
                      <p className="text-sm font-bold text-slate-900">{showDetailsModal.lastMaintenance}</p>
                    </div>
                  </div>
                </div>

                {/* Current Priority */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Mức độ ưu tiên hiện tại
                  </label>
                  <div className={`p-3 rounded-lg border-2 ${showDetailsModal.priority === 'urgent' ? 'bg-red-50 border-red-300' : 'bg-slate-50 border-slate-300'}`}>
                    <div className="flex items-center gap-2">
                      {showDetailsModal.priority === 'urgent' && <AlertTriangle className="w-5 h-5 text-red-600" />}
                      <div>
                        <p className="font-bold text-slate-900">
                          {showDetailsModal.priority === 'urgent' ? 'Ưu tiên sửa chữa' : 'Bình thường'}
                        </p>
                        <p className="text-xs text-slate-600">
                          {showDetailsModal.priority === 'urgent'
                            ? 'Cần sửa sớm để tránh ảnh hưởng khách hàng'
                            : 'Có thể sửa trong vài ngày'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Mô tả chi tiết sự cố
                  </label>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {showDetailsModal.issueDescription || 'Không có mô tả chi tiết'}
                    </p>
                  </div>
                </div>

                {/* Issue Image (if available) */}
                {showDetailsModal.issueImage && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">
                      Ảnh đính kèm
                    </label>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <img
                        src={showDetailsModal.issueImage}
                        alt="Issue"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                )}

                {/* Change Priority Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Thay đổi mức độ ưu tiên
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setEquipments(equipments.map(eq =>
                          eq.id === showDetailsModal.id
                            ? { ...eq, priority: 'normal' }
                            : eq
                        ));
                        setShowDetailsModal({ ...showDetailsModal, priority: 'normal' });
                        setSuccessMessage('Đã cập nhật mức độ ưu tiên thành "Bình thường"');
                        setShowSuccessNotification(true);
                        setTimeout(() => setShowSuccessNotification(false), 3000);
                      }}
                      disabled={showDetailsModal.priority === 'normal'}
                      className={`w-full py-2 px-4 border-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        showDetailsModal.priority === 'normal'
                          ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'
                          : 'bg-white border-slate-300 hover:border-[#FF7A00] text-slate-700 hover:text-[#FF7A00]'
                      }`}
                    >
                      Chuyển về Bình thường
                    </button>
                    <button
                      onClick={() => {
                        setEquipments(equipments.map(eq =>
                          eq.id === showDetailsModal.id
                            ? { ...eq, priority: 'urgent' }
                            : eq
                        ));
                        setShowDetailsModal({ ...showDetailsModal, priority: 'urgent' });
                        setSuccessMessage('Đã cập nhật mức độ ưu tiên thành "Ưu tiên sửa chữa"');
                        setShowSuccessNotification(true);
                        setTimeout(() => setShowSuccessNotification(false), 3000);
                      }}
                      disabled={showDetailsModal.priority === 'urgent'}
                      className={`w-full py-2 px-4 border-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                        showDetailsModal.priority === 'urgent'
                          ? 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed'
                          : 'bg-white border-red-300 hover:bg-red-50 text-red-700'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                      Chuyển thành Ưu tiên sửa chữa
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer - Fixed */}
              <div className="p-4 border-t border-slate-100 flex gap-3 justify-end flex-shrink-0">
                <button
                  onClick={() => setShowDetailsModal(null)}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => {
              setShowAddModal(false);
              setAddFormData({ name: '', category: '', location: '', maintenanceDate: '' });
              setAddFormErrors({ name: false, category: false, location: false });
            }}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl max-w-lg w-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Thêm thiết bị mới</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddFormData({ name: '', category: '', location: '', maintenanceDate: '' });
                    setAddFormErrors({ name: false, category: false, location: false });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Equipment Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Tên thiết bị <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addFormData.name}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, name: e.target.value });
                      setAddFormErrors({ ...addFormErrors, name: false });
                    }}
                    placeholder="Ví dụ: Máy chạy bộ Impulse PT300"
                    className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent ${
                      addFormErrors.name ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {addFormErrors.name && <p className="text-xs text-red-500 mt-1">Vui lòng nhập tên thiết bị</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Loại thiết bị / Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addFormData.category}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, category: e.target.value });
                      setAddFormErrors({ ...addFormErrors, category: false });
                    }}
                    className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent ${
                      addFormErrors.category ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Chọn loại thiết bị --</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Tạ & Sức mạnh">Tạ & Sức mạnh</option>
                    <option value="Lớp học">Lớp học</option>
                    <option value="Khác">Khác</option>
                  </select>
                  {addFormErrors.category && <p className="text-xs text-red-500 mt-1">Vui lòng chọn loại thiết bị</p>}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Vị trí đặt máy <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addFormData.location}
                    onChange={(e) => {
                      setAddFormData({ ...addFormData, location: e.target.value });
                      setAddFormErrors({ ...addFormErrors, location: false });
                    }}
                    className={`w-full px-4 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent ${
                      addFormErrors.location ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    <option value="">-- Chọn vị trí --</option>
                    <option value="Khu Cardio A">Khu Cardio A</option>
                    <option value="Khu Cardio B">Khu Cardio B</option>
                    <option value="Khu Tạ A">Khu Tạ A</option>
                    <option value="Khu Tạ B">Khu Tạ B</option>
                    <option value="Phòng Yoga">Phòng Yoga</option>
                    <option value="Khu CrossFit">Khu CrossFit</option>
                    <option value="Toàn bộ">Toàn bộ</option>
                  </select>
                  {addFormErrors.location && <p className="text-xs text-red-500 mt-1">Vui lòng chọn vị trí đặt máy</p>}
                </div>

                {/* Maintenance Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Ngày bảo trì định kỳ
                  </label>
                  <input
                    type="text"
                    value={addFormData.maintenanceDate}
                    onChange={(e) => setAddFormData({ ...addFormData, maintenanceDate: e.target.value })}
                    placeholder="DD/MM/YYYY (Tùy chọn)"
                    className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A00] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setAddFormData({ name: '', category: '', location: '', maintenanceDate: '' });
                    setAddFormErrors({ name: false, category: false, location: false });
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleAddEquipment}
                  className="px-4 py-2 bg-[#FF7A00] hover:bg-[#E66D00] text-white rounded-lg font-medium transition-colors"
                >
                  Thêm mới
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirm Fix Modal */}
      {showConfirmFixModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
            onClick={() => setShowConfirmFixModal(null)}
          ></div>

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-xl border border-[var(--border)] shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Xác nhận hoàn thành</h3>
                <button
                  onClick={() => setShowConfirmFixModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-medium mb-2">
                      Xác nhận rằng thiết bị này đã sửa chữa xong?
                    </p>
                    <p className="text-sm text-slate-600">
                      Thiết bị <span className="font-bold">{showConfirmFixModal.name}</span> sẽ được chuyển về trạng thái Sẵn sàng.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmFixModal(null)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Không
                </button>
                <button
                  onClick={handleConfirmFix}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fadeIn">
          <Check className="w-5 h-5" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
