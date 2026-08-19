import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { Check, X, ChevronLeft, ChevronRight, RotateCcw, Sparkles, ImageOff, ShoppingCart } from 'lucide-react';
import { GroceryItem } from '../types';
import { soundFx } from '../utils/sound';

interface HomeSwiperProps {
  items: GroceryItem[];
  selectedItemIds: Set<string>;
  onAddItem: (item: GroceryItem) => void;
  onSkipItem: (item: GroceryItem) => void;
  onGenerateList: () => void;
  onResetCycle: () => void;
}

export const HomeSwiper: React.FC<HomeSwiperProps> = ({
  items,
  selectedItemIds,
  onAddItem,
  onSkipItem,
  onGenerateList,
  onResetCycle,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);
  const [imgError, setImgError] = useState(false);
  const [history, setHistory] = useState<{ index: number; action: 'add' | 'skip'; item: GroceryItem }[]>([]);

  // Drag physics motion values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.4, 0.9, 1, 0.9, 0.4]);
  const rightBadgeOpacity = useTransform(x, [20, 100], [0, 1]);
  const leftBadgeOpacity = useTransform(x, [-20, -100], [0, 1]);

  const currentItem = items[currentIndex];
  const isFinished = currentIndex >= items.length;
  const totalSelected = selectedItemIds.size;

  // Reset img error on index change
  useEffect(() => {
    setImgError(false);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleAction('add');
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        handleAction('skip');
      } else if (e.key === 'g' || e.key === 'G') {
        onGenerateList();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFinished, items]);

  const handleAction = (type: 'add' | 'skip') => {
    if (!currentItem || isFinished) return;

    if (type === 'add') {
      soundFx.playAdd();
      setExitDirection('right');
      onAddItem(currentItem);
    } else {
      soundFx.playSkip();
      setExitDirection('left');
      onSkipItem(currentItem);
    }

    setHistory((prev) => [...prev, { index: currentIndex, action: type, item: currentItem }]);

    // Move to next item after animation
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      x.set(0);
    }, 200);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setExitDirection(null);
      x.set(0);
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setExitDirection(null);
      x.set(0);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(last.index);
    setExitDirection(null);
    x.set(0);
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold || info.velocity.x > 300) {
      handleAction('add');
    } else if (info.offset.x < -swipeThreshold || info.velocity.x < -300) {
      handleAction('skip');
    } else {
      x.set(0);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center px-4 py-4 sm:py-6 select-none">
      {/* Progress & Quick Nav Controls */}
      <div className="w-full flex items-center justify-between mb-4 text-xs font-semibold text-neutral-500">
        <div className="flex items-center gap-1.5 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
          <span className="text-neutral-700 font-bold">
            {isFinished ? items.length : currentIndex + 1}
          </span>
          <span>/</span>
          <span>{items.length} items</span>
        </div>

        {/* Small arrow navigation matching wireframe */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            aria-label="Previous item"
            id="prev-item-arrow-btn"
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-all active:scale-95"
            title="Previous item"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-700" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= items.length - 1}
            aria-label="Next item"
            id="next-item-arrow-btn"
            className="p-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-white transition-all active:scale-95"
            title="Next item"
          >
            <ChevronRight className="w-4 h-4 text-neutral-700" />
          </button>

          {history.length > 0 && (
            <button
              onClick={handleUndo}
              aria-label="Undo last swipe"
              id="undo-swipe-btn"
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-all active:scale-95 ml-1"
              title="Undo last action"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden mb-6">
        <div
          className="bg-emerald-500 h-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, ((currentIndex) / items.length) * 100)}%` }}
        />
      </div>

      {/* Main Display Area */}
      {!isFinished && currentItem ? (
        <div className="relative w-full aspect-[4/4.6] max-w-[360px] sm:max-w-[400px] flex items-center justify-center">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentItem.id}
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={handleDragEnd}
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{
                x: exitDirection === 'right' ? 300 : exitDirection === 'left' ? -300 : 0,
                opacity: 0,
                scale: 0.85,
                transition: { duration: 0.2 },
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              id="product-card-container"
              className="absolute inset-0 bg-white border-2 border-neutral-800 rounded-3xl p-4 sm:p-5 flex flex-col justify-between shadow-[0_8px_24px_rgba(0,0,0,0.08)] cursor-grab active:cursor-grabbing hover:shadow-[0_12px_28px_rgba(0,0,0,0.12)] transition-shadow"
            >
              {/* Overlay Badges while dragging */}
              <motion.div
                style={{ opacity: rightBadgeOpacity }}
                className="absolute top-6 left-6 z-20 bg-emerald-600 text-white font-extrabold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border-2 border-white shadow-lg pointer-events-none transform -rotate-12"
              >
                ✓ ADD TO LIST
              </motion.div>
              <motion.div
                style={{ opacity: leftBadgeOpacity }}
                className="absolute top-6 right-6 z-20 bg-rose-600 text-white font-extrabold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full border-2 border-white shadow-lg pointer-events-none transform rotate-12"
              >
                ✕ SKIP
              </motion.div>

              {/* Already Added Badge if item was previously added */}
              {selectedItemIds.has(currentItem.id) && (
                <div className="absolute top-3 right-3 z-10 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Already in list
                </div>
              )}

              {/* Category chip if available */}
              {currentItem.category && (
                <div className="self-start text-[11px] font-semibold text-neutral-500 uppercase tracking-wider px-2 py-0.5 bg-neutral-100 rounded-md mb-2">
                  {currentItem.category}
                </div>
              )}

              {/* INNER FRAME FOR IMAGE (matching wireframe) */}
              <div className="w-full flex-1 min-h-[190px] sm:min-h-[220px] bg-neutral-100 rounded-2xl border-2 border-neutral-800 overflow-hidden relative flex items-center justify-center p-2">
                {!imgError ? (
                  <img
                    src={currentItem.imageUrl}
                    alt={currentItem.name}
                    loading="eager"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover rounded-xl select-none pointer-events-none"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-400 p-4 text-center">
                    <ImageOff className="w-12 h-12 mb-2 stroke-1" />
                    <span className="text-xs font-medium text-neutral-500">{currentItem.name}</span>
                    <span className="text-[10px] text-neutral-400">(Preview unavailable)</span>
                  </div>
                )}
              </div>

              {/* NAME BELOW IMAGE (matching wireframe) */}
              <div className="w-full text-center mt-3 sm:mt-4 mb-1">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 font-['Outfit',sans-serif] uppercase">
                  {currentItem.name}
                </h2>
                <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
                  Swipe right to add • Swipe left to skip
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        /* Cycle Completed View */
        <div className="w-full max-w-[360px] sm:max-w-[400px] bg-white border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-lg my-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl border-2 border-emerald-600 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 font-['Outfit',sans-serif] uppercase">
            All Done!
          </h2>
          <p className="text-sm text-neutral-600 mt-2 mb-4">
            You've reviewed all items in the catalog. You picked <strong className="text-emerald-700 font-bold">{totalSelected} items</strong> for your grocery list.
          </p>

          <div className="flex flex-col w-full gap-2.5">
            <button
              onClick={onGenerateList}
              id="cycle-complete-generate-btn"
              className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white border-2 border-neutral-900 rounded-2xl font-extrabold text-base shadow-[0_4px_0_#171717] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>VIEW GENERATED LIST ({totalSelected})</span>
            </button>

            <button
              onClick={onResetCycle}
              id="restart-cycle-btn"
              className="w-full py-2.5 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border border-neutral-300 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start Over / Review Again</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS: GREEN CHECK & RED CROSS (matching wireframe) */}
      {!isFinished && (
        <div className="flex items-center justify-center gap-8 sm:gap-12 mt-6 mb-6">
          {/* Green Button = Add Item */}
          <button
            onClick={() => handleAction('add')}
            aria-label="Add item to grocery list"
            id="add-item-green-btn"
            className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-90 border-2 border-neutral-900 flex items-center justify-center text-white shadow-[0_6px_0_#171717] active:shadow-none active:translate-y-1.5 transition-all duration-150 cursor-pointer"
            title="Add to grocery list (Right arrow / Enter)"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-white/20">
              <Check className="w-6 h-6 stroke-[3.5]" />
            </div>
            <span className="sr-only">Add</span>
          </button>

          {/* Red Button = Skip Item */}
          <button
            onClick={() => handleAction('skip')}
            aria-label="Skip to next item"
            id="skip-item-red-btn"
            className="group relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-90 border-2 border-neutral-900 flex items-center justify-center text-white shadow-[0_6px_0_#171717] active:shadow-none active:translate-y-1.5 transition-all duration-150 cursor-pointer"
            title="Skip to next item (Left arrow / Backspace)"
          >
            <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center bg-white/20">
              <X className="w-6 h-6 stroke-[3.5]" />
            </div>
            <span className="sr-only">Skip</span>
          </button>
        </div>
      )}

      {/* GENERATE LIST BUTTON (matching bottom wireframe) */}
      <div className="w-full max-w-[360px] sm:max-w-[400px] mt-2">
        <button
          onClick={onGenerateList}
          id="main-generate-list-btn"
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-base sm:text-lg border-2 border-neutral-900 uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-2 font-['Outfit',sans-serif] ${
            totalSelected > 0
              ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-950 shadow-[0_4px_0_#171717] active:shadow-none active:translate-y-1 cursor-pointer bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px]'
              : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-dashed cursor-pointer'
          }`}
        >
          <span>GENERATE LIST</span>
          {totalSelected > 0 && (
            <span className="px-2 py-0.5 bg-neutral-900 text-white rounded-full text-xs font-bold font-sans">
              {totalSelected}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
