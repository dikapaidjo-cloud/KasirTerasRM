import { RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import CartPanel from '../components/CartPanel.jsx';
import { api } from '../services/api.js';
import { usePosStore } from '../store/posStore.js';
import { formatMoney } from '../utils/money.js';

const sizes = [
  ['regular', 'R', 'regular_price'],
  ['medium', 'M', 'medium_price'],
  ['large', 'L', 'large_price']
];

export default function CashierPage() {
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const selectedCategory = usePosStore((state) => state.selectedCategory);
  const setSelectedCategory = usePosStore((state) => state.setSelectedCategory);
  const addToCart = usePosStore((state) => state.addToCart);

  async function loadData() {
    setLoading(true);
    try {
      const [categoryRows, menuRows] = await Promise.all([api.categories.list(), api.menus.list()]);
      setCategories(categoryRows);
      setMenus(menuRows);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredMenus = useMemo(() => {
    if (selectedCategory === 'all') return menus;
    return menus.filter((menu) => String(menu.category_id) === String(selectedCategory));
  }, [menus, selectedCategory]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
      <section className="min-w-0">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button className={`touch-btn whitespace-nowrap rounded px-4 font-semibold ${selectedCategory === 'all' ? 'bg-coffee text-white' : 'bg-white text-coffee'}`} onClick={() => setSelectedCategory('all')}>
              Semua
            </button>
            {categories.map((category) => (
              <button key={category.id} className={`touch-btn whitespace-nowrap rounded px-4 font-semibold ${String(selectedCategory) === String(category.id) ? 'bg-coffee text-white' : 'bg-white text-coffee'}`} onClick={() => setSelectedCategory(category.id)}>
                {category.name}
              </button>
            ))}
          </div>
          <button className="grid h-12 w-12 shrink-0 place-items-center rounded bg-white text-coffee" onClick={loadData} title="Muat ulang">
            <RefreshCw size={19} />
          </button>
        </div>
        {loading ? (
          <div className="rounded border border-crema bg-white p-8 text-center">Memuat menu...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filteredMenus.map((menu) => (
              <article key={menu.id} className="rounded border border-crema bg-white p-3">
                <div className="mb-3 min-h-14">
                  <h3 className="font-bold leading-snug text-coffee">{menu.name}</h3>
                  <p className="text-sm text-stone-500">{menu.category_name || 'Tanpa kategori'}</p>
                </div>
                <div className="grid gap-2">
                  {sizes.map(([size, label, key]) => Number(menu[key]) > 0 && (
                    <button key={size} className="touch-btn rounded bg-paper px-3 text-left font-semibold text-coffee" onClick={() => addToCart(menu, size, Number(menu[key]))}>
                      <span className="flex justify-between gap-2">
                        <span>{label}</span>
                        <span>{formatMoney(menu[key])}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <CartPanel onSaved={loadData} />
    </div>
  );
}
