export function buildReceipt(transaction) {
  const money = (value) => Number(value || 0).toLocaleString('id-ID');
  const lines = [
    'TERAS RM',
    transaction.invoice_number || '',
    new Date(transaction.created_at || Date.now()).toLocaleString('id-ID'),
    '',
    ...transaction.items.flatMap((item) => [
      `${item.menu_name} ${String(item.size || '').charAt(0).toUpperCase()}`,
      `${item.qty} x ${money(item.price)}    ${money(item.total)}`
    ]),
    '',
    `Subtotal        ${money(transaction.subtotal)}`,
    `Diskon          ${money(transaction.discount_amount)}`,
    `Total           ${money(transaction.total)}`,
    '',
    transaction.payment_method,
    '',
    'Terima Kasih'
  ];
  return lines.join('\n');
}
