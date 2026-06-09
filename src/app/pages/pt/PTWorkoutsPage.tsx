import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Calendar, User, Clock, CheckCircle, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight: string;
  notes: string;
}

interface Trainee {
  id: number;
  name: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  traineeId: number;
  traineeName: string;
  duration: string;
  status: 'active' | 'completed' | 'draft';
  createdDate: string;
  exercises: Exercise[];
}

interface PTWorkoutsPageProps {
  triggerCreatePlan?: number; // Timestamp to trigger showing plan builder
}

export function PTWorkoutsPage({ triggerCreatePlan }: PTWorkoutsPageProps = {}) {
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [planName, setPlanName] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null);
  const [filterTrainee, setFilterTrainee] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: '', sets: '', reps: '', weight: '', notes: '' },
  ]);

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([
    {
      id: '1',
      name: 'Giáo án tăng cơ tuần 1',
      traineeId: 1,
      traineeName: 'Nguyễn Văn An',
      duration: '4 tuần',
      status: 'active',
      createdDate: '2026-05-01',
      exercises: [
        { id: 'e1', name: 'Squat', sets: '4', reps: '10-12', weight: '60kg', notes: 'Giữ lưng thẳng' },
        { id: 'e2', name: 'Bench Press', sets: '3', reps: '8-10', weight: '50kg', notes: 'Hạ từ từ' },
      ],
    },
    {
      id: '2',
      name: 'Cardio & Giảm cân cơ bản',
      traineeId: 2,
      traineeName: 'Trần Thị Bích',
      duration: '6 tuần',
      status: 'active',
      createdDate: '2026-04-28',
      exercises: [
        { id: 'e3', name: 'Running', sets: '3', reps: '20 phút', weight: 'N/A', notes: 'Nhịp vừa phải' },
        { id: 'e4', name: 'Burpees', sets: '3', reps: '15', weight: 'N/A', notes: 'Động tác chuẩn' },
      ],
    },
    {
      id: '3',
      name: 'CrossFit nâng cao',
      traineeId: 4,
      traineeName: 'Hoàng Văn Đức',
      duration: '8 tuần',
      status: 'completed',
      createdDate: '2026-03-15',
      exercises: [
        { id: 'e5', name: 'Deadlift', sets: '5', reps: '5', weight: '100kg', notes: 'Kéo từ sàn' },
        { id: 'e6', name: 'Pull-up', sets: '4', reps: '8-10', weight: 'Bodyweight', notes: 'Full range' },
      ],
    },
  ]);

  const trainees: Trainee[] = [
    { id: 1, name: 'Nguyễn Văn An' },
    { id: 2, name: 'Trần Thị Bích' },
    { id: 3, name: 'Lê Minh Hà' },
    { id: 4, name: 'Hoàng Văn Đức' },
    { id: 5, name: 'Phạm Thị Thu' },
  ];

  const exerciseOptions = [
    'Squat',
    'Deadlift',
    'Bench Press',
    'Pull-up',
    'Push-up',
    'Lat Pulldown',
    'Shoulder Press',
    'Bicep Curl',
    'Tricep Extension',
    'Leg Press',
    'Lunges',
    'Plank',
    'Burpees',
    'Mountain Climbers',
    'Kettlebell Swing',
  ];

  const handleAddExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now().toString(), name: '', sets: '', reps: '', weight: '', notes: '' },
    ]);
  };

  const handleRemoveExercise = (id: string) => {
    if (exercises.length > 1) {
      setExercises(exercises.filter((ex) => ex.id !== id));
    }
  };

  const handleUpdateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const handleSavePlan = () => {
    if (!planName || !selectedTrainee) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    const trainee = trainees.find((t) => t.id === selectedTrainee);
    if (!trainee) return;

    const newPlan: WorkoutPlan = {
      id: Date.now().toString(),
      name: planName,
      traineeId: selectedTrainee,
      traineeName: trainee.name,
      duration: '4 tuần',
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      exercises: exercises.filter((ex) => ex.name), // Only include exercises with names
    };

    // Add new plan to the top of the list
    setWorkoutPlans([newPlan, ...workoutPlans]);

    // Reset form
    setPlanName('');
    setSelectedTrainee(null);
    setExercises([{ id: '1', name: '', sets: '', reps: '', weight: '', notes: '' }]);
    setShowPlanBuilder(false);

    toast.success('Đã lưu giáo án thành công!');
  };

  // Listen for trigger from header button
  useEffect(() => {
    if (triggerCreatePlan) {
      setShowPlanBuilder(true);
    }
  }, [triggerCreatePlan]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-300';
      case 'draft':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang áp dụng';
      case 'completed':
        return 'Đã hoàn thành';
      case 'draft':
        return 'Nháp';
      default:
        return status;
    }
  };

  const handleToggleStatus = (planId: string) => {
    setWorkoutPlans(
      workoutPlans.map((plan) => {
        if (plan.id === planId) {
          const newStatus = plan.status === 'active' ? 'completed' : 'active';
          toast.success(
            newStatus === 'completed'
              ? 'Đã đánh dấu hoàn thành!'
              : 'Đã khôi phục áp dụng!'
          );
          return { ...plan, status: newStatus };
        }
        return plan;
      })
    );
  };

  const filteredPlans = filterTrainee
    ? workoutPlans.filter((plan) => plan.traineeId === filterTrainee)
    : workoutPlans;

  const activePlans = filteredPlans.filter((plan) => plan.status === 'active');
  const completedPlans = filteredPlans.filter((plan) => plan.status === 'completed');

  const renderPlanCard = (plan: WorkoutPlan) => (
    <div
      key={plan.id}
      className="bg-white rounded-xl border-2 border-slate-200 hover:border-emerald-300 shadow-sm p-5 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h4>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <User className="w-4 h-4" />
            <span>{plan.traineeName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
            <Clock className="w-4 h-4" />
            <span>{plan.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(plan.createdDate).toLocaleDateString('vi-VN')}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-3 mb-3">
        <p className="text-sm font-semibold text-slate-700 mb-2">
          Bài tập: {plan.exercises.length} bài
        </p>
        <div className="space-y-1">
          {plan.exercises.slice(0, 2).map((ex) => (
            <div key={ex.id} className="text-sm text-slate-600">
              • {ex.name} - {ex.sets} sets × {ex.reps} reps
            </div>
          ))}
          {plan.exercises.length > 2 && (
            <div className="text-sm text-emerald-600 font-medium">
              + {plan.exercises.length - 2} bài tập khác
            </div>
          )}
        </div>
      </div>

      {/* Status Toggle Button */}
      <button
        onClick={() => handleToggleStatus(plan.id)}
        className={`w-full py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          plan.status === 'active'
            ? 'border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50'
            : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
      >
        {plan.status === 'active' ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Đánh dấu hoàn thành
          </>
        ) : (
          <>
            <RotateCcw className="w-4 h-4" />
            Khôi phục áp dụng
          </>
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      {!showPlanBuilder && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Chọn học viên:
              </label>
              <select
                value={filterTrainee || ''}
                onChange={(e) => setFilterTrainee(e.target.value ? Number(e.target.value) : null)}
                className="flex-1 max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Tất cả học viên</option>
                {trainees.map((trainee) => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowPlanBuilder(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Tạo giáo án mới
            </button>
          </div>
        </div>
      )}

      {/* Kanban Layout */}
      {!showPlanBuilder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Active Plans */}
          <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Đang áp dụng
                <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-bold">
                  {activePlans.length}
                </span>
              </h3>
            </div>

            {activePlans.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
                <Plus className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Chưa có giáo án đang áp dụng</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePlans.map((plan) => renderPlanCard(plan))}
              </div>
            )}
          </div>

          {/* Right Column: Completed Plans */}
          <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Đã hoàn thành
                <span className="px-3 py-1 bg-slate-500 text-white rounded-full text-sm font-bold">
                  {completedPlans.length}
                </span>
              </h3>
            </div>

            {completedPlans.length === 0 ? (
              <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-8 text-center">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Chưa có giáo án hoàn thành</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedPlans.map((plan) => renderPlanCard(plan))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Builder Form */}
      {showPlanBuilder && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Tạo giáo án mới</h2>

          <div className="space-y-6">
            {/* Plan Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Tên giáo án</label>
              <input
                type="text"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Ví dụ: Giáo án tăng cơ tuần 1, Cardio & Giảm cân cơ bản..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Assign to Trainee */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Giao cho Hội viên</label>
              <select
                value={selectedTrainee || ''}
                onChange={(e) => setSelectedTrainee(Number(e.target.value))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">-- Chọn hội viên --</option>
                {trainees.map((trainee) => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exercises */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Danh sách bài tập</label>
              <div className="space-y-4">
                {exercises.map((exercise, index) => (
                  <div
                    key={exercise.id}
                    className="bg-slate-50 border-2 border-slate-200 rounded-lg p-4 hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-slate-600">Bài tập #{index + 1}</span>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="p-1 hover:bg-red-100 rounded transition-colors"
                        disabled={exercises.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Exercise Name */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tên bài tập</label>
                        <div className="relative">
                          <input
                            type="text"
                            list={`exercises-${exercise.id}`}
                            value={exercise.name}
                            onChange={(e) => handleUpdateExercise(exercise.id, 'name', e.target.value)}
                            placeholder="Tìm kiếm hoặc nhập tên bài tập..."
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                          />
                          <datalist id={`exercises-${exercise.id}`}>
                            {exerciseOptions.map((option) => (
                              <option key={option} value={option} />
                            ))}
                          </datalist>
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Sets */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Số Sets</label>
                        <input
                          type="text"
                          value={exercise.sets}
                          onChange={(e) => handleUpdateExercise(exercise.id, 'sets', e.target.value)}
                          placeholder="Ví dụ: 3-4"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Reps */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Số Reps</label>
                        <input
                          type="text"
                          value={exercise.reps}
                          onChange={(e) => handleUpdateExercise(exercise.id, 'reps', e.target.value)}
                          placeholder="Ví dụ: 10-12"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Weight */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Trọng lượng</label>
                        <input
                          type="text"
                          value={exercise.weight}
                          onChange={(e) => handleUpdateExercise(exercise.id, 'weight', e.target.value)}
                          placeholder="Ví dụ: 50kg"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú kỹ thuật</label>
                        <input
                          type="text"
                          value={exercise.notes}
                          onChange={(e) => handleUpdateExercise(exercise.id, 'notes', e.target.value)}
                          placeholder="Chú ý kỹ thuật, tư thế..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Exercise Button */}
              <button
                onClick={handleAddExercise}
                className="w-full mt-4 px-4 py-3 border-2 border-dashed border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 rounded-lg text-slate-600 hover:text-emerald-600 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Thêm bài tập
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPlanBuilder(false)}
                className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSavePlan}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Lưu giáo án
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
