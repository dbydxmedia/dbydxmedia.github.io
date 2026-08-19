export interface GroceryItem {
  id: string;
  name: string;
  imageUrl: string;
  category?: string;
  isCustom?: boolean;
  createdAt?: number;
}

export interface SelectedListItem {
  itemId: string;
  name: string;
  imageUrl: string;
  quantity: number;
  unit?: string;
  checked: boolean;
  addedAt: number;
}

export type PageView = 'home' | 'list' | 'add';
