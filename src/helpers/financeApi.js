import ENDPOINTS from '../config/apiUrls';
import { getRequest } from '../config/dataApi';

/** Paginated finance APIs return `{ data: T[], meta: { pagination } }`. */
export const fetchFinanceLedger = async (gymId, { category = 'ALL', exportAll = false } = {}) => {
  const res = await getRequest(ENDPOINTS.FINANCE.LEDGER(gymId), {
    params: exportAll ? { category, export: 'true' } : { category, limit: 100 },
  });
  return res.data || [];
};

export const fetchFinancePayments = async (gymId, { category = 'ALL', exportAll = false } = {}) => {
  const res = await getRequest(ENDPOINTS.FINANCE.PAYMENTS(gymId), {
    params: exportAll ? { category, export: 'true' } : { category, limit: 100 },
  });
  return res.data || [];
};
