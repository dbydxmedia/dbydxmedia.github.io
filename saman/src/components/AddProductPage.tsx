import React, { useState } from 'react';
import { ArrowLeft, Plus, Image as ImageIcon, CheckCircle, Upload, Sparkles } from 'lucide-react';
import { GroceryItem } from '../types';

interface AddProductPageProps {
  onBack: () => void;
  onAddNewItem: (item: Omit<GroceryItem, 'id'>) => void;
}

const SAMPLE_IMAGE_PRESETS = [
  { name: 'Fresh Fruits', url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Avocado', url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=80' },
  { name: 'Strawberries', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=600&q=80' },
  { name: 'Olive Oil', url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Orange Juice', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dark Roast Coffee', url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80' },
  { name: 'Organic Almond Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
  { name: 'Fresh Croissants', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80' },
];

const CATEGORIES = [
  'Produce',
  'Dairy & Eggs',
  'Bakery',
  'Grains & Staples',
  'Pantry',
  'Beverages',
  'Snacks',
  'Household',
  'Personal Care',
];

export const AddProductPage: React.FC<AddProductPageProps> = ({
  onBack,
  onAddNewItem,
}) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Produce');
  const [submitted, setSubmitted] = useState(false);
  const [lastAddedName, setLastAddedName] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use placeholder if no image URL provided
    const finalImageUrl = imageUrl.trim() || `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80`;

    onAddNewItem({
      name: name.trim(),
      imageUrl: finalImageUrl,
      category,
      isCustom: true,
      createdAt: Date.now(),
    });

    setLastAddedName(name.trim());
    setSubmitted(true);
    setName('');
    setImageUrl('');

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 sm:py-6 flex flex-col min-h-[80vh] justify-between">
      <div>
        {/* Top Wireframe Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            id="add-back-arrow-btn"
            aria-label="Back to grocery swiper"
            className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center bg-white hover:bg-neutral-100 active:scale-95 shadow-[0_2px_0_#171717] transition-all cursor-pointer"
            title="Back to Swiper"
          >
            <ArrowLeft className="w-6 h-6 stroke-[2.5] text-neutral-900" />
          </button>

          <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-['Outfit',sans-serif]">
            Item Catalog Editor
          </span>
        </div>

        {/* Success Alert */}
        {submitted && (
          <div className="mb-5 p-4 bg-emerald-50 border-2 border-emerald-500 rounded-2xl flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="text-sm font-bold">
                "{lastAddedName}" was added to your product catalog!
              </span>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Swipe Now
            </button>
          </div>
        )}

        {/* Main Add Item Card matching Wireframe 3 */}
        <div className="w-full bg-white border-2 border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* NAME INPUT (matching wireframe) */}
            <div className="space-y-1.5">
              <label 
                htmlFor="item-name-input"
                className="block text-base font-black text-neutral-900 font-['Outfit',sans-serif] uppercase tracking-wide"
              >
                Name:
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="item-name-input"
                  required
                  placeholder="e.g. Almond Milk, Organic Avocados..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-neutral-50 border-2 border-neutral-800 rounded-2xl text-neutral-900 font-semibold focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400 text-base"
                />
              </div>
            </div>

            {/* IMAGE URL INPUT (matching wireframe) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="item-image-input"
                  className="block text-base font-black text-neutral-900 font-['Outfit',sans-serif] uppercase tracking-wide"
                >
                  Image url:
                </label>
                <label className="flex items-center gap-1 text-xs font-bold text-emerald-700 cursor-pointer hover:underline">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload local photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="url"
                id="item-image-input"
                placeholder="https://images.unsplash.com/... (or choose a preset below)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-4 py-3.5 bg-neutral-50 border-2 border-neutral-800 rounded-2xl text-neutral-900 font-medium text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Category Picker */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
                Category:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Live Preview Frame */}
            <div className="pt-2">
              <span className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Live Preview
              </span>
              <div className="w-full h-40 bg-neutral-100 border-2 border-dashed border-neutral-300 rounded-2xl overflow-hidden flex items-center justify-center relative">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={name || 'Preview'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-neutral-400 text-center p-3">
                    <ImageIcon className="w-8 h-8 mb-1 stroke-1" />
                    <span className="text-xs font-semibold text-neutral-500">
                      {name || 'Product Image Preview'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      Enter an image URL or click a quick sample below
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Presets for Convenient One-Click Image Selection */}
            <div className="pt-1">
              <div className="flex items-center gap-1 text-xs font-bold text-neutral-600 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Quick Photo Presets</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_IMAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setImageUrl(preset.url);
                      if (!name) setName(preset.name);
                    }}
                    className={`relative rounded-xl overflow-hidden border-2 aspect-square group transition-all ${
                      imageUrl === preset.url ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-1">
                      <span className="text-[9px] font-bold text-white leading-tight truncate">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="submit-new-item-btn"
              className="w-full mt-4 py-3.5 px-6 rounded-2xl font-black text-base border-2 border-neutral-900 uppercase tracking-wider text-emerald-950 bg-emerald-200 hover:bg-emerald-300 shadow-[0_4px_0_#171717] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 font-['Outfit',sans-serif] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:8px_8px] cursor-pointer"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>Add Item to Product Catalog</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="text-center py-4 text-xs font-medium text-neutral-400">
        Added items appear immediately in the main swiper carousel.
      </div>
    </div>
  );
};
