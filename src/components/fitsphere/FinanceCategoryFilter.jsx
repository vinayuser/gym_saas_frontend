import GlassCard from './GlassCard';
import { FINANCE_CATEGORIES } from '../../constants/financeCategories';

const FinanceCategoryFilter = ({ value, onChange, className = '' }) => (
  <GlassCard className={`flex flex-wrap items-center gap-3 p-4 ${className}`}>
    <label htmlFor="finance-category" className="text-sm font-medium text-secondary">
      Source
    </label>
    <select
      id="finance-category"
      className="input-cyber min-w-[220px] rounded-lg px-3 py-2 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {FINANCE_CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  </GlassCard>
);

export default FinanceCategoryFilter;
