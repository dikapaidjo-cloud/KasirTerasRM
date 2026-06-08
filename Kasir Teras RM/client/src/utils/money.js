export function formatMoney(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

export function sizeLabel(size) {
  return { regular: 'R', medium: 'M', large: 'L' }[size] || size;
}
