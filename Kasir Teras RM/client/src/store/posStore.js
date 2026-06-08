import { create } from 'zustand';

export const usePosStore = create((set, get) => ({
  page: 'cashier',
  selectedCategory: 'all',
  cartItems: [],
  paymentMethod: 'Cash',
  discountType: 'nominal',
  discountValue: 0,
  notes: '',
  setPage: (page) => set({ page }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  setDiscountType: (discountType) => set({ discountType }),
  setDiscountValue: (discountValue) => set({ discountValue: Number(discountValue) || 0 }),
  setNotes: (notes) => set({ notes }),
  addToCart: (menu, size, price) => {
    const key = `${menu.id}-${size}`;
    const existing = get().cartItems.find((item) => item.key === key);
    if (existing) {
      set({
        cartItems: get().cartItems.map((item) =>
          item.key === key ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price } : item
        )
      });
      return;
    }
    set({
      cartItems: [
        ...get().cartItems,
        {
          key,
          menu_id: menu.id,
          menu_name: menu.name,
          name: menu.name,
          size,
          qty: 1,
          price,
          total: price
        }
      ]
    });
  },
  updateQty: (key, qty) => {
    const nextQty = Math.max(Number(qty) || 0, 0);
    set({
      cartItems: get().cartItems
        .map((item) => (item.key === key ? { ...item, qty: nextQty, total: nextQty * item.price } : item))
        .filter((item) => item.qty > 0)
    });
  },
  removeFromCart: (key) => set({ cartItems: get().cartItems.filter((item) => item.key !== key) }),
  resetCart: () => set({ cartItems: [], discountType: 'nominal', discountValue: 0, notes: '', paymentMethod: 'Cash' })
}));
