import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  DollarSign, 
  User, 
  Tag, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Lead, LeadStatus, SalesRep } from '../types';

interface LeadDetailDrawerProps {
  lead: Lead | null;
  salesReps: SalesRep[];
  onClose: () => void;
  onUpdateStatus: (leadId: string, newStatus: LeadStatus) => void;
  onUpdateNotes: (leadId: string, notes: string) => void;
  onUpdateRep: (leadId: string, repName: string) => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  salesReps,
  onClose,
  onUpdateStatus,
  onUpdateNotes,
  onUpdateRep,
}) => {
  if (!lead) return null;

  const [notes, setNotes] = useState(lead.notes);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedComment, setCopiedComment] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(lead.id, notes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border-l border-neutral-800 h-full overflow-y-auto p-6 space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400">
                Meta Lead Details · ID #{lead.id}
              </span>
              <h3 className="text-xl font-bold text-neutral-100 flex items-center gap-2 mt-0.5">
                <span>{lead.fullName}</span>
                {lead.verifiedPhone && (
                  <span title="Verified Meta Instant Form Phone" className="text-emerald-400">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Contact & Source Bar */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${lead.phone}`}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/50 transition-colors flex items-center gap-3 text-xs text-neutral-200"
            >
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-neutral-500 block">Phone</span>
                <span className="font-mono font-semibold">{lead.phone}</span>
              </div>
            </a>

            <a
              href={`mailto:${lead.email}`}
              className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-400/50 transition-colors flex items-center gap-3 text-xs text-neutral-200"
            >
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-neutral-500 block">Email</span>
                <span className="truncate block font-mono">{lead.email}</span>
              </div>
            </a>
          </div>

          {/* Detailed Comment (Direct from Spreadsheet or Lead Form) */}
          <div className="rounded-xl bg-gradient-to-br from-amber-500/10 via-neutral-950 to-neutral-950 border border-amber-500/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono">
                  Prospect Detailed Comment
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                Spreadsheet Column
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs text-neutral-100 leading-relaxed font-sans relative shadow-inner">
              {lead.detailedComment || (lead.notes && !lead.notes.startsWith('Imported live')) ? (
                <>
                  <p className="italic text-neutral-100 text-[13px] leading-relaxed">
                    "{lead.detailedComment || lead.notes}"
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span className="text-neutral-500">Inquiry requirements & notes</span>
                    <button
                      onClick={() => {
                        const textToCopy = lead.detailedComment || lead.notes;
                        navigator.clipboard.writeText(textToCopy);
                        setCopiedComment(true);
                        setTimeout(() => setCopiedComment(false), 2000);
                      }}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                    >
                      {copiedComment ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400 font-sans">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="font-sans">Copy Comment</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-1 py-1">
                  <p className="text-neutral-400 italic">
                    No custom comment provided in the spreadsheet's detailed comment column for this row.
                  </p>
                  <p className="text-[11px] text-neutral-500 font-mono">
                    Tip: Add a "Detailed Comment" or "Remarks" column in your Google Sheet to display prospect inquiry notes here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Meta Lead Form Responses */}
          <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Meta Form Question Responses
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Stated Budget Bracket:</span>
                <span className="font-mono font-bold text-amber-400">{lead.budgetBracket}</span>
              </div>

              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Target Timeline:</span>
                <span className="font-medium text-neutral-200">{lead.purchaseTimeline}</span>
              </div>

              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Property / Interest:</span>
                <span className="font-medium text-neutral-200">{lead.propertyTypeOrService}</span>
              </div>

              <div className="flex justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-neutral-400">Pre-Qualification Grade:</span>
                <span className="font-mono font-bold text-emerald-400">
                  Grade {lead.intentGrade} ({lead.intentScore}/100)
                </span>
              </div>

              <div className="flex justify-between pt-1">
                <span className="text-neutral-400">Meta Campaign:</span>
                <span className="font-sans text-neutral-300 text-right text-[11px] truncate max-w-[200px]">
                  {lead.campaignName}
                </span>
              </div>
            </div>
          </div>

          {/* Sales Stage & Assignment Controls */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
              Sales Workflow Status
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Lead Status:
                </label>
                <select
                  value={lead.salesStatus}
                  onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:outline-none focus:border-amber-400 text-xs"
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
              </div>

              <div>
                <label className="text-[11px] text-neutral-400 block mb-1">
                  Assigned Sales Rep:
                </label>
                <select
                  value={lead.assignedRep}
                  onChange={(e) => onUpdateRep(lead.id, e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-medium focus:outline-none focus:border-amber-400 text-xs"
                >
                  {salesReps.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} ({r.avgResponseMinutes}m avg)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Sales Response Latency Telemetry */}
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-500">First Outbound Call:</span>
              <span className={lead.firstResponseMinutes ? 'text-neutral-200' : 'text-rose-400 font-bold'}>
                {lead.firstResponseMinutes ? `${lead.firstResponseMinutes} minutes` : 'Pending initial call!'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Follow-up Touches:</span>
              <span className="text-neutral-200">{lead.followUpCount} calls / messages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Estimated Pipeline:</span>
              <span className="text-amber-400 font-bold">₹{lead.estimatedValue.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Notes Logger */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-300 block">
              Internal Rep / Agency Notes:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-amber-400 transition-colors"
              placeholder="Add client follow-up details, appointment notes, or feedback..."
            />
            <div className="flex justify-between items-center">
              {isSaved ? (
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Notes saved
                </span>
              ) : (
                <span className="text-[11px] text-neutral-500 font-mono">
                  Updated in real-time
                </span>
              )}
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Close Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
