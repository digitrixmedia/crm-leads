import React, { useState } from 'react';
import { X, Plus, ShieldCheck, User, Phone, Mail, DollarSign } from 'lucide-react';
import { Lead, ClientProfile, SalesRep } from '../types';

interface NewLeadModalProps {
  client: ClientProfile;
  salesReps: SalesRep[];
  onClose: () => void;
  onAddLead: (lead: Lead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  client,
  salesReps,
  onClose,
  onAddLead,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [budgetBracket, setBudgetBracket] = useState('₹3 Cr - ₹5 Cr');
  const [purchaseTimeline, setPurchaseTimeline] = useState('Ready within 30 days');
  const [propertyTypeOrService, setPropertyTypeOrService] = useState('Waterfront 4-BHK Villa');
  const [intentGrade, setIntentGrade] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [assignedRep, setAssignedRep] = useState(salesReps[0]?.name || 'Rohan Mehra');
  const [detailedComment, setDetailedComment] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newLead: Lead = {
      id: `lead-manual-${Date.now()}`,
      fullName,
      email: email || 'inquiry@manualentry.in',
      phone: phone || '+91 98200 00000',
      campaignId: 'camp-1',
      campaignName: 'Manual Entry · Agency Verified Lead',
      adSetName: 'VIP Private Client Desk',
      adCreativeName: 'Direct Registration',
      platform: 'Facebook',
      placement: 'Feed',
      submittedAt: 'Just now',
      budgetBracket,
      purchaseTimeline,
      propertyTypeOrService,
      intentScore: intentGrade === 'A' ? 95 : intentGrade === 'B' ? 85 : 68,
      intentGrade,
      verifiedPhone: true,
      salesStatus: 'New',
      firstResponseMinutes: null,
      followUpCount: 0,
      assignedRep,
      detailedComment: detailedComment.trim() || undefined,
      notes: notes || detailedComment || 'Direct manual lead intake created in Digitrix dashboard.',
      estimatedValue: client.dealAverageValue,
    };

    onAddLead(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400">
              {client.companyName}
            </span>
            <h3 className="text-lg font-bold text-neutral-100">
              Add New Lead Record
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Full Prospect Name *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Julian Sterling"
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (415) 892-0199"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@investment.com"
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Budget Bracket
              </label>
              <select
                value={budgetBracket}
                onChange={(e) => setBudgetBracket(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                <option value="₹2 Cr - ₹3 Cr">₹2 Cr - ₹3 Cr</option>
                <option value="₹3 Cr - ₹5 Cr">₹3 Cr - ₹5 Cr</option>
                <option value="₹5 Cr+">₹5 Cr+ (High-Ticket Penthouse)</option>
                <option value="Under ₹1.5 Cr">Under ₹1.5 Cr</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Purchase Timeline
              </label>
              <select
                value={purchaseTimeline}
                onChange={(e) => setPurchaseTimeline(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                <option value="Ready within 30 days">Ready within 30 days (Immediate)</option>
                <option value="1 - 3 months">1 - 3 months</option>
                <option value="3 - 6 months">3 - 6 months</option>
                <option value="Exploring options">Exploring options</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Intent Qualification Grade
              </label>
              <select
                value={intentGrade}
                onChange={(e) => setIntentGrade(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                <option value="A">Grade A (Verified Budget & Immediate)</option>
                <option value="B">Grade B (High Budget, 1-3 Mo)</option>
                <option value="C">Grade C (Nurture)</option>
                <option value="D">Grade D (Disqualified)</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Assign Sales Representative
              </label>
              <select
                value={assignedRep}
                onChange={(e) => setAssignedRep(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                {salesReps.map((r) => (
                  <option key={r.id} value={r.name}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Detailed Comment (Spreadsheet / Form Submission Message)
            </label>
            <textarea
              value={detailedComment}
              onChange={(e) => setDetailedComment(e.target.value)}
              rows={2}
              placeholder="e.g. Inquiring for east-facing 4-BHK villa with private pool, ready for immediate purchase..."
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 resize-none font-sans"
            />
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Internal Rep Notes / Qualification Memo
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Private tour preferences, pre-approval status..."
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 resize-none font-sans"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm shadow-amber-400/20"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
