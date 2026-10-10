import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const CHART_COLORS = ['#c3f400', '#7dd3fc', '#fbbf24', '#c084fc', '#fb7185', '#34d399'];

export const formatLeadStatus = (status) =>
  String(status || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const axis = { fill: '#c6c6c7', fontSize: 11 };
const grid = { stroke: 'rgba(255,255,255,0.06)' };
const tooltipStyle = {
  background: '#201f1f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  fontSize: 12,
};

const ChartTooltip = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-surface-container px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-on-surface">{label}</p>
      {payload.map((item) => (
        <p key={item.dataKey} className="text-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: item.color }} />
          {item.name}: {formatter ? formatter(item.value, item.dataKey) : item.value}
        </p>
      ))}
    </div>
  );
};

export const AttendanceAreaChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={240}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <defs>
        <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#c3f400" stopOpacity={0.35} />
          <stop offset="95%" stopColor="#c3f400" stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid vertical={false} {...grid} />
      <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
      <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'rgba(195,244,0,0.2)' }} />
      <Area type="monotone" dataKey="count" name="Check-ins" stroke="#c3f400" fill="url(#attendanceFill)" strokeWidth={2} />
    </AreaChart>
  </ResponsiveContainer>
);

export const RevenueBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <CartesianGrid vertical={false} {...grid} />
      <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
      <YAxis tick={axis} axisLine={false} tickLine={false} />
      <Tooltip
        content={
          <ChartTooltip
            formatter={(value) =>
              new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
                Number(value) || 0
              )
            }
          />
        }
      />
      <Legend wrapperStyle={{ fontSize: 11, color: '#c6c6c7' }} />
      <Bar dataKey="membership" name="Membership" stackId="rev" fill="#c3f400" radius={[0, 0, 0, 0]} />
      <Bar dataKey="store" name="Store" stackId="rev" fill="#7dd3fc" />
      <Bar dataKey="invoices" name="Invoices" stackId="rev" fill="#c084fc" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

export const MembersLineChart = ({ data, name = 'New members' }) => (
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <CartesianGrid vertical={false} {...grid} />
      <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
      <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<ChartTooltip />} />
      <Line type="monotone" dataKey="count" name={name} stroke="#c3f400" strokeWidth={2} dot={{ r: 3, fill: '#c3f400' }} />
    </LineChart>
  </ResponsiveContainer>
);

export const PlanPieChart = ({ data, emptyLabel = 'No active plans yet.' }) => {
  const rows = data.map((item) => ({ name: item.name || item.plan, value: item.count }));
  if (!rows.length) {
    return <p className="py-10 text-center text-sm text-secondary">{emptyLabel}</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={rows} dataKey="value" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={3}>
          {rows.map((entry, i) => (
            <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#c6c6c7' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const SimpleBarChart = ({ data, valueKey = 'count', name = 'Count', formatter }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
      <CartesianGrid vertical={false} {...grid} />
      <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} />
      <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
      <Tooltip content={<ChartTooltip formatter={formatter} />} />
      <Bar dataKey={valueKey} name={name} fill="#c3f400" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
