import React, { useState } from 'react';
import { ArrowLeft, Send, Copy, Check, Trash2, Plus, Minus, Share2, ShoppingCart, RefreshCw } from 'lucide-react';
import { SelectedListItem } from '../types';

interface ListPageProps {
  items: SelectedListItem[];
  onBack: () => void;
  onToggleCheck: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearList: () => void;
  onAddManualItem: (name: string) => void;
}

export const ListPage: React.FC<ListPageProps> = ({
  items,
  onBack,
  onToggleCheck,
  onUpdateQuantity,
  onRemoveItem,
  onClearList,
  onAddManualItem,
}) => {
  const [copied, setCopied] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);

  // Format list for WhatsApp & Clipboard
  const formatListText = () => {
    if (items.length === 0) return 'My Grocery List is empty.';
    const dateStr = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    
    let text = `🛒 *Saman Grocery List* (${dateStr})\n\n`;
    items.forEach((item, index) => {
      const qtyStr = item.quantity > 1 ? ` (x${item.quantity})` : '';
      text += `${index + 1}. ${item.name}${qtyStr}\n`;
    });
    text += `\n_Generated via Saman App_`;
    return text;
  };

  const handleShareWhatsApp = () => {
    const text = formatListText();
    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCopyClipboard = async () => {
    const text = formatListText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handleAddManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onAddManualItem(manualInput.trim());
      setManualInput('');
      setShowAddRow(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-[80vh] justify-between">
      {/* Top Section with Wireframe Back Button and Header */}
      <div>
        <div className="flex items-center justify-between mb-6">
          {/* Back circular arrow button matching wireframe */}
          <button
            onClick={onBack}
            id="list-back-arrow-btn"
            aria-label="Back to grocery swiper"
            className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center bg-white hover:bg-neutral-100 active:scale-95 shadow-[0_2px_0_#171717] transition-all cursor-pointer"
            title="Back to Swiper"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5] text-neutral-900" />
          </button>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <>
                <button
                  onClick={handleCopyClipboard}
                  id="copy-list-btn"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-xl text-xs font-semibold transition-colors active:scale-95"
                  title="Copy list to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  onClick={onClearList}
                  id="clear-list-btn"
                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                  title="Clear grocery list"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main List Container matching wireframe */}
        <div className="w-full bg-white border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.06)] mb-6">
          {/* LIST: Heading matching wireframe */}
          <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-3 mb-5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-neutral-900 font-['Outfit',sans-serif] uppercase">
              LIST:
            </h2>
            <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-200">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          {items.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400 mb-3">
                <ShoppingCart className="w-8 h-8 stroke-1" />
              </div>
              <p className="text-neutral-700 font-bold text-base">Your grocery list is empty</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Go back to the swiper to browse items, or quickly add custom items below.
              </p>
              <button
                onClick={onBack}
                className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all shadow-sm"
              >
                Browse Items
              </button>
            </div>
          ) : (
            /* Numbered List matching wireframe (1. 2. 3...) */
            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={item.itemId}
                  className={`group flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                    item.checked
                      ? 'bg-neutral-50 border-neutral-200 text-neutral-400'
                      : 'bg-white border-neutral-200 hover:border-neutral-800 text-neutral-900 shadow-sm'
                  }`}
                >
                  {/* Item Number & Name */}
                  <div
                    onClick={() => onToggleCheck(item.itemId)}
                    className="flex items-center gap-3 flex-1 cursor-pointer select-none pr-2"
                  >
                    <span className="w-7 h-7 rounded-xl bg-neutral-100 text-neutral-700 font-black text-xs flex items-center justify-center border border-neutral-300 font-['Outfit',sans-serif]">
                      {idx + 1}.
                    </span>

                    <span
                      className={`text-base font-bold tracking-tight uppercase font-['Outfit',sans-serif] ${
                        item.checked ? 'line-through text-neutral-400 font-normal' : 'text-neutral-900'
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  {/* Quantity Stepper & Delete */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-neutral-100 border border-neutral-300 rounded-xl overflow-hidden">
                      <button
                        onClick={() => onUpdateQuantity(item.itemId, -1)}
                        className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 text-xs font-bold text-neutral-800 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.itemId, 1)}
                        className="p-1 hover:bg-neutral-200 text-neutral-600 transition-colors"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.itemId)}
                      className="p-1 text-neutral-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Custom Item inline */}
          <div className="mt-4 pt-3 border-t border-neutral-200">
            {!showAddRow ? (
              <button
                onClick={() => setShowAddRow(true)}
                className="w-full py-2 px-3 border border-dashed border-neutral-300 hover:border-neutral-600 rounded-xl text-xs font-bold text-neutral-600 hover:text-neutral-900 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add Item to List</span>
              </button>
            ) : (
              <form onSubmit={handleAddManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Fresh Basil, Olive Oil..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  autoFocus
                  className="flex-1 px-3 py-2 text-sm border-2 border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRow(false)}
                  className="px-3 py-2 text-neutral-500 hover:text-neutral-800 text-xs"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM BUTTON: SEND TO WHATSAPP matching wireframe 2 */}
      <div className="w-full pt-2 pb-6">
        <button
          onClick={handleShareWhatsApp}
          disabled={items.length === 0}
          id="send-to-whatsapp-btn"
          className="w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl border-2 border-neutral-900 uppercase tracking-wider text-emerald-950 bg-emerald-200 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_5px_0_#171717] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-3 font-['Outfit',sans-serif] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px] cursor-pointer"
        >
          <Send className="w-6 h-6 stroke-[2.5]" />
          <span>SEND TO WHATSAPP</span>
        </button>
      </div>
    </div>
  );
};
