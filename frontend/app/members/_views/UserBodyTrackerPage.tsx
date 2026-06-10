"use client";

import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BodyRecord {
  id: string;
  date: string;
  weight: number;
  bodyFat: number;
  change: {
    weight: number;
    bodyFat: number;
  };
}

export function UserBodyTrackerPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    bodyFat: '',
  });

  const bodyMetrics = [
    { month: 'T12/2025', weight: 78, bodyFat: 18 },
    { month: 'T1/2026', weight: 76, bodyFat: 17 },
    { month: 'T2/2026', weight: 75, bodyFat: 16.5 },
    { month: 'T3/2026', weight: 73, bodyFat: 15.5 },
    { month: 'T4/2026', weight: 72, bodyFat: 15 },
    { month: 'T5/2026', weight: 70, bodyFat: 14 },
  ];

  const historyRecords: BodyRecord[] = [
    {
      id: '6',
      date: '17/05/2026',
      weight: 70,
      bodyFat: 14,
      change: { weight: -2, bodyFat: -1 },
    },
    {
      id: '5',
      date: '17/04/2026',
      weight: 72,
      bodyFat: 15,
      change: { weight: -1, bodyFat: -0.5 },
    },
    {
      id: '4',
      date: '17/03/2026',
      weight: 73,
      bodyFat: 15.5,
      change: { weight: -2, bodyFat: -1 },
    },
    {
      id: '3',
      date: '17/02/2026',
      weight: 75,
      bodyFat: 16.5,
      change: { weight: -1, bodyFat: -0.5 },
    },
    {
      id: '2',
      date: '17/01/2026',
      weight: 76,
      bodyFat: 17,
      change: { weight: -2, bodyFat: -1 },
    },
  ];

  const handleAddRecord = () => {
    if (formData.weight && formData.bodyFat) {
      console.log('Adding record:', formData);
      setFormData({ weight: '', bodyFat: '' });
      setShowAddForm(false);
    }
  };

  const currentWeight = bodyMetrics[bodyMetrics.length - 1].weight;
  const currentBodyFat = bodyMetrics[bodyMetrics.length - 1].bodyFat;
  const totalWeightLoss = bodyMetrics[0].weight - currentWeight;
  const totalBodyFatLoss = bodyMetrics[0].bodyFat - currentBodyFat;

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12">
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
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] focus:border-[#FF5A00] text-white transition-colors"
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
                className="w-full px-4 py-3 bg-[#1A1A1A] border border-[#333333] focus:border-[#FF5A00] text-white transition-colors"
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
          <p className="text-5xl font-black text-white mb-1">{currentWeight}</p>
          <p className="text-[#A0A0A0]">kg</p>
        </div>

        <div className="bg-[#242424] border-t-2 border-t-[#FF5A00] shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Body Fat hiện tại</p>
          <p className="text-5xl font-black text-[#FF5A00] mb-1">{currentBodyFat}</p>
          <p className="text-[#A0A0A0]">%</p>
        </div>

        <div className="bg-[#242424] border-t-2 border-t-emerald-500 shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Đã giảm cân</p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-5xl font-black text-emerald-500">{totalWeightLoss}</p>
            <TrendingDown className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-[#A0A0A0]">kg (6 tháng)</p>
        </div>

        <div className="bg-[#242424] border-t-2 border-t-emerald-500 shadow-xl p-6">
          <p className="text-[#A0A0A0] text-xs font-bold uppercase mb-2">Giảm Body Fat</p>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-5xl font-black text-emerald-500">{totalBodyFatLoss}</p>
            <TrendingDown className="w-8 h-8 text-emerald-500" />
          </div>
          <p className="text-[#A0A0A0]">% (6 tháng)</p>
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

        <div className="h-96">
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
              {historyRecords.map((record, index) => (
                <tr
                  key={record.id}
                  className={`border-b border-[#333333] ${
                    index === 0 ? 'bg-[#FF5A00]/5' : 'hover:bg-[#1A1A1A]'
                  } transition-colors`}
                >
                  <td className="px-6 py-4 text-white font-bold">{record.date}</td>
                  <td className="px-6 py-4 text-white text-lg font-black">{record.weight}</td>
                  <td className="px-6 py-4 text-[#FF5A00] text-lg font-black">{record.bodyFat}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <div
                        className={`flex items-center gap-1 ${
                          record.change.weight < 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {record.change.weight < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                        <span className="font-bold">{Math.abs(record.change.weight)}kg</span>
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          record.change.bodyFat < 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}
                      >
                        {record.change.bodyFat < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <TrendingUp className="w-4 h-4" />
                        )}
                        <span className="font-bold">{Math.abs(record.change.bodyFat)}%</span>
                      </div>
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
