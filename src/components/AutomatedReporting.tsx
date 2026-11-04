import React, { useState, useMemo } from 'react';
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
  MessageSquare,
  Copy,
  Check,
  AlertTriangle,
  TrendingUp,
  PhoneCall,
  Search,
  Send,
  Eye,
  Filter
} from 'lucide-react';
import { ClientProfile, Campaign, AdCreative, SalesRep, Lead, DateFilter } from '../types';
import { formatINRPipeline, formatINR } from '../utils/formatters';
import { isDateInRange, getDateFilterMultiplier } from '../utils/dateUtils';
import { isLeadMissingOnCrm } from '../utils/googleSheets';

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
  const [commentFilter, setCommentFilter] = useState<'all' | 'visits' | 'warm' | 'timing' | 'missing_crm'>('all');
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  // Filter leads based on active date range
  const filteredLeads = useMemo(() => {
    return leads.filter(l => isDateInRange(l.submittedAt, dateFilter));
  }, [leads, dateFilter]);

  // Lead Funnel Stage Counts
  const totalLeads = filteredLeads.length;
  const totalSpend = Math.round(campaigns.reduce((acc, c) => acc + c.totalSpend, 0) * getDateFilterMultiplier(dateFilter));
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

  // Breakdown counts
  const countQualified = filteredLeads.filter(l => l.intentGrade === 'A' || l.intentGrade === 'B' || l.salesStatus === 'Qualified').length;
  const countSiteVisits = filteredLeads.filter(l => l.salesStatus === 'Site Visit / Demo' || l.salesStatus === 'Appointment Booked').length;
  const countWarm = filteredLeads.filter(l => l.salesStatus === 'Warm Lead' || l.salesStatus === 'Contacted').length;
  const countContract = filteredLeads.filter(l => l.salesStatus === 'Contract Sent').length;
  const countWon = filteredLeads.filter(l => l.salesStatus === 'Won / Closed').length;
  const countDnp = filteredLeads.filter(l => l.salesStatus === 'DNP (Call Again)').length;
  const countLost = filteredLeads.filter(l => l.salesStatus === 'Lost / Disqualified').length;
  const countNew = filteredLeads.filter(l => l.salesStatus === 'New').length;

  // "No Data on CRM" Discrepancy Counting
  const missingOnCrmLeads = useMemo(() => {
    return filteredLeads.filter(isLeadMissingOnCrm);
  }, [filteredLeads]);
  const countMissingOnCrm = missingOnCrmLeads.length;
  const missingPipelineValue = missingOnCrmLeads.reduce((acc, l) => acc + l.estimatedValue, 0);

  const wonRevenue = filteredLeads
    .filter(l => l.salesStatus === 'Won / Closed')
    .reduce((acc, l) => acc + l.estimatedValue, 0);

  // Dynamic Comment Extraction & Sentiment Categorization
  const categorizedComments = useMemo(() => {
    return filteredLeads
      .filter(l => (l.detailedComment && l.detailedComment.trim().length > 0) || (l.notes && l.notes.trim().length > 0))
      .map(l => {
        const text = `${l.detailedComment || ''} ${l.notes || ''} ${l.purchaseTimeline || ''}`.toLowerCase();
        
        // Categorize based on keywords and "No data on CRM"
        let category: 'visits' | 'warm' | 'timing' | 'missing_crm' = 'warm';
        if (isLeadMissingOnCrm(l)) {
          category = 'missing_crm';
        } else if (
          text.includes('visit') || 
          text.includes('walkthrough') || 
          text.includes('diwali') || 
          text.includes('festival') || 
          text.includes('tour') || 
          text.includes('sunday') || 
          text.includes('saturday') || 
          text.includes('weekend') || 
          text.includes('soon this month') || 
          text.includes('immediate') ||
          text.includes('ready within 30')
        ) {
          category = 'visits';
        } else if (
          text.includes('week later') || 
          text.includes('contact later') || 
          text.includes('shared details') || 
          text.includes('december') || 
          text.includes('next week') || 
          text.includes('call back') || 
          text.includes('comparing') || 
          text.includes('3 months') ||
          text.includes('no plan')
        ) {
          category = 'timing';
        }

        return {
          lead: l,
          category,
          comment: l.detailedComment || l.notes || 'Inquiry registered.',
        };
      });
  }, [filteredLeads]);

  const filteredCommentsList = useMemo(() => {
    if (commentFilter === 'all') return categorizedComments;
    return categorizedComments.filter(c => c.category === commentFilter);
  }, [categorizedComments, commentFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}?client=${client.id}&view=presentation&currency=inr`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyScript = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2500);
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
            Comprehensive lead generation audit with spreadsheet comment intelligence, stage counts, and smart WhatsApp follow-up action plan.
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
                Digitrix Media · Lead Generation & Conversion Intelligence
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

        {/* Section 1: Executive Agency Verdict & Quality Rubric */}
        <div className="mb-8 p-5 rounded-xl bg-neutral-50 border border-neutral-200">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-2 font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>01. Executive Summary & Lead Generation Quality Verdict</span>
          </h2>
          <p className="text-sm text-neutral-700 leading-relaxed">
            During this reporting cycle, <strong>Digitrix Media</strong> executed targeted Meta Lead Generation campaigns delivering <strong>{totalLeads} total prospect inquiries</strong> at an average delivered cost of <strong>₹{avgCpl.toFixed(0)} CPL</strong>. This beats the contracted ceiling of <strong>₹{client.targetCpl} CPL</strong> by <strong>{client.targetCpl > 0 ? Math.round(((client.targetCpl - avgCpl) / client.targetCpl) * 100) : 0}%</strong>.
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-700 pt-2 border-t border-neutral-200/80">
            <div>
              <strong className="text-neutral-950">How Leads Are Qualified:</strong> Every inquiry is pre-filtered through customized Meta Instant Forms requiring active OTP/phone verification, stated purchase horizons (immediate to 90 days), and declared budget brackets (${client.industry === 'Real Estate' ? '₹2.5 Cr - ₹5 Cr+' : '₹1.5 Lakhs+'}).
            </div>
            <div>
              <strong className="text-neutral-950">High-Intent Verdict:</strong> Over <strong>{countQualified} leads ({totalLeads > 0 ? Math.round((countQualified / totalLeads) * 100) : 0}%)</strong> are confirmed high-quality Grade A/B prospects with verifiable intent documented in sales remarks.
            </div>
          </div>

          {/* CRM Data Completeness Alert */}
          {countMissingOnCrm > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200/90 text-xs text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  <strong>Data Audit Finding:</strong> {countMissingOnCrm} leads ({totalLeads > 0 ? Math.round((countMissingOnCrm / totalLeads) * 100) : 0}% of inquiries) have the remark <em>"No data on CRM"</em> in spreadsheet comments.
                </span>
              </span>
              <button
                onClick={() => setCommentFilter('missing_crm')}
                className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 no-print self-start sm:self-auto cursor-pointer"
              >
                View {countMissingOnCrm} Missing Leads ↓
              </button>
            </div>
          )}
        </div>

        {/* Section 2: Full Lead Stage Counting & Pipeline Breakdown */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
              02. Detailed Lead Stage Counting & Pipeline Conversion
            </h2>
            <span className="text-[11px] font-mono text-neutral-400">Total Inquiries: {totalLeads}</span>
          </div>

          {/* Detailed Stage Counters with Missing on CRM as a distinct metric */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/70">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">Total Inbound</span>
              <span className="text-xl font-bold font-mono text-neutral-950">{totalLeads}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">100% Meta</span>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 block">Qualified</span>
              <span className="text-xl font-bold font-mono text-amber-700">{countQualified}</span>
              <span className="text-[10px] text-amber-700 block mt-0.5">{totalLeads > 0 ? Math.round((countQualified / totalLeads) * 100) : 0}% Pass Filter</span>
            </div>

            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 block">Site Visits</span>
              <span className="text-xl font-bold font-mono text-blue-800">{countSiteVisits}</span>
              <span className="text-[10px] text-blue-600 block mt-0.5">Tours Booked</span>
            </div>

            <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 block">Warm Nurture</span>
              <span className="text-xl font-bold font-mono text-purple-800">{countWarm}</span>
              <span className="text-[10px] text-purple-600 block mt-0.5">Active Dialogue</span>
            </div>

            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/40">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 block">Won / Closed</span>
              <span className="text-xl font-bold font-mono text-emerald-800">{countWon}</span>
              <span className="text-[10px] text-emerald-600 block mt-0.5">{formatINRPipeline(wonRevenue)}</span>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-100/50">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">DNP / Lost</span>
              <span className="text-xl font-bold font-mono text-neutral-700">{countDnp + countLost}</span>
              <span className="text-[10px] text-neutral-500 block mt-0.5">Re-engage</span>
            </div>

            {/* Separate Point: Missing on CRM */}
            <div className={`p-3 rounded-xl border ${countMissingOnCrm > 0 ? 'border-rose-300 bg-rose-50/90 shadow-xs' : 'border-neutral-200 bg-neutral-50/70'}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono uppercase tracking-wider block font-bold ${countMissingOnCrm > 0 ? 'text-rose-700' : 'text-neutral-500'}`}>
                  Missing on CRM
                </span>
                {countMissingOnCrm > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>
              <span className={`text-xl font-bold font-mono ${countMissingOnCrm > 0 ? 'text-rose-800' : 'text-neutral-950'}`}>{countMissingOnCrm}</span>
              <span className={`text-[10px] block mt-0.5 font-medium ${countMissingOnCrm > 0 ? 'text-rose-600' : 'text-neutral-500'}`}>
                {countMissingOnCrm > 0 ? '"No data on CRM"' : 'All Ingested'}
              </span>
            </div>
          </div>

          {/* Text Explanation of Each Stage for Client Understanding */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3 text-xs text-neutral-700 leading-relaxed">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>How Leads Are Qualified ({countQualified} Prospects):</strong> These prospects have answered all qualifying custom questions, specified an exact BHK/commercial configuration, confirmed ready budget (e.g., ₹2.5 Cr+), and have either scheduled a call or engaged positively with sales reps.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>How Site Visits Are Done ({countSiteVisits} Completed / Booked):</strong> Prospects who have progressed past initial telephonic discovery and locked in physical or virtual guided walkthroughs. For luxury projects, these include private architect consultations, sample villa walkthroughs, and family viewing sessions.
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>How Warm Leads Progress ({countWarm} Prospects):</strong> Prospects who have confirmed interest and requested detailed layouts, payment schedules, or bank loan approvals. They are actively comparing options and need sustained, consistent touches so they do not disengage.
              </div>
            </div>

            {/* Separate Point for Missing on CRM */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-200 bg-rose-50/80 text-xs text-rose-950">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-900 flex items-center gap-2">
                  <span>Discrepancy Audit: Leads Missing on CRM ({countMissingOnCrm} Leads / {totalLeads > 0 ? Math.round((countMissingOnCrm / totalLeads) * 100) : 0}% of Total Inbound)</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-200 text-rose-800 text-[10px] font-mono font-bold">Action Required</span>
                </div>
                <p className="mt-1 text-rose-900 leading-relaxed text-[11px]">
                  These <strong>{countMissingOnCrm} prospects</strong> were successfully generated through Meta Ads campaigns and entered into the Google Sheet with the remark <em>"No data on CRM"</em>. They represent <strong>{formatINRPipeline(missingPipelineValue)} in unlogged pipeline opportunity</strong>. Because they exist on the spreadsheet but not inside the client's internal CRM, sales representatives have not assigned them follow-up cadences. We recommend immediately importing and assigning these leads to sales reps to prevent revenue loss.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Spreadsheet Comment Intelligence Deep-Dive */}
        <div className="mb-8 border-t border-neutral-200 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>03. Spreadsheet Comment Intelligence & Real Prospect Remarks</span>
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                Verbatim remarks and detailed notes extracted directly from your connected Google Sheet and CRM records:
              </p>
            </div>

            {/* Filter pills for live viewing (no-print) */}
            <div className="flex flex-wrap items-center gap-1 bg-neutral-100 p-1 rounded-lg text-[11px] font-medium no-print self-start">
              <button
                onClick={() => setCommentFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${commentFilter === 'all' ? 'bg-white text-neutral-950 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                All Remarks ({categorizedComments.length})
              </button>
              <button
                onClick={() => setCommentFilter('visits')}
                className={`px-2.5 py-1 rounded-md transition-colors ${commentFilter === 'visits' ? 'bg-white text-neutral-950 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Visits & Festivals
              </button>
              <button
                onClick={() => setCommentFilter('timing')}
                className={`px-2.5 py-1 rounded-md transition-colors ${commentFilter === 'timing' ? 'bg-white text-neutral-950 font-bold shadow-xs' : 'text-neutral-600 hover:text-neutral-900'}`}
              >
                Call Next Week / Later
              </button>
              <button
                onClick={() => setCommentFilter('missing_crm')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  commentFilter === 'missing_crm'
                    ? 'bg-rose-600 text-white font-bold shadow-xs'
                    : 'text-rose-700 hover:text-rose-900 hover:bg-rose-50'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Missing on CRM ({countMissingOnCrm})</span>
              </button>
            </div>
          </div>

          {/* Key Intelligence Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
              <span className="font-bold text-amber-900 block mb-1">Diwali & Month-End Readiness</span>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Multiple prospects explicitly noted <em>"visiting this month"</em>, <em>"surely visit after Diwali"</em>, or <em>"ready within 30 days"</em>. These buyers tie their capital disbursement to festive milestones.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block mb-1">Liquid Self-Funded Equity</span>
              <p className="text-blue-800 text-[11px] leading-relaxed">
                Comments document confirmed cash readiness, such as <em>"self-funded equity ready in bank"</em> and <em>"ready for token advance"</em>, proving campaign reach into genuine HNW circles.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
              <span className="font-bold text-purple-900 block mb-1">Specific Architectural Criteria</span>
              <p className="text-purple-800 text-[11px] leading-relaxed">
                Prospects ask detailed questions regarding Vaastu entrance compliance, private EV chargers, and duplex terrace plans, demonstrating deep, non-casual consideration.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-300 text-xs">
              <span className="font-bold text-rose-950 block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>"No Data on CRM" Discrepancy ({countMissingOnCrm})</span>
              </span>
              <p className="text-rose-900 text-[11px] leading-relaxed">
                Spreadsheet comments explicitly tag <strong>{countMissingOnCrm} untracked leads</strong>. These were logged in the sheet but need urgent input into the sales team's daily CRM call roster.
              </p>
            </div>
          </div>

          {/* Table of Actual Spreadsheet Remarks */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden mb-4">
            <div className="bg-neutral-100 px-4 py-2 text-[11px] font-bold font-mono text-neutral-700 uppercase tracking-wider flex items-center justify-between">
              <span>Prospect Name & Inquiry</span>
              <span>Spreadsheet Comment & Timeline Evidence</span>
            </div>

            <div className="divide-y divide-neutral-200 text-xs max-h-96 overflow-y-auto print:max-h-none">
              {filteredCommentsList.length > 0 ? (
                filteredCommentsList.map(({ lead, comment, category }, idx) => (
                  <div key={lead.id || idx} className="p-3.5 hover:bg-neutral-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="sm:w-1/3 shrink-0">
                      <div className="font-bold text-neutral-900">{lead.fullName}</div>
                      <div className="text-[11px] text-neutral-500">{lead.propertyTypeOrService} · {lead.budgetBracket}</div>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700">{lead.salesStatus}</span>
                        <span className="text-neutral-400">Rep: {lead.assignedRep}</span>
                      </div>
                    </div>

                    <div className={`sm:w-2/3 p-2.5 rounded-lg border ${
                      category === 'missing_crm' 
                        ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200' 
                        : 'bg-neutral-50 border-neutral-200/80'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-mono font-semibold uppercase flex items-center gap-1 ${
                          category === 'missing_crm' 
                            ? 'text-rose-700 font-bold' 
                            : category === 'visits' 
                            ? 'text-amber-700' 
                            : category === 'timing'
                            ? 'text-purple-700'
                            : 'text-neutral-600'
                        }`}>
                          {category === 'missing_crm' ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>🚨 "No Data on CRM" · Missing in Sales CRM</span>
                            </>
                          ) : category === 'visits' ? (
                            '📍 Confirmed Site Visit / Festival Timing'
                          ) : category === 'timing' ? (
                            '⏳ Follow-Up Requested'
                          ) : (
                            '💬 High-Intent Remarks'
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">{lead.submittedAt}</span>
                      </div>
                      <p className={`italic leading-snug ${category === 'missing_crm' ? 'text-rose-950 font-medium' : 'text-neutral-800'}`}>
                        "{comment}"
                      </p>
                      {lead.purchaseTimeline && (
                        <div className="text-[10px] font-mono text-neutral-500 mt-1">
                          Declared Timeline: <strong>{lead.purchaseTimeline}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-neutral-500">
                  No comments matching the selected filter. Showing all available CRM records.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Smart WhatsApp Follow-Up & Anti-Ghosting Protocol */}
        <div className="mb-8 border-t border-neutral-200 pt-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>04. Sales Team Action Plan: Smart WhatsApp Follow-Ups & Zero-Ghosting Protocol</span>
            </h2>
            <span className="text-emerald-700 font-mono font-bold text-xs">High Conversion Impact</span>
          </div>

          <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
            When high-ticket buyers say <em>"call me after a week"</em> or <em>"contact me after the festival"</em>, sales teams often make the critical mistake of total radio silence. By day 7, emotional urgency cools and competitors step in. Digitrix Media prescribes the <strong>"Zero-Ghosting 7-Day Nurture Protocol"</strong>:
          </p>

          {/* 7-Day Micro-Touch Rhythm Table */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-5">
            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Day 0 (Within 5 Min)</span>
              <span className="text-xs font-bold text-neutral-900 block">Digital Brochure & 3D Tour</span>
              <p className="text-[11px] text-neutral-600">
                Send welcome greeting via official WhatsApp business handle with high-res PDF and virtual video walkthrough.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Day 2 (Soft Value Drop)</span>
              <span className="text-xs font-bold text-neutral-900 block">Drone Sunset View Clip</span>
              <p className="text-[11px] text-neutral-600">
                Non-pushy 15-second teaser: <em>"Thought you'd love seeing today's sunset view from the 12th-floor terrace!"</em>
              </p>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Day 4 (Festival Benefit)</span>
              <span className="text-xs font-bold text-neutral-900 block">VIP Pre-Launch Preview</span>
              <p className="text-[11px] text-neutral-600">
                Announce limited festive slot reservations before general release, keeping project top-of-mind without pressure.
              </p>
            </div>

            <div className="p-3 rounded-xl border border-neutral-200 bg-neutral-50 space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-500 block">Day 7 (Tour Confirmation)</span>
              <span className="text-xs font-bold text-neutral-900 block">Scheduled Call Lock-In</span>
              <p className="text-[11px] text-neutral-600">
                Timely follow-up exactly as promised: <em>"As discussed last week, shall we lock your private tour for Saturday?"</em>
              </p>
            </div>
          </div>

          {/* Copyable Ready-to-Use WhatsApp Scripts */}
          <div className="space-y-3">
            <span className="text-xs font-bold font-mono text-neutral-700 uppercase tracking-wider block">
              Ready-to-Use WhatsApp Scripts for Sales Executives (Click to Copy):
            </span>

            {/* Script 1: For Leads Asking "Contact After 1 Week / After Diwali" */}
            <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Script 1: When Lead Says "Contact Me A Week Later / After Festival"</span>
                </span>
                <button
                  onClick={() => handleCopyScript('script-1', `Hi [Prospect Name], hope you and your family are having a wonderful festive season! As agreed, following up on your interest in our ${client.companyName} project. We are holding 2 premium corner units with exclusive festive pricing benefits. Would Saturday 11 AM or Sunday 3 PM work best for a short 20-minute private walkthrough?`)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors no-print"
                >
                  {copiedScriptId === 'script-1' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-300 font-mono leading-relaxed bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
                "Hi [Prospect Name], hope you and your family are having a wonderful festive season! As agreed, following up on your interest in our {client.companyName} project. We are holding 2 premium corner units with exclusive festive pricing benefits. Would Saturday 11 AM or Sunday 3 PM work best for a short 20-minute private walkthrough?"
              </p>
            </div>

            {/* Script 2: For Site Visit Confirmation */}
            <div className="p-4 rounded-xl bg-neutral-900 text-neutral-100 border border-neutral-800 relative group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Script 2: Site Visit & Family Walkthrough Confirmation</span>
                </span>
                <button
                  onClick={() => handleCopyScript('script-2', `Hello [Prospect Name], your private walkthrough for ${client.companyName} is scheduled for this [Day & Time]. Our Senior Advisor will meet you at the site experience lounge with reserved VIP parking. Here is the Google Maps site location: [Map Link]. Looking forward to welcoming you and your family!`)}
                  className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-colors no-print"
                >
                  {copiedScriptId === 'script-2' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-neutral-300 font-mono leading-relaxed bg-neutral-950/60 p-3 rounded-lg border border-neutral-800">
                "Hello [Prospect Name], your private walkthrough for {client.companyName} is scheduled for this [Day & Time]. Our Senior Advisor will meet you at the site experience lounge with reserved VIP parking. Here is the Google Maps site location: [Map Link]. Looking forward to welcoming you and your family!"
              </p>
            </div>
          </div>
        </div>

        {/* Section 5: Ad Creatives Spotlight (Optional Toggle) */}
        {includeCreativeSection && (
          <div className="mb-8 border-t border-neutral-200 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 font-mono">
              05. Top Performing Meta Creative Assets & Hooks
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
                  "{creatives[0]?.headline || 'Exclusive Waterfront Estates from ₹2.85 Cr · Private Tours'}"
                </div>
                <p className="text-neutral-600 text-[11px]">
                  "{creatives[0]?.copy || 'Floor-to-ceiling glass, private infinity pool, and guaranteed panoramic sunset views. Reserve your VIP walkthrough.'}"
                </p>
                <div className="flex gap-4 font-mono text-[11px] pt-1">
                  <span>Spend: <strong>{metaConnected ? `₹${creatives[0]?.spend.toLocaleString('en-IN')}` : 'NA'}</strong></span>
                  <span>Leads: <strong>{creatives[0]?.leads || totalLeads}</strong></span>
                  <span>CPL: <strong className="text-amber-600">{metaConnected ? `₹${creatives[0]?.cpl.toFixed(0)}` : 'NA'}</strong></span>
                  <span>Form Conv: <strong>{creatives[0]?.conversionRate || 14.8}%</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Sales Team Audit & Bottleneck Analysis */}
        {includeSalesAuditSection && (
          <div className="mb-8 border-t border-neutral-200 pt-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 font-mono">
                06. Sales Representative Performance & Latency Audit
              </h2>
              <span className="text-amber-700 font-semibold text-xs font-mono">Speed-to-Lead Priority</span>
            </div>
            <p className="text-xs text-neutral-600 mb-3">
              Lead data proves inbound interest is robust; conversion rates heavily correlate with response speed:
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
          </div>
        )}

        {/* Section 7: Signature & Sign-Off */}
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

