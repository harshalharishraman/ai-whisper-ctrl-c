
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onHelpClick?: () => void;
  onLoginClick?: () => void;
  onViewChange?: (view: 'planner' | 'explore') => void;
  currentView?: 'planner' | 'explore';
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onLoginClick, onViewChange, currentView = 'planner' }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onViewChange?.('planner')}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-100 tracking-tight">AI Travel Agent</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button 
            onClick={() => onViewChange?.('planner')}
            className={`${currentView === 'planner' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors font-bold uppercase tracking-widest text-[10px]`}
          >
            Planner
          </button>
          <button 
            onClick={() => onViewChange?.('explore')}
            className={`${currentView === 'explore' ? 'text-blue-400' : 'hover:text-blue-400'} transition-colors font-bold uppercase tracking-widest text-[10px]`}
          >
            Explore
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onHelpClick?.(); }}
            className="hover:text-blue-400 transition-colors cursor-pointer font-bold uppercase tracking-widest text-[10px]"
          >
            Help
          </button>
          
          {isAuthenticated && user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-full hover:bg-slate-700 transition-all border border-slate-700"
              >
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-slate-200">{user.name}</span>
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showDropdown && (
                <>
                  <div className="fixed inset-0 z-0" onClick={() => setShowDropdown(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-200 truncate">{user.email}</p>
                    </div>
                    <button 
                      onClick={() => { onViewChange?.('explore'); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
                    >
                      My Explore
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors">
                      Support Tickets
                    </button>
                    <button 
                      onClick={() => { logout(); setShowDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/10 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-500 transition-all shadow-md shadow-blue-500/20"
            >
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
