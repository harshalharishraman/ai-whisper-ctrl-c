
import React, { useState } from 'react';
import { BudgetTier } from '../types';

interface TripFormProps {
  onSubmit: (data: {
    destination: string;
    startDate: string;
    endDate: string;
    numPeople: number;
    budgetTier: BudgetTier;
    interests: string[];
  }) => void;
  isLoading: boolean;
}

const TripForm: React.FC<TripFormProps> = ({ onSubmit, isLoading }) => {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numPeople, setNumPeople] = useState(1);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(BudgetTier.MID_RANGE);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);

  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination || !startDate || !endDate) return;
    onSubmit({ destination, startDate, endDate, numPeople, budgetTier, interests });
  };

  const inputClasses = "w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-500";

  return (
    <div className="bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Plan Your Next Adventure
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Destination</label>
          <input
            type="text"
            required
            className={inputClasses}
            placeholder="e.g. Kyoto, Japan"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
            <input
              type="date"
              required
              className={inputClasses}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">End Date</label>
            <input
              type="date"
              required
              className={inputClasses}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Travelers</label>
            <input
              type="number"
              min="1"
              className={inputClasses}
              value={numPeople}
              onChange={(e) => setNumPeople(parseInt(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Budget Tier</label>
            <select
              className={inputClasses}
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value as BudgetTier)}
            >
              <option value={BudgetTier.BUDGET}>Budget (₹3k - ₹9k/person)</option>
              <option value={BudgetTier.MID_RANGE}>Mid-Range (₹10k - ₹40k/person)</option>
              <option value={BudgetTier.LUXURY}>Luxury (₹50k - ₹5L/person)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Interests</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-500"
              placeholder="e.g. Hiking, Sushi, Museums"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
            />
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg font-medium hover:bg-blue-600/30 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="inline-flex items-center gap-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-medium border border-slate-700">
                {interest}
                <button type="button" onClick={() => handleRemoveInterest(interest)} className="hover:text-red-400">
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:bg-slate-700 disabled:text-slate-500 disabled:shadow-none mt-4 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              AI Agents Researching...
            </>
          ) : 'Generate Itinerary'}
        </button>
      </form>
    </div>
  );
};

export default TripForm;
