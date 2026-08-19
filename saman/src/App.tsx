import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DEFAULT_GROCERY_ITEMS } from './data/defaultItems';
import { GroceryItem, SelectedListItem, PageView } from './types';
import { Header } from './components/Header';
import { HomeSwiper } from './components/HomeSwiper';
import { ListPage } from './components/ListPage';
import { AddProductPage } from './components/AddProductPage';
import { soundFx } from './utils/sound';

const STORAGE_CATALOG_KEY = 'saman_grocery_catalog_v1';
const STORAGE_SELECTED_KEY = 'saman_grocery_selected_v1';
const STORAGE_SOUND_KEY = 'saman_sound_enabled_v1';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Initialize catalog with default items + stored custom items
  const [catalog, setCatalog] = useState<GroceryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge custom items with default items if not duplicate
          const customItems: GroceryItem[] = parsed.filter((i: GroceryItem) => i.isCustom);
          return [...customItems, ...DEFAULT_GROCERY_ITEMS];
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_GROCERY_ITEMS;
  });

  // Selected items in the generated grocery list
  const [selectedItems, setSelectedItems] = useState<SelectedListItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SELECTED_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Sound preference load
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SOUND_KEY);
      if (saved !== null) {
        const val = saved === 'true';
        setSoundEnabled(val);
        soundFx.enabled = val;
      }
    } catch {
      // Ignore
    }
  }, []);

  // Save catalog changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    } catch {
      // Ignore
    }
  }, [catalog]);

  // Save selected items changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SELECTED_KEY, JSON.stringify(selectedItems));
    } catch {
      // Ignore
    }
  }, [selectedItems]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    try {
      localStorage.setItem(STORAGE_SOUND_KEY, String(next));
    } catch {
      // Ignore
    }
  };

  // Add item from swiper to list
  const handleAddItem = (item: GroceryItem) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.itemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          itemId: item.id,
          name: item.name,
          imageUrl: item.imageUrl,
          quantity: 1,
          checked: false,
          addedAt: Date.now(),
        },
      ];
    });
  };

  // Skip item (no-op on selected items, handled by swiper index)
  const handleSkipItem = (_item: GroceryItem) => {
    // skipped
  };

  // Add custom manual item directly on the list page
  const handleAddManualItem = (name: string) => {
    const newId = `manual-${Date.now()}`;
    setSelectedItems((prev) => [
      ...prev,
      {
        itemId: newId,
        name,
        imageUrl: '',
        quantity: 1,
        checked: false,
        addedAt: Date.now(),
      },
    ]);
  };

  // Add new product to catalog from Add page
  const handleAddNewItem = (newItemData: Omit<GroceryItem, 'id'>) => {
    const newItem: GroceryItem = {
      ...newItemData,
      id: `custom-${Date.now()}`,
    };
    setCatalog((prev) => [newItem, ...prev]);
  };

  // List actions
  const handleToggleCheck = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, checked: !i.checked } : i))
    );
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((i) => {
          if (i.itemId === itemId) {
            const nextQty = i.quantity + delta;
            return nextQty > 0 ? { ...i, quantity: nextQty } : null;
          }
          return i;
        })
        .filter(Boolean) as SelectedListItem[]
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  const handleClearList = () => {
    if (window.confirm('Are you sure you want to clear your grocery list?')) {
      setSelectedItems([]);
    }
  };

  const selectedItemIds = new Set(selectedItems.map((i) => i.itemId));

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* App Header */}
      <Header
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        listCount={selectedItems.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main App Body with Smooth Page Transitions */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <HomeSwiper
                items={catalog}
                selectedItemIds={selectedItemIds}
                onAddItem={handleAddItem}
                onSkipItem={handleSkipItem}
                onGenerateList={() => setCurrentPage('list')}
                onResetCycle={() => {
                  // No-op, swiper resets internally or we can trigger
                }}
              />
            </motion.div>
          )}

          {currentPage === 'list' && (
            <motion.div
              key="list-page"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <ListPage
                items={selectedItems}
                onBack={() => setCurrentPage('home')}
                onToggleCheck={handleToggleCheck}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onClearList={handleClearList}
                onAddManualItem={handleAddManualItem}
              />
            </motion.div>
          )}

          {currentPage === 'add' && (
            <motion.div
              key="add-page"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <AddProductPage
                onBack={() => setCurrentPage('home')}
                onAddNewItem={handleAddNewItem}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Branding & Hotkey hint */}
      <footer className="w-full text-center py-3 text-[11px] text-neutral-400 font-medium">
        <span className="hidden sm:inline">Keyboard: </span>
        <span className="hidden sm:inline font-mono text-neutral-500 bg-neutral-200/80 px-1 py-0.5 rounded text-[10px]">→ / Enter</span>
        <span className="hidden sm:inline"> Add • </span>
        <span className="hidden sm:inline font-mono text-neutral-500 bg-neutral-200/80 px-1 py-0.5 rounded text-[10px]">← / Backspace</span>
        <span className="hidden sm:inline"> Skip • </span>
        <span className="hidden sm:inline font-mono text-neutral-500 bg-neutral-200/80 px-1 py-0.5 rounded text-[10px]">G</span>
        <span className="hidden sm:inline"> Generate List • </span>
        <span>Saman App © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
}
