
import React, { useState } from 'react';
import Header from './components/Header';
import TripForm from './components/TripForm';
import DayCard from './components/DayCard';
import CostBreakdown from './components/CostBreakdown';
import ChatWidget from './components/ChatWidget';
import AuthModal from './components/AuthModal';
import MyExplore from './components/MyExplore';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Trip, BudgetTier, DayPlan } from './types';
import { researchDestination, planItinerary } from './services/geminiService';
import { recalculateTripCosts, calculateTotalCost } from './services/costEngine';
import { saveTrip as persistTrip, logActivity } from './services/exploreService';

const TIER_RANGES = {
  [BudgetTier.BUDGET]: '₹3k - ₹9k',
  [BudgetTier.MID_RANGE]: '₹10k - ₹40k',
  [BudgetTier.LUXURY]: '₹50k - ₹5L',
};

const AppContent: React.FC = () => {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'planner' | 'explore'>('planner');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  
  const { isAuthenticated, user } = useAuth();

  const handleGenerateTrip = async (formData: {
    destination: string;
    startDate: string;
    endDate: string;
    numPeople: number;
    budgetTier: BudgetTier;
    interests: string[];
  }) => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveStatus('idle');
    try {
      const research = await researchDestination(formData.destination, formData.interests);
      
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const numDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      const itinerary = await planItinerary(formData.destination, numDays, research, formData.budgetTier);
      
      const newTrip: Trip = {
        id: Math.random().toString(36).substr(2, 9),
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        numPeople: formData.numPeople,
        budgetTier: formData.budgetTier,
        interests: formData.interests,
        days: itinerary,
        totalCost: calculateTotalCost(itinerary)
      };

      setTrip(newTrip);
      if (user) logActivity(user.id, 'generate_trip', { destination: formData.destination });
    } catch (err) {
      console.error(err);
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = () => {
    if (trip && user) {
      setSaveStatus('saving');
      persistTrip(user.id, trip);
      setTimeout(() => setSaveStatus('saved'), 600);
    }
  };

  const handleBudgetChange = (newTier: BudgetTier) => {
    if (trip) {
      const updatedTrip = recalculateTripCosts(trip, newTier);
      setTrip(updatedTrip);
      setSaveStatus('idle');
    }
  };

  const handleUpdateDay = (updatedDay: DayPlan) => {
    if (trip) {
      const newDays = trip.days.map(d => d.day === updatedDay.day ? updatedDay : d);
      setTrip({
        ...trip,
        days: newDays,
        totalCost: calculateTotalCost(newDays)
      });
      setSaveStatus('idle');
    }
  };

  const handleOpenSavedTrip = (savedTrip: Trip) => {
    setTrip(savedTrip);
    setCurrentView('planner');
    setSaveStatus('saved');
  };

  const handleExploreDestination = (dest: string) => {
    setCurrentView('planner');
    setTrip(null);
    // You could pre-fill the form here if TripForm had controlled props
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header 
        onHelpClick={() => setIsChatOpen(true)} 
        onLoginClick={() => setIsAuthModalOpen(true)}
        onViewChange={setCurrentView}
        currentView={currentView}
      />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {currentView === 'planner' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
            {/* Left Column: Form or Info */}
            <div className="lg:col-span-4 space-y-6">
              <TripForm onSubmit={handleGenerateTrip} isLoading={isLoading} />
              
              {trip && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Budget Settings</h3>
                  <div className="flex flex-col bg-slate-800 p-1 rounded-xl gap-1">
                    {Object.values(BudgetTier).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => handleBudgetChange(tier)}
                        className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                          trip.budgetTier === tier 
                          ? 'bg-slate-700 text-blue-400 shadow-lg ring-1 ring-slate-600' 
                          : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {tier.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] opacity-70">
                          {TIER_RANGES[tier]} / person
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {trip && <CostBreakdown trip={trip} />}
            </div>

            {/* Right Column: Itinerary Results */}
            <div className="lg:col-span-8">
              {!isAuthenticated && (
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-2xl p-6 mb-8 flex items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">Unlock Full Planning</h3>
                      <p className="text-sm text-slate-400">Sign in to save your trips, manage bookings, and get personalized AI recommendations.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex-shrink-0"
                  >
                    Join Now
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-48 bg-slate-900 border border-slate-800 rounded-2xl w-full"></div>
                  ))}
                </div>
              ) : trip ? (
                <div className="space-y-2">
                  <div className="flex items-end justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Your {trip.destination} Trip</h1>
                      <p className="text-slate-400 mt-1 font-medium">{trip.startDate} — {trip.endDate}</p>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="p-2 text-slate-500 hover:text-blue-400 transition-colors bg-slate-900 rounded-lg border border-slate-800"
                    >
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="relative">
                    {trip.days.map((day) => (
                      <DayCard 
                        key={day.day} 
                        day={day} 
                        onUpdateDay={handleUpdateDay}
                      />
                    ))}
                  </div>

                  <div className="mt-12 p-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-blue-900/20 border border-blue-500/30">
                    <div>
                      <h4 className="text-2xl font-bold">Ready to book?</h4>
                      <p className="text-blue-100 mt-1 opacity-90">Save this itinerary and start your adventure today.</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleSaveTrip}
                        disabled={saveStatus !== 'idle'}
                        className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center gap-2 ${
                          saveStatus === 'saved' 
                            ? 'bg-emerald-500 text-white cursor-default' 
                            : 'bg-white text-blue-700 hover:bg-blue-50 disabled:bg-slate-300'
                        }`}
                      >
                        {saveStatus === 'saved' ? (
                          <>
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Saved to Explore
                          </>
                        ) : saveStatus === 'saving' ? (
                          <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : 'Save Trip'}
                      </button>
                      <button className="bg-blue-500/30 text-white border border-blue-400/50 px-6 py-3 rounded-xl font-bold hover:bg-blue-500/50 transition-colors">
                        Export PDF
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-800 p-20 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                    <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100 mb-2">Discover New Horizons</h2>
                  <p className="text-slate-400 max-w-sm leading-relaxed">
                    Enter your destination and preferences on the left to generate a personalized AI-powered travel plan.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <MyExplore 
              onOpenTrip={handleOpenSavedTrip} 
              onExploreDestination={handleExploreDestination}
            />
          </div>
        )}
      </main>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} AI Travel Agent. Powered by Gemini Pro. All rights reserved.
          </p>
          <div className="flex justify-center gap-4 mt-4 text-slate-600 text-xs font-medium">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
