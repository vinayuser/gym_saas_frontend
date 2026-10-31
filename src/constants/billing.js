export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'OTHER', label: 'Other' },
];

export const EXPENSE_CATEGORIES = [
  { value: 'RENT', label: 'Rent & lease' },
  { value: 'SALARIES', label: 'Salaries & wages' },
  { value: 'UTILITIES', label: 'Electricity & utilities' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'MAINTENANCE', label: 'Repairs & maintenance' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'SUPPLIES', label: 'Supplies & housekeeping' },
  { value: 'STORE_PURCHASE', label: 'Store inventory' },
  { value: 'TAXES_FEES', label: 'Taxes, fees & licences' },
  { value: 'OTHER', label: 'Other' },
];

export const expenseLabel = (key) => EXPENSE_CATEGORIES.find((c) => c.value === key)?.label || key;
