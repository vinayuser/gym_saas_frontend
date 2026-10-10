import ENDPOINTS from '../config/apiUrls';
import { getRequest } from '../config/dataApi';

const financeParams = ({ category = 'ALL', exportAll = false, page = 1, limit = 10, search } = {}) =>
  exportAll
    ? { category, export: 'true' }
    : { category, page, limit, ...(search ? { search } : {}) };

const asList = (res) => ({
  items: res.data || [],
  pagination: res.meta?.pagination || { total: 0 },
});

/** Paginated finance APIs return `{ data: T[], meta: { pagination } }`. */
export const fetchFinanceLedger = async (gymId, opts = {}) => {
  const res = await getRequest(ENDPOINTS.FINANCE.LEDGER(gymId), { params: financeParams(opts) });
  if (opts.exportAll) return res.data || [];
  return asList(res);
};

export const fetchFinancePayments = async (gymId, opts = {}) => {
  const res = await getRequest(ENDPOINTS.FINANCE.PAYMENTS(gymId), { params: financeParams(opts) });
  if (opts.exportAll) return res.data || [];
  return asList(res);
};
