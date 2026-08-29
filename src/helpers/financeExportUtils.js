import { FINANCE_CATEGORY_LABELS } from '../constants/financeCategories';

const pad = (n) => String(n).padStart(2, '0');

export const slugifyGymName = (name = 'gym') =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'gym';

export const financeExportDateStamp = () => {
  const d = new Date();
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
};

export const financeExportTimestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

export const formatExportDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const buildFinanceFileName = (prefix, gymName, category, extension) => {
  const gym = slugifyGymName(gymName);
  const source = (category || 'ALL').toLowerCase();
  return `${prefix}_${gym}_${source}_${financeExportDateStamp()}.${extension}`;
};

const escapeCsvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export const rowsToCsv = (rows) =>
  rows.map((row) => row.map((cell) => escapeCsvCell(cell)).join(',')).join('\n');

export const downloadTextFile = (filename, content, mimeType = 'text/csv;charset=utf-8;') => {
  const blob = new Blob(['\uFEFF', content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

const withRunningBalance = (entries) => {
  const sorted = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  let balance = 0;
  return sorted.map((entry, index) => {
    balance += Number(entry.credit || 0) - Number(entry.debit || 0);
    return { ...entry, sno: index + 1, runningBalance: balance };
  });
};

export const exportGeneralLedgerCsv = ({ gymName, category, entries }) => {
  const categoryLabel = FINANCE_CATEGORY_LABELS[category] || category;
  const rows = withRunningBalance(entries);
  const totalDebit = rows.reduce((s, e) => s + Number(e.debit || 0), 0);
  const totalCredit = rows.reduce((s, e) => s + Number(e.credit || 0), 0);
  const totalGst = rows.reduce((s, e) => s + Number(e.gst || 0), 0);

  const csvRows = [
    ['General Ledger Export'],
    ['Gym Name', gymName],
    ['Source Filter', categoryLabel],
    ['Generated On', financeExportTimestamp()],
    ['Currency', 'INR'],
    [],
    ['S.No', 'Date', 'Voucher Type', 'Reference No', 'Particulars', 'Debit (INR)', 'Credit (INR)', 'GST (INR)', 'Payment Mode', 'Status', 'Running Balance (INR)'],
    ...rows.map((e) => [
      e.sno,
      formatExportDate(e.date),
      FINANCE_CATEGORY_LABELS[e.category] || e.category,
      e.refId,
      e.narration,
      e.debit ? Number(e.debit).toFixed(2) : '',
      e.credit ? Number(e.credit).toFixed(2) : '',
      e.gst ? Number(e.gst).toFixed(2) : '',
      e.method,
      e.status,
      e.runningBalance.toFixed(2),
    ]),
    [],
    ['Totals', '', '', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2), totalGst.toFixed(2), '', '', rows.at(-1)?.runningBalance?.toFixed(2) || '0.00'],
  ];

  downloadTextFile(
    buildFinanceFileName('General_Ledger', gymName, category, 'csv'),
    rowsToCsv(csvRows)
  );
};

export const exportRevenueReportCsv = ({ gymName, category, reportData, ledgerEntries = [] }) => {
  const categoryLabel = FINANCE_CATEGORY_LABELS[category] || category;
  const breakdown = reportData?.breakdown || [];
  const total = breakdown.reduce((s, b) => s + Number(b.amount || 0), 0);

  const csvRows = [
    ['Revenue Report'],
    ['Gym Name', gymName],
    ['Source Filter', categoryLabel],
    ['Generated On', financeExportTimestamp()],
    ['Currency', 'INR'],
    [],
    ['Summary'],
    ['Metric', 'Amount (INR)'],
    ['Total Revenue', Number(reportData?.totalRevenue || 0).toFixed(2)],
    ['Subscriptions & Memberships', Number(reportData?.subscriptionRevenue || 0).toFixed(2)],
    ['Store Sales & Orders', Number(reportData?.storeRevenue || 0).toFixed(2)],
    ['GST Collected (Est. 18%)', Number(reportData?.vat || 0).toFixed(2)],
    [],
    ['Revenue Breakdown'],
    ['Category', 'Amount (INR)', 'Share (%)'],
    ...breakdown.map((b) => [
      b.label,
      Number(b.amount || 0).toFixed(2),
      total > 0 ? ((Number(b.amount) / total) * 100).toFixed(2) : '0.00',
    ]),
  ];

  if (ledgerEntries.length > 0) {
    const rows = withRunningBalance(ledgerEntries);
    csvRows.push(
      [],
      ['Detailed Ledger Entries'],
      ['S.No', 'Date', 'Voucher Type', 'Reference No', 'Particulars', 'Debit (INR)', 'Credit (INR)', 'GST (INR)', 'Payment Mode', 'Running Balance (INR)'],
      ...rows.map((e) => [
        e.sno,
        formatExportDate(e.date),
        FINANCE_CATEGORY_LABELS[e.category] || e.category,
        e.refId,
        e.narration,
        e.debit ? Number(e.debit).toFixed(2) : '',
        e.credit ? Number(e.credit).toFixed(2) : '',
        e.gst ? Number(e.gst).toFixed(2) : '',
        e.method,
        e.runningBalance.toFixed(2),
      ])
    );
  }

  downloadTextFile(
    buildFinanceFileName('Revenue_Report', gymName, category, 'csv'),
    rowsToCsv(csvRows)
  );
};

export const exportPaymentLedgerCsv = ({ gymName, category, rows }) => {
  const categoryLabel = FINANCE_CATEGORY_LABELS[category] || category;

  const csvRows = [
    ['Payment Ledger Export'],
    ['Gym Name', gymName],
    ['Source Filter', categoryLabel],
    ['Generated On', financeExportTimestamp()],
    ['Currency', 'INR'],
    [],
    ['Member / Customer', 'Member Code', 'Source', 'Plan / Product', 'Status', 'Total Received (INR)', 'Outstanding (INR)', 'Last Payment Date', 'Payment Method'],
    ...rows.flatMap((r) => {
      const lastPayment = r.payments?.[0];
      return [[
        r.memberName,
        r.memberCode || '',
        FINANCE_CATEGORY_LABELS[r.source] || r.source,
        r.planName || '',
        r.status,
        Number(r.totalPaid || 0).toFixed(2),
        Number(r.balance || 0).toFixed(2),
        lastPayment ? formatExportDate(lastPayment.paidAt || lastPayment.createdAt) : '',
        lastPayment?.method || '',
      ]];
    }),
  ];

  downloadTextFile(
    buildFinanceFileName('Payment_Ledger', gymName, category, 'csv'),
    rowsToCsv(csvRows)
  );
};

const formatInr = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    Number(amount) || 0
  );

export const openFinanceReportPdf = ({ gymName, category, title, reportData, ledgerEntries = [] }) => {
  const categoryLabel = FINANCE_CATEGORY_LABELS[category] || category;
  const breakdown = reportData?.breakdown || [];
  const total = breakdown.reduce((s, b) => s + Number(b.amount || 0), 0);
  const rows = withRunningBalance(ledgerEntries);

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/><title>${title}</title>
<style>
  body { font-family: Arial, sans-serif; color: #111; margin: 32px; font-size: 12px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #444; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
  th { background: #f3f3f3; font-size: 11px; text-transform: uppercase; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .section { margin-top: 28px; }
  .section h2 { font-size: 14px; margin: 0 0 8px; }
  @media print { body { margin: 16px; } }
</style></head><body>
  <h1>${title}</h1>
  <div class="meta">
    <div><strong>Gym:</strong> ${gymName}</div>
    <div><strong>Source filter:</strong> ${categoryLabel}</div>
    <div><strong>Generated:</strong> ${financeExportTimestamp()}</div>
  </div>
  <div class="section">
    <h2>Summary</h2>
    <table>
      <tr><th>Metric</th><th class="num">Amount (INR)</th></tr>
      <tr><td>Total Revenue</td><td class="num">${formatInr(reportData?.totalRevenue)}</td></tr>
      <tr><td>Subscriptions & Memberships</td><td class="num">${formatInr(reportData?.subscriptionRevenue)}</td></tr>
      <tr><td>Store Sales & Orders</td><td class="num">${formatInr(reportData?.storeRevenue)}</td></tr>
      <tr><td>GST Collected (Est. 18%)</td><td class="num">${formatInr(reportData?.vat)}</td></tr>
    </table>
  </div>
  <div class="section">
    <h2>Revenue Breakdown</h2>
    <table>
      <tr><th>Category</th><th class="num">Amount (INR)</th><th class="num">Share</th></tr>
      ${breakdown
        .map(
          (b) => `<tr><td>${b.label}</td><td class="num">${formatInr(b.amount)}</td><td class="num">${total > 0 ? ((Number(b.amount) / total) * 100).toFixed(1) : 0}%</td></tr>`
        )
        .join('')}
    </table>
  </div>
  ${
    rows.length
      ? `<div class="section"><h2>General Ledger Entries</h2>
    <table>
      <tr><th>S.No</th><th>Date</th><th>Type</th><th>Ref</th><th>Particulars</th><th class="num">Debit</th><th class="num">Credit</th><th class="num">Balance</th></tr>
      ${rows
        .map(
          (e) => `<tr>
        <td>${e.sno}</td><td>${formatExportDate(e.date)}</td><td>${FINANCE_CATEGORY_LABELS[e.category] || e.category}</td>
        <td>${e.refId}</td><td>${e.narration}</td>
        <td class="num">${e.debit ? formatInr(e.debit) : '—'}</td>
        <td class="num">${e.credit ? formatInr(e.credit) : '—'}</td>
        <td class="num">${formatInr(e.runningBalance)}</td>
      </tr>`
        )
        .join('')}
    </table></div>`
      : ''
  }
</body></html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
};

export const openGeneralLedgerPdf = ({ gymName, category, entries }) => {
  openFinanceReportPdf({
    gymName,
    category,
    title: 'General Ledger',
    reportData: {
      totalRevenue: entries.reduce((s, e) => s + Number(e.credit || 0), 0),
      subscriptionRevenue: entries.filter((e) => e.category === 'SUBSCRIPTIONS').reduce((s, e) => s + Number(e.credit || 0), 0),
      storeRevenue: entries.filter((e) => e.category === 'STORE_SALES').reduce((s, e) => s + Number(e.credit || 0), 0),
      vat: entries.reduce((s, e) => s + Number(e.gst || 0), 0),
      breakdown: [],
    },
    ledgerEntries: entries,
  });
};
