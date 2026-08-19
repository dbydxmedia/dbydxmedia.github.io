import React from 'react';
import { PlusCircle, Volume2, VolumeX, ShoppingBag } from 'lucide-react';
import { PageView } from '../types';

interface HeaderProps {
  currentPage: PageView;
  onNavigate: (page: PageView) => void;
  listCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  listCount,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="w-full max-w-2xl mx-auto px-4 py-4 flex items-center justify-between border-b border-neutral-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          id="toggle-sound-btn"
          aria-label={soundEnabled ? 'Disable sound effects' : 'Enable sound effects'}
          className="p-2 text-neutral-400 hover:text-neutral-700 rounded-full hover:bg-neutral-100 transition-colors"
          title={soundEnabled ? 'Mute sound fx' : 'Unmute sound fx'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-600" /> : <VolumeX className="w-5 h-5 text-neutral-400" />}
        </button>

        {listCount > 0 && currentPage === 'home' && (
          <button
            onClick={() => onNavigate('list')}
            id="quick-view-list-btn"
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{listCount} added</span>
          </button>
        )}
      </div>

      {/* Main Title - SAMAN APP */}
      <div className="text-center">
        <h1 
          onClick={() => onNavigate('home')} 
          className="text-2xl sm:text-3xl font-extrabold tracking-wider text-neutral-900 cursor-pointer select-none font-['Outfit',sans-serif] uppercase"
        >
          SAMAN APP
        </h1>
        <p className="text-[11px] text-neutral-400 font-medium tracking-tight -mt-0.5">
          Grocery Swiper & List Generator
        </p>
      </div>

      {/* Add an Item Button matching wireframe */}
      <div>
        {currentPage !== 'add' ? (
          <button
            id="nav-add-item-btn"
            onClick={() => onNavigate('add')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-emerald-100/80 hover:bg-emerald-200 text-emerald-900 border-2 border-emerald-600 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition-all transform active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-emerald-700" />
            <span>Add an Item</span>
          </button>
        ) : (
          <div className="w-20"></div>
        )}
      </div>
    </header>
  );
};
