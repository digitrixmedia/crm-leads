import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Award, 
  CalendarCheck, 
  Flame, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  Target,
  Clock,
  Sparkles,
  ChevronRight,
  Upload,
  Plus,
  Layers,
  Database
} from 'lucide-react';
import { ClientProfile, Campaign, AdCreative, DailyMetric, Lead, SalesRep, DateFilter } from '../types';
import { formatINR, formatINRPipeline, formatINRCurrency } from '../utils/formatters';
import { isDateInRange, getDateFilterMultiplier } from '../utils/dateUtils';
import { deriveDailyMetricsFromLeads } from '../utils/googleSheets';

interface ExecutiveOverviewProps {
  client: ClientProfile;
  campaigns: Campaign[];
  creatives: AdCreative[];
  dailyMetrics: DailyMetric[];
  leads: Lead[];
  salesReps: SalesRep[];
  dateFilter: DateFilter;
  presentationMode: boolean;
  onNavigateTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenNewLeadModal: () => void;
  onLoadSampleData: () => void;
  metaConnected: boolean;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  client,
  campaigns,
  creatives,
  dailyMetrics,
  leads,
  salesReps,
  dateFilter,
  presentationMode,
  onNavigateTab,
  onOpenReportModal,
  onOpenNewLeadModal,
  onLoadSampleData,
  metaConnected,
}) => {
  const [hoveredDay, setHoveredDay] = useState<DailyMetric | null>(null);

  // Filter leads based on active date filter
  const filteredLeads = leads.filter((lead) => isDateInRange(lead.submittedAt, dateFilter));

  // Computations
  const dateMultiplier = getDateFilterMultiplier(dateFilter);
  const rawSpend = campaigns.reduce((acc, c) => acc + c.totalSpend, 0);
  const totalSpend = Math.round(rawSpend * dateMultiplier);
  const totalLeads = filteredLeads.length;
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const qualifiedLeads = filteredLeads.filter(l => l.intentGrade === 'A' || l.intentGrade === 'B').length;
  const qualifiedPercent = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0;
  const bookedAppointments = filteredLeads.filter(l => 
    l.salesStatus === 'Appointment Booked' || 
    l.salesStatus === 'Site Visit / Demo' || 
    l.salesStatus === 'Contract Sent' || 
    l.salesStatus === 'Won / Closed'
  ).length;
  const totalClosedDeals = filteredLeads.filter(l => l.salesStatus === 'Won / Closed').length;
  const totalPipelineWon = filteredLeads
    .filter(l => l.salesStatus === 'Won / Closed')
    .reduce((acc, l) => acc + l.estimatedValue, 0);
  const totalPipelineActive = filteredLeads
    .filter(l => l.salesStatus !== 'Lost / Disqualified')
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const cplSavingsPercent = avgCpl > 0 ? Math.round(((client.targetCpl - avgCpl) / client.targetCpl) * 100) : 0;

  // Chart data points dynamically updated based on active date-filtered leads
  const dynamicMetrics = deriveDailyMetricsFromLeads(filteredLeads, totalSpend, client.targetCpl);
  const activeMetrics = dynamicMetrics.length > 0 ? dynamicMetrics : dailyMetrics;
  const maxSpend = activeMetrics.length > 0 ? Math.max(...activeMetrics.map(d => d.spend), 1000) : 10000;
  const maxLeads = activeMetrics.length > 0 ? Math.max(...activeMetrics.map(d => d.leads), 5) : 20;
  const chartHeight = 220;
  const chartWidth = 720;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const points = activeMetrics.map((d, index) => {
    const x = padding.left + (index / Math.max(activeMetrics.length - 1, 1)) * graphWidth;
    const ySpend = padding.top + graphHeight - (d.spend / maxSpend) * graphHeight;
    const yLeads = padding.top + graphHeight - (d.leads / maxLeads) * graphHeight;
    return { x, ySpend, yLeads, data: d };
  });

  const spendPathD = points.length > 0
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.ySpend}`, '')
    : '';
  const spendAreaD = points.length > 0
    ? `${spendPathD} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`
    : '';

  const hasAnyData = campaigns.length > 0 || leads.length > 0;

  return (
    <div className="space-y-6">
      {/* Empty State Banner if no data */}
      {!hasAnyData && (
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 text-amber-400 flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-neutral-100">
              No Meta Ads or Lead Data Connected Yet
            </h3>
            <p className="text-xs text-neutral-400">
              Your workspace is clean. Connect your Meta Ads account, import inquiries from Google Sheets/CSV, or load sample agency data to preview the dashboard.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('integrations')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors flex items-center gap-1.5 shadow-sm shadow-amber-400/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Sheet / CSV</span>
            </button>
            <button
              onClick={onOpenNewLeadModal}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Lead Manually</span>
            </button>
            <button
              onClick={onLoadSampleData}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Load Sample Demo Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Digitrix Media Executive Performance Statement */}
      <div className="rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-amber-950/40 border border-amber-500/30 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-amber-400 tracking-wider uppercase font-mono">
                Digitrix Media Performance Review
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-300 font-medium">{client.companyName}</span>
              <span className="text-neutral-500">·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> {hasAnyData ? 'Exceeding Lead Gen KPI' : 'Awaiting Ingestion'}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100 text-balance">
              {totalLeads > 0 ? (
                <>
                  Delivering qualified leads at <span className="text-amber-400 font-mono">{metaConnected ? `₹${avgCpl.toFixed(0)} CPL` : 'NA CPL'}</span> ({metaConnected ? `${cplSavingsPercent}% below target` : 'NA target'}) with <span className="text-emerald-400 font-mono">{formatINRPipeline(totalPipelineActive)}</span> active pipeline.
                </>
              ) : (
                <>
                  Meta Ads Lead & Conversion Intelligence System ready for <span className="text-amber-400">{client.companyName}</span>.
                </>
              )}
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Digitrix Meta Ads targeting pre-qualifies buyers based on intent score, purchase timeline, and validated budget. Speed-to-lead analysis demonstrates that inquiries contacted within 15 minutes convert at 4.2x higher rate.
            </p>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('sales-audit')}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm shadow-amber-400/20"
            >
              <span>View Sales Speed Audit</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap border border-neutral-700"
            >
              <span>Client Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1 */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Meta Ad Spend</span>
            <span className="font-mono text-neutral-400 font-bold">₹</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-100">
            {metaConnected ? (totalSpend > 0 ? formatINRPipeline(totalSpend) : '₹0') : 'NA'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span>{metaConnected ? (totalSpend > 0 ? `₹${(totalSpend / 100000).toFixed(2)} Lakhs` : 'Zero Spend') : 'Connect Meta Ads'}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Total Leads</span>
            <Users className="w-4 h-4 text-neutral-500" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-100">
            {totalLeads}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
            <span>In selected date range</span>
          </div>
        </div>

        {/* Metric 3: CPL */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Avg Cost Per Lead</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-amber-400">
            {metaConnected ? (avgCpl > 0 ? `₹${avgCpl.toFixed(0)}` : '₹0') : 'NA'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span>Target: ₹{client.targetCpl}</span>
          </div>
        </div>

        {/* Metric 4: Lead Quality */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>High-Intent Ratio</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-400">
            {qualifiedPercent}%
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
            <span>{qualifiedLeads} Grade A/B leads</span>
          </div>
        </div>

        {/* Metric 5: Appointments */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Site Visits / Bookings</span>
            <CalendarCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-100">
            {bookedAppointments}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
            <span>{bookedAppointments > 0 ? `₹${Math.round(totalSpend / bookedAppointments).toLocaleString('en-IN')} / visit` : '0 booked'}</span>
          </div>
        </div>

        {/* Metric 6: Deals & Revenue */}
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
            <span>Closed Revenue</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-100">
            {totalPipelineWon > 0 ? formatINRPipeline(totalPipelineWon) : '₹0'}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400 font-mono">
            <span>{totalClosedDeals} deals closed</span>
          </div>
        </div>
      </div>

      {/* Main Visual Section: Interactive Timeline Chart & Spend Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Chart */}
        <div className="lg:col-span-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>Real-Time Ad Spend & Lead Velocity</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Date-wise spend trajectory in INR (₹) vs lead generation volume.
              </p>
            </div>

            {/* Chart Legend */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-3 h-0.5 bg-amber-400 inline-block rounded" />
                <span>Spend (₹)</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-300">
                <span className="w-2.5 h-2.5 bg-emerald-500/80 inline-block rounded-sm" />
                <span>Leads</span>
              </div>
              <div className="flex items-center gap-1.5 text-neutral-400">
                <span className="w-3 h-0 border-t border-dashed border-rose-400 inline-block" />
                <span>Target CPL (₹{client.targetCpl})</span>
              </div>
            </div>
          </div>

          {/* SVG Chart or Empty Placeholder */}
          {activeMetrics.length > 0 ? (
            <div className="relative w-full overflow-hidden select-none">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-56 overflow-visible"
              >
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = padding.top + graphHeight * (1 - ratio);
                  const value = Math.round(maxSpend * ratio);
                  const label = value >= 1000 ? `₹${Math.round(value / 1000)}k` : `₹${value}`;
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        fill="#737373"
                        fontSize="9"
                        fontFamily="JetBrains Mono"
                        textAnchor="end"
                      >
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Bar charts for leads */}
                {points.map((p, i) => {
                  const barWidth = Math.max(graphWidth / points.length - 4, 6);
                  const barHeight = chartHeight - padding.bottom - p.yLeads;
                  return (
                    <rect
                      key={`bar-${i}`}
                      x={p.x - barWidth / 2}
                      y={p.yLeads}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      fill="#10b981"
                      opacity={hoveredDay?.date === p.data.date ? 0.95 : 0.45}
                      rx="2"
                      className="transition-all duration-150 cursor-pointer"
                      onMouseEnter={() => setHoveredDay(p.data)}
                    />
                  );
                })}

                {/* Spend area and line */}
                <path d={spendAreaD} fill="url(#spendGradient)" />
                <path
                  d={spendPathD}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points on spend line */}
                {points.map((p, i) => (
                  <circle
                    key={`pt-${i}`}
                    cx={p.x}
                    cy={p.ySpend}
                    r={hoveredDay?.date === p.data.date ? 5 : 2.5}
                    fill={hoveredDay?.date === p.data.date ? '#fef08a' : '#f59e0b'}
                    stroke="#171717"
                    strokeWidth="1.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredDay(p.data)}
                  />
                ))}

                {/* X Axis labels */}
                {points
                  .filter((_, i) => i % Math.max(Math.floor(points.length / 5), 1) === 0 || i === points.length - 1)
                  .map((p, i) => (
                    <text
                      key={`lbl-${i}`}
                      x={p.x}
                      y={chartHeight - 8}
                      fill="#a3a3a3"
                      fontSize="9"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {p.data.date}
                    </text>
                  ))}
              </svg>

              {/* Hover Tooltip in INR */}
              {hoveredDay && (
                <div className="absolute top-2 right-4 bg-neutral-950/95 border border-amber-500/40 rounded-lg p-2.5 text-xs shadow-xl backdrop-blur-md font-mono z-10 animate-in fade-in duration-100">
                  <div className="text-neutral-400 font-sans font-semibold mb-1 border-b border-neutral-800 pb-1">
                    {hoveredDay.date} · Performance
                  </div>
                  <div className="flex justify-between gap-4 text-neutral-300">
                    <span>Ad Spend:</span>
                    <span className="text-amber-400 font-bold">₹{hoveredDay.spend.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-neutral-300">
                    <span>Leads:</span>
                    <span className="text-emerald-400 font-bold">{hoveredDay.leads}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-neutral-300">
                    <span>Cost Per Lead:</span>
                    <span className="text-neutral-100 font-bold">₹{hoveredDay.cpl.toFixed(0)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs space-y-2">
              <CalendarCheck className="w-8 h-8 text-neutral-600" />
              <span>No daily spend metrics recorded for the selected date period.</span>
              <button
                onClick={() => onNavigateTab('meta-ads')}
                className="text-amber-400 hover:text-amber-300 text-xs underline font-mono"
              >
                Log campaign spend in Meta Ads tab
              </button>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Digitrix Algorithm monitors daily CPL efficiency against agreed target ceiling.</span>
            </span>
            <button
              onClick={() => onNavigateTab('meta-ads')}
              className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
            >
              <span>Explore Campaigns</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Spend Efficiency Gauge & Quality Distribution */}
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-neutral-100">Spend Efficiency Index</h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {avgCpl > 0 && avgCpl <= client.targetCpl ? 'OPTIMAL' : 'MONITORING'}
              </span>
            </div>

            {/* Visual Gauge */}
            <div className="relative pt-2 pb-4 text-center">
              <div className="w-36 h-20 mx-auto overflow-hidden relative">
                <div className="w-36 h-36 rounded-full border-[12px] border-neutral-800 border-t-amber-400 border-r-amber-400 -rotate-45" />
              </div>
              <div className="mt-1 font-mono text-2xl font-black text-neutral-100">
                {avgCpl > 0 ? `${Math.round((client.targetCpl / avgCpl) * 100)}%` : '100%'}
              </div>
              <div className="text-xs text-neutral-400">
                Budget Efficiency Factor
              </div>
            </div>

            <div className="space-y-2 text-xs border-t border-neutral-800 pt-3">
              <div className="flex justify-between text-neutral-300">
                <span>Monthly Budget Utilization:</span>
                <span className="font-mono font-semibold text-neutral-100">
                  {totalSpend > 0 ? `${Math.round((totalSpend / client.monthlyBudget) * 100)}%` : '0%'}
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-1.5">
                <div
                  className="bg-amber-400 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((totalSpend / client.monthlyBudget) * 100))}%` }}
                />
              </div>

              <div className="flex justify-between text-neutral-300 pt-1">
                <span>Target CPL Ceiling:</span>
                <span className="font-mono text-neutral-400">₹{client.targetCpl}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Actual Digitrix CPL:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {avgCpl > 0 ? `₹${avgCpl.toFixed(0)}` : '₹0'}
                </span>
              </div>
            </div>
          </div>

          {/* Lead Intent Breakdown (Grade A/B/C/D) */}
          <div className="border-t border-neutral-800 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200">
                Lead Intent Distribution
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">
                {totalLeads} Total Leads
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-emerald-400 font-medium">Grade A (Verified Budget & Immediate)</span>
                  <span className="font-mono text-neutral-200">
                    {totalLeads > 0 ? `${Math.round((filteredLeads.filter(l => l.intentGrade === 'A').length / totalLeads) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full"
                    style={{ width: totalLeads > 0 ? `${Math.round((filteredLeads.filter(l => l.intentGrade === 'A').length / totalLeads) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-cyan-400 font-medium">Grade B (High Budget, 1-3 Mo)</span>
                  <span className="font-mono text-neutral-200">
                    {totalLeads > 0 ? `${Math.round((filteredLeads.filter(l => l.intentGrade === 'B').length / totalLeads) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                  <div
                    className="bg-cyan-400 h-1.5 rounded-full"
                    style={{ width: totalLeads > 0 ? `${Math.round((filteredLeads.filter(l => l.intentGrade === 'B').length / totalLeads) * 100)}%` : '0%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-0.5">
                  <span className="text-amber-400 font-medium">Grade C (Nurture / 6+ Mo)</span>
                  <span className="font-mono text-neutral-200">
                    {totalLeads > 0 ? `${Math.round((filteredLeads.filter(l => l.intentGrade === 'C').length / totalLeads) * 100)}%` : '0%'}
                  </span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: totalLeads > 0 ? `${Math.round((filteredLeads.filter(l => l.intentGrade === 'C').length / totalLeads) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Ad Creative Spotlight (Only rendered if creatives exist) */}
      {creatives.length > 0 && (
        <div className="rounded-2xl bg-neutral-900/90 border border-neutral-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                <span>Top-Performing Meta Ad Creative</span>
                <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  High-Converting Asset
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Live visual creative driving the lowest cost-per-lead and highest pre-qualified conversion rate.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('meta-ads')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View All Creatives & Placements</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="relative rounded-xl overflow-hidden border border-neutral-800 aspect-video md:aspect-[16/10] bg-neutral-950 group">
              <img
                src={creatives[0]?.imageUrl}
                alt={creatives[0]?.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-900/80 text-amber-400 border border-neutral-700 backdrop-blur-sm">
                Instagram & Facebook Feed
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <h4 className="text-lg font-bold text-neutral-100 leading-snug">
                  "{creatives[0]?.headline}"
                </h4>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  "{creatives[0]?.copy}"
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-neutral-800 pt-3">
                <div>
                  <span className="text-[11px] text-neutral-400">Total Spend</span>
                  <div className="text-base font-bold font-mono text-neutral-100">
                    ₹{creatives[0]?.spend.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400">Leads Generated</span>
                  <div className="text-base font-bold font-mono text-emerald-400">
                    {creatives[0]?.leads} leads
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400">Cost Per Lead</span>
                  <div className="text-base font-bold font-mono text-amber-400">
                    ₹{creatives[0]?.cpl.toFixed(0)}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-neutral-400">Form Conv. Rate</span>
                  <div className="text-base font-bold font-mono text-neutral-100">
                    {creatives[0]?.conversionRate}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
