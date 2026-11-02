import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  ChevronRight, 
  ExternalLink,
  ShieldCheck,
  FileSpreadsheet,
  Calendar,
  Layers
} from 'lucide-react';
import { Lead, LeadStatus, IntentGrade, ClientProfile, DateFilter } from '../types';
import { formatINRPipeline, formatINR } from '../utils/formatters';
import { isDateInRange, formatDateDisplay } from '../utils/dateUtils';

interface LeadCRMViewProps {
  leads: Lead[];
  client: ClientProfile;
  dateFilter: DateFilter;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenNewLeadModal: () => void;
  onOpenImportModal: () => void;
}

export const LeadCRMView: React.FC<LeadCRMViewProps> = ({
  leads,
  client,
  dateFilter,
  onUpdateLeadStatus,
  onSelectLead,
  onOpenNewLeadModal,
  onOpenImportModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<'all' | IntentGrade>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | LeadStatus>('all');
  const [crmDateScope, setCrmDateScope] = useState<'filtered' | 'all'>('filtered');

  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      lead.fullName.toLowerCase().includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.propertyTypeOrService.toLowerCase().includes(q) ||
      lead.purchaseTimeline.toLowerCase().includes(q) ||
      lead.budgetBracket.toLowerCase().includes(q) ||
      lead.salesStatus.toLowerCase().includes(q) ||
      lead.assignedRep.toLowerCase().includes(q) ||
      lead.campaignName.toLowerCase().includes(q) ||
      (lead.detailedComment && lead.detailedComment.toLowerCase().includes(q)) ||
      (lead.notes && lead.notes.toLowerCase().includes(q));

    const matchesGrade = selectedGrade === 'all' || lead.intentGrade === selectedGrade;
    const matchesStatus = selectedStatus === 'all' || lead.salesStatus === selectedStatus;
    const matchesDate = crmDateScope === 'all' || dateFilter.preset === 'all' || isDateInRange(lead.submittedAt, dateFilter);

    return matchesSearch && matchesGrade && matchesStatus && matchesDate;
  });

  const gradeACount = filteredLeads.filter(l => l.intentGrade === 'A').length;
  const uncontactedCount = filteredLeads.filter(l => l.firstResponseMinutes === null).length;

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;

    const headers = [
      'ID',
      'Name',
      'Email',
      'Phone',
      'Submission Date',
      'Campaign',
      'Platform',
      'Placement',
      'Budget (INR)',
      'Timeline',
      'Property / Service',
      'Intent Grade',
      'Intent Score',
      'Sales Status',
      'First Response Min',
      'Assigned Rep',
      'Est Value (INR)',
    ];

    const rows = filteredLeads.map(l => [
      l.id,
      `"${l.fullName}"`,
      l.email,
      `"${l.phone}"`,
      `"${l.submittedAt}"`,
      `"${l.campaignName}"`,
      l.platform,
      l.placement,
      `"${l.budgetBracket}"`,
      `"${l.purchaseTimeline}"`,
      `"${l.propertyTypeOrService}"`,
      l.intentGrade,
      l.intentScore,
      `"${l.salesStatus}"`,
      l.firstResponseMinutes ?? 'Uncontacted',
      `"${l.assignedRep}"`,
      `"₹${l.estimatedValue.toLocaleString('en-IN')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `digitrix_${client.id}_leads_inr.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadgeClass = (status: LeadStatus) => {
    switch (status) {
      case 'Won / Closed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Contract Sent':
      case 'Site Visit / Demo':
      case 'Appointment Booked':
        return 'bg-amber-400/10 text-amber-400 border-amber-400/30';
      case 'Qualified':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
      case 'Warm Lead':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
      case 'Contacted':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'DNP (Call Again)':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'Lost / Disqualified':
        return 'bg-rose-950/40 text-rose-400 border-rose-900/50';
      case 'New':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse';
    }
  };

  const getGradeBadgeClass = (grade: IntentGrade) => {
    switch (grade) {
      case 'A':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
      case 'B':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 font-bold';
      case 'C':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-medium';
      case 'D':
      default:
        return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* CRM Header with Filter & Search controls */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 mb-1">
              <span>{client.companyName}</span>
              <span>·</span>
              <span className="text-amber-400 font-semibold">{filteredLeads.length} Inquiries In View</span>
              <span>·</span>
              <span className="text-emerald-400">{gradeACount} High-Intent Grade A</span>
            </div>
            <h2 className="text-xl font-bold text-neutral-100">
              Verified Lead Pipeline & Qualification CRM (INR · ₹)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors whitespace-nowrap"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import Sheet / CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={filteredLeads.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors whitespace-nowrap disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenNewLeadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors whitespace-nowrap shadow-sm shadow-amber-400/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by prospect name, email, phone, rep..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Date Scope Filter */}
          <div>
            <select
              value={crmDateScope}
              onChange={(e) => setCrmDateScope(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors font-mono"
            >
              <option value="filtered">In Selected Date Range</option>
              <option value="all">All Dates ({leads.length} Total)</option>
            </select>
          </div>

          {/* Intent Grade Filter */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="all">All Intent Grades (A, B, C, D)</option>
              <option value="A">Grade A · Verified Budget & Immediate (&lt;30d)</option>
              <option value="B">Grade B · High Budget, 1-3 Mo</option>
              <option value="C">Grade C · Exploring, Nurture</option>
              <option value="D">Grade D · Out of Range / Disqualified</option>
            </select>
          </div>

          {/* Sales Status Filter Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors"
            >
              <option value="all">All Sales Stages ({leads.length})</option>
              <option value="Site Visit / Demo">Site Visit ({leads.filter(l => l.salesStatus === 'Site Visit / Demo').length})</option>
              <option value="Qualified">Qualified ({leads.filter(l => l.salesStatus === 'Qualified').length})</option>
              <option value="Warm Lead">Warm Leads ({leads.filter(l => l.salesStatus === 'Warm Lead').length})</option>
              <option value="DNP (Call Again)">DNP ({leads.filter(l => l.salesStatus === 'DNP (Call Again)').length})</option>
              <option value="Lost / Disqualified">Lost / Disqualified ({leads.filter(l => l.salesStatus === 'Lost / Disqualified').length})</option>
              <option value="New">No Status / New ({leads.filter(l => l.salesStatus === 'New' || l.salesStatus === 'Contacted').length})</option>
              <option value="Appointment Booked">Appointment Booked</option>
              <option value="Contract Sent">Contract Sent</option>
              <option value="Won / Closed">Won / Closed</option>
            </select>
          </div>
        </div>

        {/* Quick Status Stage Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-neutral-800/80">
          <span className="text-[11px] font-mono text-neutral-400 mr-1 uppercase tracking-wider">
            Stage Tabs:
          </span>

          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>All Leads</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-black/20 font-mono">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Site Visit / Demo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'Site Visit / Demo'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>Site Visit</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {leads.filter(l => l.salesStatus === 'Site Visit / Demo').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Qualified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'Qualified'
                ? 'bg-emerald-400 text-neutral-950 font-bold shadow-md shadow-emerald-400/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>Qualified</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {leads.filter(l => l.salesStatus === 'Qualified').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Warm Lead')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'Warm Lead'
                ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>Warm Leads</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {leads.filter(l => l.salesStatus === 'Warm Lead').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('DNP (Call Again)')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'DNP (Call Again)'
                ? 'bg-orange-400 text-neutral-950 font-bold shadow-md shadow-orange-400/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>DNP</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-orange-500/20 text-orange-300 font-mono">
              {leads.filter(l => l.salesStatus === 'DNP (Call Again)').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('Lost / Disqualified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'Lost / Disqualified'
                ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>Lost / Disqualified</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-rose-500/20 text-rose-300 font-mono">
              {leads.filter(l => l.salesStatus === 'Lost / Disqualified').length}
            </span>
          </button>

          <button
            onClick={() => setSelectedStatus('New')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedStatus === 'New'
                ? 'bg-cyan-400 text-neutral-950 font-bold shadow-md shadow-cyan-400/20'
                : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
            }`}
          >
            <span>No Status</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              {leads.filter(l => l.salesStatus === 'New' || l.salesStatus === 'Contacted').length}
            </span>
          </button>
        </div>
      </div>

      {/* Lag Alert Banner */}
      {uncontactedCount > 0 && (
        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Digitrix Alert:</strong> {uncontactedCount} fresh Meta leads are currently sitting uncontacted by the sales team. Speed-to-lead data shows an 82% conversion drop-off after 60 minutes.
            </span>
          </div>
          <span className="font-mono text-rose-400 font-semibold shrink-0">
            Action Required by Sales Advisor
          </span>
        </div>
      )}

      {/* Leads Table or Empty State */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg">
        {filteredLeads.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-500 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5" />
            </div>
            <div className="max-w-sm mx-auto text-xs text-neutral-400 space-y-1">
              <p className="font-semibold text-neutral-200">No leads found in this view.</p>
              <p>Add a lead manually, connect Google Sheets, or adjust your date filter range above.</p>
            </div>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={onOpenNewLeadModal}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors"
              >
                Add Manual Lead
              </button>
              <button
                onClick={onOpenImportModal}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                Import CSV / Sheet
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/70 border-b border-neutral-800 text-neutral-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Lead Name & Source</th>
                  <th className="py-3 px-3">Date Submitted</th>
                  <th className="py-3 px-3">Budget Bracket (INR)</th>
                  <th className="py-3 px-3">Timeline</th>
                  <th className="py-3 px-3 text-center">Quality Grade</th>
                  <th className="py-3 px-3">Sales Stage</th>
                  <th className="py-3 px-3">First Response</th>
                  <th className="py-3 px-3">Assigned Rep</th>
                  <th className="py-3 px-3 text-right">Est. Deal Value</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {filteredLeads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-100 text-sm group-hover:text-amber-400 transition-colors">
                            {lead.fullName}
                          </span>
                          {lead.verifiedPhone && (
                            <span title="Meta Form Verified Phone Number" className="text-emerald-400">
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{lead.phone}</span>
                          <span>·</span>
                          <span className="text-neutral-500">{lead.platform} {lead.placement}</span>
                        </div>
                      </td>

                      {/* Date Submitted */}
                      <td className="py-3.5 px-3 text-neutral-300 font-medium text-[11px] whitespace-nowrap">
                        {formatDateDisplay(lead.submittedAt)}
                      </td>

                      {/* Budget in INR */}
                      <td className="py-3.5 px-3 text-neutral-200 font-semibold">
                        {lead.budgetBracket}
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-3 text-neutral-200 font-medium text-[11px] whitespace-nowrap">
                        {lead.purchaseTimeline}
                      </td>

                      {/* Quality Grade */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] border ${getGradeBadgeClass(lead.intentGrade)}`}>
                          Grade {lead.intentGrade} ({lead.intentScore})
                        </span>
                      </td>

                      {/* Sales Stage Select */}
                      <td className="py-3.5 px-3 font-sans" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.salesStatus}
                          onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded border bg-neutral-950 focus:outline-none transition-colors ${getStatusBadgeClass(lead.salesStatus)}`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Warm Lead">Warm Lead</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Appointment Booked">Appointment Booked</option>
                          <option value="Site Visit / Demo">Site Visit / Demo</option>
                          <option value="DNP (Call Again)">DNP (Call Again)</option>
                          <option value="Contract Sent">Contract Sent</option>
                          <option value="Won / Closed">Won / Closed</option>
                          <option value="Lost / Disqualified">Lost / Disqualified</option>
                        </select>
                      </td>

                      {/* Speed to Lead */}
                      <td className="py-3.5 px-3">
                        {lead.firstResponseMinutes !== null ? (
                          <span className={`text-[11px] flex items-center gap-1 ${lead.firstResponseMinutes <= 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            <Clock className="w-3 h-3" />
                            <span>{lead.firstResponseMinutes.toFixed(1)}m</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-400 font-bold animate-pulse">
                            Uncontacted!
                          </span>
                        )}
                      </td>

                      {/* Rep */}
                      <td className="py-3.5 px-3 text-neutral-300 font-sans text-xs">
                        {lead.assignedRep}
                      </td>

                      {/* Est Value in INR */}
                      <td className="py-3.5 px-3 text-right text-neutral-100 font-bold">
                        {formatINRPipeline(lead.estimatedValue)}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectLead(lead);
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-amber-400 transition-colors"
                          title="View Complete Form Verification & Notes"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
