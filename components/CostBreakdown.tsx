
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Trip } from '../types';

interface CostBreakdownProps {
  trip: Trip;
}

const CostBreakdown: React.FC<CostBreakdownProps> = ({ trip }) => {
  const aggregateCosts = trip.days.reduce((acc, day) => {
    acc.hotel += day.cost.hotel;
    acc.food += day.cost.food;
    acc.transport += day.cost.transport;
    acc.activities += day.cost.activities;
    return acc;
  }, { hotel: 0, food: 0, transport: 0, activities: 0 });

  const data = [
    { name: 'Hotel', value: aggregateCosts.hotel, color: '#3b82f6' },
    { name: 'Food', value: aggregateCosts.food, color: '#10b981' },
    { name: 'Transport', value: aggregateCosts.transport, color: '#f59e0b' },
    { name: 'Activities', value: aggregateCosts.activities, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6 flex flex-col items-center">
      <h3 className="text-lg font-semibold text-slate-100 mb-4 w-full text-left font-bold">Budget Allocation</h3>
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `₹${value.toLocaleString()}`}
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderRadius: '8px', 
                border: '1px solid #1e293b',
                color: '#f1f5f9'
              }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ color: '#94a3b8' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full mt-6 space-y-3">
        <div className="flex justify-between items-center text-sm font-medium text-slate-400">
          <span>Estimated Total</span>
          <span className="text-xl font-bold text-slate-100">₹{trip.totalCost.toLocaleString()}</span>
        </div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-600 h-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: '100%' }}></div>
        </div>
        <p className="text-xs text-slate-500 text-center uppercase tracking-widest font-semibold">Base prices recalculated with {trip.budgetTier.replace('_', ' ')} multipliers</p>
      </div>
    </div>
  );
};

export default CostBreakdown;
