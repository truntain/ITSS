"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Calendar, User, Clock, CheckCircle, RotateCcw, X, Eye } from 'lucide-react';
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
  exercises: any;
}

function getWorkoutDetails(exercises: any) {
  const isDayGrouped = Array.isArray(exercises) && exercises.length > 0 && 'day' in exercises[0];
  
  if (isDayGrouped) {
    let totalWorkouts = 0;
    const previewWorkouts: any[] = [];
    
    exercises.forEach((group: any) => {
      if (Array.isArray(group.workouts)) {
        totalWorkouts += group.workouts.length;
        group.workouts.forEach((w: any) => {
          previewWorkouts.push({
            name: w.name,
            sets: w.sets,
            reps: w.reps,
            rest: w.rest,
            duration: w.duration,
            speed: w.speed,
            repeat: w.repeat,
            day: group.day,
          });
        });
      }
    });
    
    return {
      total: totalWorkouts,
      preview: previewWorkouts,
      isGrouped: true,
    };
  } else {
    const list = Array.isArray(exercises) ? exercises : [];
    return {
      total: list.length,
      preview: list.map((ex: any) => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
        day: '',
      })),
      isGrouped: false,
    };
  }
}

interface PTWorkoutsPageProps {
  triggerCreatePlan?: number; // Timestamp to trigger showing plan builder
}

export function PTWorkoutsPage({ triggerCreatePlan }: PTWorkoutsPageProps = {}) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPlanBuilder, setShowPlanBuilder] = useState(false);
  const [planName, setPlanName] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<number | null>(null);
  const [filterTrainee, setFilterTrainee] = useState<number | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: '', sets: '', reps: '', weight: '', notes: '' },
  ]);

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<WorkoutPlan | null>(null);

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

  const fetchTrainees = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      const res = await fetch('http://localhost:3001/bookings/pt-bookings', { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách đặt lịch');
      const bookingsData = await res.json();

      const uniqueTraineesMap = new Map<number, any>();
      bookingsData.forEach((booking: any) => {
        if (booking.user && booking.user.id) {
          uniqueTraineesMap.set(booking.user.id, booking.user);
        }
      });

      const uniqueList = Array.from(uniqueTraineesMap.values());
      const mappedTrainees = uniqueList.map((user: any) => ({
        id: user.id,
        name: user.fullName,
      }));
      setTrainees(mappedTrainees);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách học viên:', err);
    }
  };

  const fetchWorkoutPlans = async (ptId: number) => {
    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };

      const res = await fetch(`http://localhost:3001/trainers/workout-plans/trainer/${ptId}`, { headers });
      if (!res.ok) throw new Error('Không thể tải danh sách giáo án');
      const data = await res.json();

      const mappedPlans = data.map((dbPlan: any) => {
        let exercisesData: any = [];
        let status = 'active';

        if (dbPlan.exercises) {
          if (Array.isArray(dbPlan.exercises)) {
            exercisesData = dbPlan.exercises;
          } else if (typeof dbPlan.exercises === 'object') {
            status = dbPlan.exercises.status || 'active';
            exercisesData = dbPlan.exercises.list || [];
          }
        }

        return {
          id: String(dbPlan.id),
          name: dbPlan.name,
          traineeId: dbPlan.traineeId,
          traineeName: dbPlan.trainee?.fullName || 'Học viên',
          duration: dbPlan.description || '4 tuần',
          status: status as 'active' | 'completed' | 'draft',
          createdDate: dbPlan.assignedDate || dbPlan.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          exercises: exercisesData,
        };
      });
      setWorkoutPlans(mappedPlans);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách giáo án:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        setCurrentUser(user);
        if (user?.id) {
          fetchTrainees();
          fetchWorkoutPlans(user.id);
        }
      }
    }
  }, []);

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

  const handleSavePlan = async () => {
    if (!planName || !selectedTrainee || !currentUser) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const payload = {
        ptId: currentUser.id,
        traineeId: selectedTrainee,
        name: planName,
        description: '4 tuần',
        assignedDate: new Date().toISOString().split('T')[0],
        exercises: {
          status: 'active',
          list: exercises.filter((ex) => ex.name),
        },
      };

      const res = await fetch('http://localhost:3001/trainers/workout-plans', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi khi lưu giáo án');
      }

      toast.success('Đã lưu giáo án thành công!');
      fetchWorkoutPlans(currentUser.id);

      // Reset form
      setPlanName('');
      setSelectedTrainee(null);
      setExercises([{ id: '1', name: '', sets: '', reps: '', weight: '', notes: '' }]);
      setShowPlanBuilder(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể lưu giáo án');
    }
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
  const handleToggleStatus = async (planId: string) => {
    const plan = workoutPlans.find((p) => p.id === planId);
    if (!plan || !currentUser) return;
    const newStatus = plan.status === 'active' ? 'completed' : 'active';

    try {
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const payload = {
        exercises: {
          status: newStatus,
          list: plan.exercises,
        },
      };

      const res = await fetch(`http://localhost:3001/trainers/workout-plans/${planId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Lỗi khi cập nhật trạng thái');
      }

      toast.success(
        newStatus === 'completed'
          ? 'Đã đánh dấu hoàn thành!'
          : 'Đã khôi phục áp dụng!'
      );
      fetchWorkoutPlans(currentUser.id);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Không thể cập nhật trạng thái giáo án');
    }
  };

  const filteredPlans = filterTrainee
    ? workoutPlans.filter((plan) => plan.traineeId === filterTrainee)
    : workoutPlans;

  const activePlans = filteredPlans.filter((plan) => plan.status === 'active');
  const completedPlans = filteredPlans.filter((plan) => plan.status === 'completed');

  const renderPlanCard = (plan: WorkoutPlan) => {
    const details = getWorkoutDetails(plan.exercises);
    const countLabel = details.isGrouped
      ? `${details.total} bài tập (${plan.exercises.length} buổi)`
      : `${details.total} bài tập`;

    return (
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
            Bài tập: {countLabel}
          </p>
          <div className="space-y-1">
            {details.preview.slice(0, 2).map((w, index) => {
              const hasSetsReps = w.sets !== undefined || w.reps !== undefined;
              const hasDuration = w.duration !== undefined;
              
              let desc = '';
              if (hasSetsReps && (w.sets || w.reps)) {
                desc = `${w.sets || 0} sets × ${w.reps || 0} reps`;
              } else if (hasDuration && w.duration) {
                desc = `${w.duration}${w.speed ? ` (Tốc độ ${w.speed})` : ''}`;
              } else {
                desc = 'Bài tập';
              }

              return (
                <div key={index} className="text-sm text-slate-600 truncate">
                  • {w.name} - {desc} {w.day ? `(${w.day.split(' ').slice(0, 2).join(' ')})` : ''}
                </div>
              );
            })}
            {details.total > 2 && (
              <div className="text-sm text-emerald-600 font-medium">
                + {details.total - 2} bài tập khác
              </div>
            )}
          </div>
        </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedPlanDetails(plan)}
          className="flex-1 py-2 rounded-lg font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          Chi tiết
        </button>

        <button
          onClick={() => handleToggleStatus(plan.id)}
          className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
            plan.status === 'active'
              ? 'border border-emerald-500 text-emerald-700 hover:bg-emerald-50'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white border border-emerald-500'
          }`}
        >
          {plan.status === 'active' ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Hoàn thành
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              Khôi phục
            </>
          )}
        </button>
      </div>
    </div>
  );
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-8">
        <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4 animate-none"></div>
        <p className="text-slate-500 font-medium">Đang tải danh sách giáo án...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      {!showPlanBuilder && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 whitespace-nowrap">
                Chọn học viên:
              </label>
              <select
                value={filterTrainee || ''}
                onChange={(e) => setFilterTrainee(e.target.value ? Number(e.target.value) : null)}
                className="w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
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
      {/* Detail Plan Modal */}
      {selectedPlanDetails && (() => {
        const isGrouped = Array.isArray(selectedPlanDetails.exercises) && selectedPlanDetails.exercises.length > 0 && 'day' in selectedPlanDetails.exercises[0];
        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-slate-200">
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedPlanDetails.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Học viên: <span className="font-semibold text-slate-700">{selectedPlanDetails.traineeName}</span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlanDetails(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-4 max-h-[60vh]">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Mô tả/Thời lượng</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">{selectedPlanDetails.duration}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold uppercase">Ngày tạo</p>
                    <p className="text-sm font-bold text-slate-900 mt-1">
                      {new Date(selectedPlanDetails.createdDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-800 mb-3">
                    Danh sách bài tập {isGrouped ? `(${selectedPlanDetails.exercises.length} buổi)` : ''}
                  </h4>
                  {isGrouped ? (
                    <div className="space-y-4">
                      {selectedPlanDetails.exercises.map((group: any, gIndex: number) => (
                        <div key={gIndex} className="space-y-2">
                          <div className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 flex items-center justify-between">
                            <span>{group.day}</span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                              {group.workouts?.length || 0} bài
                            </span>
                          </div>
                          <div className="space-y-2 pl-2 border-l-2 border-emerald-500">
                            {group.workouts?.map((w: any, wIndex: number) => {
                              const hasSetsReps = w.sets !== undefined || w.reps !== undefined;
                              const hasCardio = w.duration !== undefined || w.speed !== undefined || w.repeat !== undefined;
                              return (
                                <div key={wIndex} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-emerald-600">{w.name}</span>
                                    {hasSetsReps && (w.sets || w.reps) && (
                                      <span className="text-xs font-semibold text-slate-600 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
                                        {w.sets} Sets × {w.reps} Reps
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                                    {hasSetsReps && w.rest && (
                                      <div>
                                        <span className="font-semibold text-slate-500">Thời gian nghỉ:</span> {w.rest}
                                      </div>
                                    )}
                                    {hasCardio && (
                                      <>
                                        {w.duration && (
                                          <div>
                                            <span className="font-semibold text-slate-500">Thời gian:</span> {w.duration}
                                          </div>
                                        )}
                                        {w.speed && (
                                          <div>
                                            <span className="font-semibold text-slate-500">Tốc độ:</span> {w.speed}
                                          </div>
                                        )}
                                        {w.repeat && (
                                          <div className="col-span-2">
                                            <span className="font-semibold text-slate-500">Lặp lại:</span> {w.repeat}
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedPlanDetails.exercises.map((ex: any, index: number) => (
                        <div key={ex.id || index} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-bold text-emerald-600">Bài {index + 1}: {ex.name}</span>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                              {ex.sets} Sets × {ex.reps} Reps
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                            <div>
                              <span className="font-semibold text-slate-500">Trọng lượng:</span> {ex.weight || 'N/A'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-500">Ghi chú:</span> {ex.notes || 'Không có'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
                <button
                  onClick={() => setSelectedPlanDetails(null)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-sm cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
