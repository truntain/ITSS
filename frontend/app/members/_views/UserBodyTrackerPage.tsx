"use client";

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';

export function UserBodyTrackerPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    }
  }, []);

  const fetchRecords = (userId: number) => {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    fetch('http://localhost:3001/body-records/my-records', { headers })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch records');
        return res.json();
      })
      .then(data => {
        setRecords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching body records:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (currentUser) {
      fetchRecords(currentUser.id);
    }
  }, [currentUser]);

  const handleAddRecord = async () => {
    if (!formData.weight || !formData.bodyFat || !currentUser) {
      toast.error('Vui lòng nhập đầy đủ cân nặng và tỷ lệ mỡ!');
      return;
    }

    const token = localStorage.getItem('token');
    const payload = {
      userId: currentUser.id,
      weight: Number(formData.weight),
      bodyFat: Number(formData.bodyFat),
      recordedDate: new Date().toISOString().split('T')[0]
    };

    try {
      const response = await fetch('http://localhost:3001/body-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi khi lưu chỉ số');
      }

      toast.success('Cập nhật chỉ số cơ thể thành công!');
      setFormData({ weight: '', bodyFat: '' });
      setShowAddForm(false);
      fetchRecords(currentUser.id);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Lỗi hệ thống khi lưu chỉ số');
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-[1800px] mx-auto px-8 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#FF5A00]/20 border-t-[#FF5A00] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Pre-process metrics for Recharts area chart
  const bodyMetrics = records.map((r: any) => {
    const d = new Date(r.recordedDate);
    return {
      month: `T${d.getMonth() + 1}/${d.getFullYear()}`,
      dateStr: r.recordedDate,
      weight: Number(r.weight),
      bodyFat: Number(r.bodyFat),
    };
  });

  // Calculate stats based on records
  const currentWeight = records.length > 0 ? Number(records[records.length - 1].weight) : 0;
  const currentBodyFat = records.length > 0 ? Number(records[records.length - 1].bodyFat) : 0;
  
  const totalWeightLoss = records.length > 1 ? Number(records[0].weight) - currentWeight : 0;
  const totalBodyFatLoss = records.length > 1 ? Number(records[0].bodyFat) - currentBodyFat : 0;

  // History records in reverse order
  const historyRecords = [...records].reverse().map((item: any, i: number, arr: any[]) => {
    const nextItem = arr[i + 1];
    const weightDiff = nextItem ? Number(item.weight) - Number(nextItem.weight) : 0;
    const bodyFatDiff = nextItem ? Number(item.bodyFat) - Number(nextItem.bodyFat) : 0;

    const d = new Date(item.recordedDate);
    const formattedDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    return {
      id: item.id,
      date: formattedDate,
      weight: Number(item.weight),
      bodyFat: Number(item.bodyFat),
      change: {
        weight: Number(weightDiff.toFixed(1)),
        bodyFat: Number(bodyFatDiff.toFixed(1)),
      }
    };
  });

  return (
    <div className="max-w-[1800px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase">CHỈ SỐ CƠ THỂ</h1>
          <p className="text-[#A0A0A0]">Theo dõi và cập nhật tiến triển cơ thể của bạn</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase flex items-center gap-2 shadow-lg hover:shadow-[0_0_25px_rgba(255,90,0,0.5)] transition-all"
        >
          <Plus className="w-5 h-5" />
          Cập nhật chỉ số
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="mb-8 bg-[#242424] border-2 border-[#FF5A00] shadow-2xl p-6">
          <h3 className="text-xl font-black text-white mb-4 uppercase">Nhập chỉ số mới</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Cân nặng (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="70.5"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] focus:border-[#FF5A00] text-white transition-colors focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-2 uppercase">Body Fat (%)</label>
              <input
                type="number"
                step="0.1"
                value={formData.bodyFat}
                onChange={(e) => setFormData({ ...formData, bodyFat: e.target.value })}
                placeholder="14.5"
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] focus:border-[#FF5A00] text-white transition-colors focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-6 py-2 bg-[#1A1A1A] border border-[#333333] hover:border-[#FF5A00] text-white font-bold uppercase transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleAddRecord}
              className="px-6 py-2 bg-[#FF5A00] hover:bg-[#FF6A10] text-white font-black uppercase transition-all"
            >
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* Current Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Cân nặng hiện tại</p>
          <p className="text-5xl font-black text-white mb-1">{currentWeight > 0 ? currentWeight.toFixed(1) : '--'}</p>
          <p className="text-[#A0A0A0]">kg</p>
        </div>

        <div className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Body Fat hiện tại</p>
          <p className="text-5xl font-black text-[#FF5A00] mb-1">{currentBodyFat > 0 ? currentBodyFat.toFixed(1) : '--'}</p>
          <p className="text-[#A0A0A0]">%</p>
        </div>

        <div className="bg-[#242424] border-t-2 border-t-emerald-500 shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Đã giảm cân</p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className={`text-5xl font-black ${totalWeightLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {totalWeightLoss >= 0 ? `-${totalWeightLoss.toFixed(1)}` : `+${Math.abs(totalWeightLoss).toFixed(1)}`}
            </p>
            {totalWeightLoss >= 0 ? (
              <TrendingDown className="w-8 h-8 text-emerald-500" />
            ) : (
              <TrendingUp className="w-8 h-8 text-red-500" />
            )}
          </div>
          <p className="text-[#A0A0A0]">kg (tiến trình)</p>
        </div>

        <div className="bg-[#242424] border-t-2 border-t-emerald-500 shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Giảm Body Fat</p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className={`text-5xl font-black ${totalBodyFatLoss >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {totalBodyFatLoss >= 0 ? `-${totalBodyFatLoss.toFixed(1)}` : `+${Math.abs(totalBodyFatLoss).toFixed(1)}`}
            </p>
            {totalBodyFatLoss >= 0 ? (
              <TrendingDown className="w-8 h-8 text-emerald-500" />
            ) : (
              <TrendingUp className="w-8 h-8 text-red-500" />
            )}
          </div>
          <p className="text-[#A0A0A0]">% (tiến trình)</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-[#242424] border border-[#333333] shadow-2xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
            <Activity className="w-7 h-7 text-[#FF5A00]" />
            Biểu đồ tiến triển
          </h2>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#FF5A00]"></div>
              <span className="text-[#A0A0A0]">Cân nặng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#00D9FF]"></div>
              <span className="text-[#A0A0A0]">Body Fat</span>
            </div>
          </div>
        </div>

        <div className="h-96 flex items-center justify-center">
          {loading ? (
            <div className="text-[#A0A0A0] text-sm animate-pulse">Đang tải biểu đồ...</div>
          ) : records.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={bodyMetrics} id="body-tracker-chart">
                <defs>
                  <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF5A00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBodyFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid-body" strokeDasharray="3 3" stroke="#333333" />
                <XAxis key="xaxis-body" dataKey="month" stroke="#A0A0A0" style={{ fontSize: '14px' }} />
                <YAxis key="yaxis-body" stroke="#A0A0A0" style={{ fontSize: '14px' }} />
                <Tooltip
                  key="tooltip-body"
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #333333',
                    borderRadius: '4px',
                    color: '#FFFFFF',
                  }}
                />
                <Legend key="legend-body" />
                <Area
                  key="area-weight"
                  type="monotone"
                  dataKey="weight"
                  name="Cân nặng (kg)"
                  stroke="#FF5A00"
                  strokeWidth={4}
                  fill="url(#colorWeight)"
                />
                <Area
                  key="area-bodyfat"
                  type="monotone"
                  dataKey="bodyFat"
                  name="Body Fat (%)"
                  stroke="#00D9FF"
                  strokeWidth={4}
                  fill="url(#colorBodyFat)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-[#A0A0A0]">
              <p className="text-lg font-bold">Chưa có dữ liệu tiến triển</p>
              <p className="text-sm mt-1 text-zinc-500">Cập nhật chỉ số cân nặng và lượng mỡ lần đầu tiên để vẽ biểu đồ</p>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-[#242424] border border-[#333333] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-[#333333]">
          <h2 className="text-2xl font-black text-white uppercase">Lịch sử đo lường</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#1A1A1A]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-black text-white uppercase">Ngày đo</th>
                <th className="px-6 py-4 text-left text-sm font-black text-white uppercase">Cân nặng (kg)</th>
                <th className="px-6 py-4 text-left text-sm font-black text-white uppercase">Body Fat (%)</th>
                <th className="px-6 py-4 text-left text-sm font-black text-white uppercase">Thay đổi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#A0A0A0] text-sm animate-pulse">
                    Đang tải lịch sử đo lường...
                  </td>
                </tr>
              ) : historyRecords.length > 0 ? (
                historyRecords.map((record, index) => (
                  <tr
                    key={record.id || index}
                    className={`border-b border-[#333333] ${
                      index === 0 ? 'bg-[#FF5A00]/5' : 'hover:bg-[#1A1A1A]'
                    } transition-colors`}
                  >
                    <td className="px-6 py-4 text-white font-bold">{record.date}</td>
                    <td className="px-6 py-4 text-white text-lg font-black">{record.weight.toFixed(1)}</td>
                    <td className="px-6 py-4 text-[#FF5A00] text-lg font-black">{record.bodyFat.toFixed(1)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <div
                          className={`flex items-center gap-1 ${
                            record.change.weight < 0
                              ? 'text-emerald-500'
                              : record.change.weight > 0
                              ? 'text-red-500'
                              : 'text-zinc-500'
                          }`}
                        >
                          {record.change.weight < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : record.change.weight > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : null}
                          <span className="font-bold">
                            {record.change.weight === 0
                              ? '0.0'
                              : `${record.change.weight > 0 ? '+' : ''}${record.change.weight}`}
                            kg
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            record.change.bodyFat < 0
                              ? 'text-emerald-500'
                              : record.change.bodyFat > 0
                              ? 'text-red-500'
                              : 'text-zinc-500'
                          }`}
                        >
                          {record.change.bodyFat < 0 ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : record.change.bodyFat > 0 ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : null}
                          <span className="font-bold">
                            {record.change.bodyFat === 0
                              ? '0.0'
                              : `${record.change.bodyFat > 0 ? '+' : ''}${record.change.bodyFat}`}
                            %
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[#A0A0A0] text-sm">
                    Bạn chưa ghi nhận chỉ số cơ thể nào trong hệ thống.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
