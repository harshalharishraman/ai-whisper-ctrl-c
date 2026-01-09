
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSavedTrips, deleteSavedTrip, getPersonalizedExplore } from '../services/exploreService';
import { Trip, ExploreData } from '../types';

interface MyExploreProps {
  onOpenTrip: (trip: Trip) => void;
  onExploreDestination: (dest: string) => void;
}

const MyExplore: React.FC<MyExploreProps> = ({ onOpenTrip, onExploreDestination }) => {
  const { user } = useAuth();
  const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
  const [exploreData, setExploreData] = useState<ExploreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const trips = getSavedTrips(user.id);
      setSavedTrips(trips);
      
      getPersonalizedExplore(['Mountains', 'Photography']) // Default interests for mock
        .then(data => {
          setExploreData(data);
          setIsLoading(false);
        });
    }
  }, [user]);

  const handleDelete = (id: string) => {
    if (user) {
      deleteSavedTrip(user.id, id);
      setSavedTrips(prev => prev.filter(t => t.id !== id));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-12 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-8 bg-slate-900 w-48 rounded-lg border border-slate-800"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-40 bg-slate-900 rounded-2xl border border-slate-800"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Saved Trips Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Saved Itineraries
          </h2>
          <span className="text-sm text-slate-500 font-medium">{savedTrips.length} Trips Saved</span>
        </div>
        
        {savedTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedTrips.map(trip => (
              <div key={trip.id} className="group bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-900/10 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 flex gap-2">
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(trip.id); }}
                    className="p-2 bg-slate-800/80 hover:bg-red-900/30 text-slate-500 hover:text-red-400 rounded-full transition-colors backdrop-blur-md"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <div onClick={() => onOpenTrip(trip)}>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-2">{trip.budgetTier}</span>
                  <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{trip.destination}</h3>
                  <p className="text-sm text-slate-400 mt-1">{trip.startDate} — {trip.endDate}</p>
                  
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-800">
                    <span className="text-lg font-bold text-slate-200">₹{trip.totalCost.toLocaleString()}</span>
                    <span className="text-xs text-slate-500">{trip.days.length} Days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl p-12 text-center">
            <p className="text-slate-500">No saved trips yet. Generate one and save it to see it here!</p>
          </div>
        )}
      </section>

      {/* Recommended Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Recommended For You
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {exploreData?.recommended.map((dest, idx) => (
            <button 
              key={idx}
              onClick={() => onExploreDestination(dest)}
              className="relative aspect-[4/3] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden group text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>
              <div className="absolute bottom-0 p-6 z-20">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">AI Suggestion</span>
                <h3 className="text-xl font-bold text-white mt-1">{dest}</h3>
                <p className="text-sm text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Explore potential itineraries & costs</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section>
        <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 3 6 3 9s1 2 3 2c-1 1-1 2-1 3z" />
          </svg>
          Trending Globally
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {exploreData?.trending.map((dest, idx) => (
            <button 
              key={idx}
              onClick={() => onExploreDestination(dest)}
              className="flex-shrink-0 w-64 bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:bg-slate-800 transition-colors text-left"
            >
              <h4 className="text-lg font-bold text-slate-200">{dest}</h4>
              <p className="text-xs text-slate-500 mt-2">Highly searched this month</p>
              <div className="mt-4 text-blue-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                View Plans
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MyExplore;
