import { Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';

const emptyMenu = { category_id: '', name: '', regular_price: 0, medium_price: 0, large_price: 0, is_active: 1 };

export default function ManagePage() {
  const [categories, setCategories] = useState([]);
  const [menus, setMenus] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [form, setForm] = useState(emptyMenu);
  const [editingId, setEditingId] = useState(null);

  async function loadData() {
    const [categoryRows, menuRows] = await Promise.all([api.categories.list(), api.menus.list(false)]);
    setCategories(categoryRows);
    setMenus(menuRows);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function saveMenu(event) {
    event.preventDefault();
    if (editingId) {
      await api.menus.update(editingId, form);
    } else {
      await api.menus.create(form);
    }
    setForm(emptyMenu);
    setEditingId(null);
    loadData();
  }

  async function saveCategory(event) {
    event.preventDefault();
    await api.categories.create({ name: categoryName });
    setCategoryName('');
    loadData();
  }

  function editMenu(menu) {
    setEditingId(menu.id);
    setForm({
      category_id: menu.category_id || '',
      name: menu.name,
      regular_price: menu.regular_price,
      medium_price: menu.medium_price,
      large_price: menu.large_price,
      is_active: menu.is_active
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <section className="space-y-4">
        <form className="rounded border border-crema bg-white p-4" onSubmit={saveCategory}>
          <h2 className="mb-3 text-lg font-bold text-coffee">Kategori</h2>
          <div className="flex gap-2">
            <input className="touch-btn min-w-0 flex-1 rounded border border-crema px-3" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Nama kategori" />
            <button className="grid h-12 w-12 place-items-center rounded bg-coffee text-white" title="Tambah kategori">
              <Plus size={20} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((category) => (
              <span key={category.id} className="rounded bg-paper px-3 py-2 text-sm font-semibold text-coffee">{category.name}</span>
            ))}
          </div>
        </form>
        <form className="rounded border border-crema bg-white p-4" onSubmit={saveMenu}>
          <h2 className="mb-3 text-lg font-bold text-coffee">{editingId ? 'Edit Menu' : 'Tambah Menu'}</h2>
          <div className="space-y-3">
            <input className="touch-btn w-full rounded border border-crema px-3" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nama menu" required />
            <select className="touch-btn w-full rounded border border-crema px-3" value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}>
              <option value="">Pilih kategori</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            {[
              ['regular_price', 'Harga Regular'],
              ['medium_price', 'Harga Medium'],
              ['large_price', 'Harga Large']
            ].map(([key, label]) => (
              <input key={key} className="touch-btn w-full rounded border border-crema px-3" type="number" min="0" value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} placeholder={label} />
            ))}
            <label className="flex min-h-12 items-center gap-2">
              <input type="checkbox" checked={Boolean(form.is_active)} onChange={(event) => setForm({ ...form, is_active: event.target.checked ? 1 : 0 })} />
              <span>Aktif</span>
            </label>
            <button className="touch-btn w-full rounded bg-coffee font-bold text-white">{editingId ? 'Simpan Perubahan' : 'Tambah Menu'}</button>
          </div>
        </form>
      </section>
      <section className="rounded border border-crema bg-white">
        <div className="border-b border-crema px-4 py-3">
          <h2 className="text-lg font-bold text-coffee">Daftar Menu</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-paper text-coffee">
              <tr>
                <th className="p-3">Menu</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">R</th>
                <th className="p-3">M</th>
                <th className="p-3">L</th>
                <th className="p-3">Status</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr key={menu.id} className="border-t border-stone-100">
                  <td className="p-3 font-semibold">{menu.name}</td>
                  <td className="p-3">{menu.category_name || '-'}</td>
                  <td className="p-3">{formatMoney(menu.regular_price)}</td>
                  <td className="p-3">{formatMoney(menu.medium_price)}</td>
                  <td className="p-3">{formatMoney(menu.large_price)}</td>
                  <td className="p-3">{menu.is_active ? 'Aktif' : 'Nonaktif'}</td>
                  <td className="flex gap-2 p-3">
                    <button className="grid h-10 w-10 place-items-center rounded bg-paper text-coffee" onClick={() => editMenu(menu)} title="Edit" type="button">
                      <Edit size={17} />
                    </button>
                    <button className="grid h-10 w-10 place-items-center rounded bg-red-50 text-red-700" onClick={async () => { await api.menus.delete(menu.id); loadData(); }} title="Hapus" type="button">
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
