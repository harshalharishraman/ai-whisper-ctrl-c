
import React from 'react';
import { DayPlan } from '../types';

interface DayCardProps {
  day: DayPlan;
  onUpdateDay: (updatedDay: DayPlan) => void;
}

const DayCard: React.FC<DayCardProps> = ({ day, onUpdateDay }) => {
  return (
    <div className="relative pl-8 pb-10 border-l-2 border-slate-800 last:border-0 last:pb-0">
      <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-900/30"></div>
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/10 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Day {day.day}</span>
            <h4 className="text-lg font-bold text-slate-100">{day.date}</h4>
          </div>
          <div className="bg-slate-800 px-3 py-1 rounded-full text-xs font-semibold text-slate-300 border border-slate-700">
            ₹{(day.cost.hotel + day.cost.food + day.cost.transport + day.cost.activities).toLocaleString()}
          </div>
        </div>
        
        <p className="text-slate-400 text-sm mb-4 leading-relaxed">{day.description}</p>
        
        <div className="space-y-4">
          <div>
            <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Key Highlights</h5>
            <div className="flex flex-wrap gap-2">
              {day.places.map((place, idx) => (
                <span key={idx} className="bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {place}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-slate-800 pt-4">
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Stay</span>
              <span className="text-sm font-semibold text-slate-200">₹{day.cost.hotel}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Food</span>
              <span className="text-sm font-semibold text-slate-200">₹{day.cost.food}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Ride</span>
              <span className="text-sm font-semibold text-slate-200">₹{day.cost.transport}</span>
            </div>
            <div className="text-center">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Fun</span>
              <span className="text-sm font-semibold text-slate-200">₹{day.cost.activities}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayCard;
