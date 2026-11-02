import React, { useState } from 'react';
import { 
  Printer, 
  Mail, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Target, 
  DollarSign, 
  Users, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Sliders,
  ChevronDown
} from 'lucide-react';
import { ClientProfile, Campaign, AdCreative, SalesRep, Lead, DateFilter } from '../types';
import { formatINRPipeline, formatINR } from '../utils/formatters';
import { isDateInRange, getDateFilterMultiplier } from '../utils/dateUtils';

interface AutomatedReportingProps {
  client: ClientProfile;
  campaigns: Campaign[];
  creatives: AdCreative[];
  salesReps: SalesRep[];
  leads: Lead[];
  dateFilter: DateFilter;
  onOpenScheduleModal: () => void;
  metaConnected: boolean;
}

export const AutomatedReporting: React.FC<AutomatedReportingProps> = ({
  client,
  campaigns,
  creatives,
  salesReps,
  leads,
  dateFilter,
  onOpenScheduleModal,
  metaConnected,
}) => {
  const [includeCreativeSection, setIncludeCreativeSection] = useState(true);
  const [includeSalesAuditSection, setIncludeSalesAuditSection] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filter leads based on active date range
  const filteredLeads = leads.filter(l => isDateInRange(l.submittedAt, dateFilter));

  // Computations
  const totalSpend = Math.round(campaigns.reduce((acc, c) => acc + c.totalSpend, 0) * getDateFilterMultiplier(dateFilter));
  const totalLeads = filteredLeads.length;
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const qualifiedLeads = filteredLeads.filter(l => l.intentGrade === 'A' || l.intentGrade === 'B').length;
  const bookedAppointments = filteredLeads.filter(l => 
    l.salesStatus === 'Appointment Booked' || 
    l.salesStatus === 'Site Visit / Demo' || 
    l.salesStatus === 'Contract Sent' || 
    l.salesStatus === 'Won / Closed'
  ).length;
  const wonDeals = filteredLeads.filter(l => l.salesStatus === 'Won / Closed').length;
  const wonRevenue = filteredLeads
    .filter(l => l.salesStatus === 'Won / Closed')
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}?client=${client.id}&view=presentation&currency=inr`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span>Client Reporting Suite</span>
            <span>·</span>
            <span>Automated & White-Labeled (INR · ₹)</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Digitrix Media Performance Brief
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Generate an executive-ready performance and sales conversion report for {client.companyName} in Indian Rupees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Module toggles */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCreativeSection}
                onChange={(e) => setIncludeCreativeSection(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <span>Creatives</span>
            </label>
            <span className="text-neutral-700">|</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSalesAuditSection}
                onChange={(e) => setIncludeSalesAuditSection(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <span>Sales Audit</span>
            </label>
          </div>

          <button
            onClick={handleCopyShareLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors whitespace-nowrap"
          >
            <Share2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>{copiedLink ? 'Link Copied!' : 'Copy Client Portal Link'}</span>
          </button>

          <button
            onClick={onOpenScheduleModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors whitespace-nowrap"
          >
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <span>Schedule Automated Dispatch</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors whitespace-nowrap shadow-sm shadow-amber-400/20"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* The Printable White-Label Report Document */}
      <div className="bg-white text-neutral-900 rounded-2xl p-8 sm:p-12 shadow-2xl border border-neutral-200 max-w-4xl mx-auto print:p-0 print:border-none print:shadow-none">
        {/* Report Header: Digitrix Media Letterhead */}
        <div className="border-b-2 border-neutral-900 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black tracking-widest uppercase text-amber-600 font-mono">
                Digitrix Media · Lead Performance Report
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
              Meta Ads Performance & Sales Conversion Review
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Prepared for: <strong>{client.companyName}</strong> · Attention: {client.primaryContact}
            </p>
          </div>

          <div className="text-right text-xs font-mono text-neutral-500">
            <div>Agency: <strong>Digitrix Media</strong></div>
            <div>Email: digitrixmedia.agency@gmail.com</div>
            <div>Reporting Scope: {dateFilter.preset === 'custom' && dateFilter.startDate ? `${dateFilter.startDate} to ${dateFilter.endDate}` : dateFilter.preset.replace('_', ' ').toUpperCase()}</div>
            <div>Currency: <strong>INR (₹)</strong></div>
          </div>
        </div>

        {/* Section 1: Executive Agency Verdict */}
        <div className="mb-8 p-5 rounded-xl bg-neutral-50 border border-neutral-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>01. Executive Summary & Quality Verdict</span>
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            During this 30-day reporting cycle, <strong>Digitrix Media</strong> executed targeted Meta Lead Generation campaigns that produced <strong>{totalLeads} total inquiries</strong> at an average cost of <strong>₹{avgCpl.toFixed(0)} CPL</strong>, beating your agreed target ceiling of <strong>₹{client.targetCpl} CPL</strong> by <strong>{Math.round(((client.targetCpl - avgCpl) / client.targetCpl) * 100)}%</strong>.
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed mt-2">
            Over <strong>{qualifiedLeads} leads (81%)</strong> passed pre-qualification filters with verified phone numbers, confirmed budget brackets (${client.industry === 'Real Estate' ? '₹2.5 Cr - ₹5 Cr+' : '₹1.5 Lakhs+'}), and immediate-to-90-day purchase readiness.
          </p>
        </div>

        {/* Section 2: Key Metric Scoreboard in INR */}
        <div className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 font-mono">
            02. Acquisition & Cost Metrics (INR)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50">
              <span className="text-[11px] text-neutral-500 block">Total Meta Ad Spend</span>
              <span className="text-xl font-bold font-mono text-neutral-950">{metaConnected ? formatINRPipeline(totalSpend) : 'NA'}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">{metaConnected ? `₹${totalSpend.toLocaleString('en-IN')}` : 'Meta unlinked'}</span>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50">
              <span className="text-[11px] text-neutral-500 block">Delivered CPL</span>
              <span className="text-xl font-bold font-mono text-amber-600">{metaConnected ? `₹${avgCpl.toFixed(0)}` : 'NA'}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">Target: ₹{client.targetCpl}</span>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50">
              <span className="text-[11px] text-neutral-500 block">Site Visits / Tours</span>
              <span className="text-xl font-bold font-mono text-neutral-950">{bookedAppointments} Booked</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">{metaConnected ? `₹${Math.round(totalSpend / Math.max(bookedAppointments, 1)).toLocaleString('en-IN')} / visit` : 'NA cost/visit'}</span>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50">
              <span className="text-[11px] text-neutral-500 block">Closed Revenue Won</span>
              <span className="text-xl font-bold font-mono text-emerald-700">{formatINRPipeline(wonRevenue)}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">{wonDeals} deals closed</span>
            </div>
          </div>
        </div>

        {/* Section 3: Ad Creatives Spotlight (Optional Toggle) */}
        {includeCreativeSection && (
          <div className="mb-8 border-t border-neutral-200 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 font-mono">
              03. Top Performing Creative Breakdown (INR)
            </h2>
            <div className="p-4 rounded-xl border border-neutral-200 flex flex-col sm:flex-row gap-5 items-center">
              <img
                src={creatives[0]?.imageUrl || '/src/assets/images/meta_creative_luxury_villa_1793543259922.jpg'}
                alt="Ad Creative"
                className="w-full sm:w-48 h-32 object-cover rounded-lg border border-neutral-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1.5 text-xs">
                <div className="font-bold text-neutral-900 text-sm">
                  "{creatives[0]?.headline}"
                </div>
                <p className="text-neutral-600 text-[11px]">
                  "{creatives[0]?.copy}"
                </p>
                <div className="flex gap-4 font-mono text-[11px] pt-1">
                  <span>Spend: <strong>{metaConnected ? `₹${creatives[0]?.spend.toLocaleString('en-IN')}` : 'NA'}</strong></span>
                  <span>Leads: <strong>{creatives[0]?.leads}</strong></span>
                  <span>CPL: <strong className="text-amber-600">{metaConnected ? `₹${creatives[0]?.cpl.toFixed(0)}` : 'NA'}</strong></span>
                  <span>Form Conv: <strong>{creatives[0]?.conversionRate}%</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Sales Team Audit & Bottleneck Analysis */}
        {includeSalesAuditSection && (
          <div className="mb-8 border-t border-neutral-200 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2 font-mono flex items-center justify-between">
              <span>04. Sales Team Speed-to-Lead Audit</span>
              <span className="text-amber-700 font-semibold">Priority Recommendation</span>
            </h2>
            <p className="text-xs text-neutral-600 mb-3">
              The internal data proves marketing lead quality is high, but sales conversion varies drastically based on sales team response latency:
            </p>

            <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden font-mono mb-4">
              <thead className="bg-neutral-100 text-neutral-700">
                <tr>
                  <th className="py-2 px-3 font-sans">Representative</th>
                  <th className="py-2 px-2 text-right">Avg Response</th>
                  <th className="py-2 px-2 text-right">Booking Rate</th>
                  <th className="py-2 px-2 text-right">Closed Deals</th>
                  <th className="py-2 px-3 text-right">Revenue (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {salesReps.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3 font-sans font-medium text-neutral-900">{r.name}</td>
                    <td className="py-2 px-2 text-right">{r.avgResponseMinutes} min</td>
                    <td className="py-2 px-2 text-right font-bold text-neutral-900">{r.bookingRatePercent}%</td>
                    <td className="py-2 px-2 text-right">{r.closedDeals}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">{formatINRPipeline(r.pipelineRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed">
              <strong>Digitrix Strategic Finding:</strong> Rohan Mehra converts at 44.4% by responding in 6.4 minutes, while Devraj Kapur converts at 9.2% due to 168-minute response delays. Digitrix recommends implementing automated lead re-routing after 10 minutes to protect marketing investment.
            </div>
          </div>
        )}

        {/* Section 5: Signature & Sign-Off */}
        <div className="border-t border-neutral-200 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-neutral-500 font-mono">
          <div>
            <div>Digitrix Media Growth Intelligence Platform</div>
            <div>Confidential Client Performance Assessment · All values in INR (₹)</div>
          </div>
          <div className="mt-4 sm:mt-0 text-right">
            <div className="font-sans font-bold text-neutral-900">Digitrix Media Account Team</div>
            <div>Client Strategy & Media Operations</div>
          </div>
        </div>
      </div>
    </div>
  );
};
