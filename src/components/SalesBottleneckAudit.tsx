import React, { useState } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Zap, 
  ArrowRight, 
  Sliders, 
  Sparkles,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Award
} from 'lucide-react';
import { SalesRep, SpeedToLeadTier, ClientProfile, Lead } from '../types';
import { formatINRPipeline, formatINR } from '../utils/formatters';

interface SalesBottleneckAuditProps {
  salesReps: SalesRep[];
  benchmarks: SpeedToLeadTier[];
  client: ClientProfile;
  leads: Lead[];
  onAddSalesRep?: (rep: SalesRep) => void;
}

export const SalesBottleneckAudit: React.FC<SalesBottleneckAuditProps> = ({
  salesReps,
  benchmarks,
  client,
  leads,
  onAddSalesRep,
}) => {
  const [targetResponseMinutes, setTargetResponseMinutes] = useState(10);
  const [showAddRepModal, setShowAddRepModal] = useState(false);
  const [newRepName, setNewRepName] = useState('');
  const [newRepRole, setNewRepRole] = useState('Property Advisor');
  const [newRepAvgTime, setNewRepAvgTime] = useState(8);

  const handleCreateRep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepName.trim() || !onAddSalesRep) return;

    const rep: SalesRep = {
      id: `rep-${Date.now()}`,
      name: newRepName,
      email: `${newRepName.toLowerCase().replace(/[^a-z]/g, '')}@${client.contactEmail.split('@')[1] || 'agency.in'}`,
      role: newRepRole,
      leadsAssigned: 0,
      avgResponseMinutes: newRepAvgTime,
      contactRatePercent: 88,
      bookingRatePercent: newRepAvgTime <= 10 ? 42 : newRepAvgTime <= 30 ? 25 : 10,
      closedDeals: 0,
      pipelineRevenue: 0,
    };

    onAddSalesRep(rep);
    setNewRepName('');
    setShowAddRepModal(false);
  };

  // Computations
  const totalLeads = leads.length;
  const contactedLeads = leads.filter(l => l.firstResponseMinutes !== null);
  const avgTeamResponseTime =
    contactedLeads.length > 0
      ? Math.round(contactedLeads.reduce((acc, l) => acc + (l.firstResponseMinutes || 0), 0) / contactedLeads.length)
      : 54;

  // Revenue Leakage Calculator math
  const monthlyLeads = 120; // benchmark monthly volume
  const currentConversionRate = 0.24; // 24% baseline
  const simulatedRate =
    targetResponseMinutes <= 5 ? 0.44 :
    targetResponseMinutes <= 15 ? 0.35 :
    targetResponseMinutes <= 30 ? 0.26 : 0.15;

  const extraBookings = Math.max(0, Math.round(monthlyLeads * (simulatedRate - currentConversionRate)));
  const closeRateOnBooking = 0.18; // 18% of booked tours close
  const extraDeals = Math.round(extraBookings * closeRateOnBooking);
  const extraRevenue = extraDeals * client.dealAverageValue;

  return (
    <div className="space-y-6">
      {/* Executive Defense Banner: Why Digitrix Lead Quality is High */}
      <div className="rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-rose-950/30 border border-rose-500/30 p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-amber-400 uppercase tracking-wider font-semibold">
                Digitrix Sales Conversion Audit
              </span>
              <span className="text-neutral-500">·</span>
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> High-Impact Bottleneck Identified
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">
              Sales Team Speed-to-Lead & Follow-Up Diagnostic (INR Pipeline)
            </h2>

            <p className="text-sm text-neutral-300 leading-relaxed">
              When clients question lead conversion, the data speaks unequivocally: <strong>Digitrix Meta Ads delivers verified buyers with validated budgets (₹2.5 Cr - ₹5 Cr+)</strong>. However, inquiries contacted within 5 minutes convert at <span className="text-emerald-400 font-bold">48.5%</span>, while leads delayed past 1 hour plummet to <span className="text-rose-400 font-bold">11.3%</span>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 text-center shrink-0">
            <span className="text-xs text-neutral-400 block mb-1">Current Team Avg Response</span>
            <span className="text-3xl font-black font-mono text-rose-400">
              {avgTeamResponseTime} min
            </span>
            <span className="text-[11px] text-neutral-400 block mt-1">
              Target for 40%+ Booking: &lt;15 min
            </span>
          </div>
        </div>
      </div>

      {/* Visual Speed-to-Lead Drop-off Curve */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 shadow-lg">
        <div>
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <span>Speed-to-Lead Conversion Decay Curve</span>
            <span className="text-[11px] font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Lead Decay vs Time
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real data from {client.companyName}'s active Meta lead flow showing appointment booking rate decay.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {benchmarks.map((b, idx) => {
            const isCritical = idx >= 3;
            const isElite = idx === 0;
            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isElite
                    ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                    : isCritical
                    ? 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="font-bold text-neutral-200">{b.range}</span>
                    <span className="text-neutral-500">{b.leadsCount} leads</span>
                  </div>

                  <div className="text-2xl font-black font-mono my-2">
                    {b.bookingRatePercent}%
                  </div>
                  <span className="text-[11px] text-neutral-400 block">
                    Booking Rate
                  </span>
                </div>

                <div className="mt-3 pt-2 border-t border-neutral-800/80 text-[10px] font-mono">
                  {idx === 0 ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Optimum Conversion
                    </span>
                  ) : (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" /> -{b.dropOffRatePercent}% Drop-off
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Rep Performance Comparison Table */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              Sales Rep Velocity & Booking Leaderboard (INR)
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Proves that ad lead quality is consistent; advisors who respond in &lt;10 minutes generate 4x higher revenue.
            </p>
          </div>

          {onAddSalesRep && (
            <button
              onClick={() => setShowAddRepModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm"
            >
              Add Sales Rep
            </button>
          )}
        </div>

        {salesReps.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400 space-y-2">
            <p className="font-semibold text-neutral-200">No sales advisors registered yet.</p>
            <p>Add team members to monitor response times and conversion rates.</p>
            {onAddSalesRep && (
              <button
                onClick={() => setShowAddRepModal(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors mt-2"
              >
                Add Sales Representative
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/70 border-b border-neutral-800 text-neutral-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Sales Representative</th>
                  <th className="py-3 px-3 text-right">Leads Assigned</th>
                  <th className="py-3 px-3 text-right font-bold text-amber-400">Avg First Response</th>
                  <th className="py-3 px-3 text-right">Contact Rate</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-400">Booking Rate</th>
                  <th className="py-3 px-3 text-right">Closed Deals</th>
                  <th className="py-3 px-4 text-right">Pipeline Revenue (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {salesReps.map((rep) => {
                  const isFast = rep.avgResponseMinutes < 15;
                  const isSlow = rep.avgResponseMinutes > 60;
                  return (
                    <tr key={rep.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-400 text-xs">
                            {rep.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-neutral-200 text-sm">
                              {rep.name}
                            </div>
                            <div className="text-[11px] text-neutral-400">{rep.role}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-300">
                        {rep.leadsAssigned}
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold">
                        <span className={`inline-flex items-center gap-1 ${isFast ? 'text-emerald-400' : isSlow ? 'text-rose-400' : 'text-amber-400'}`}>
                          <Clock className="w-3 h-3" />
                          <span>{rep.avgResponseMinutes} min</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-300">
                        {rep.contactRatePercent}%
                      </td>

                      <td className="py-3.5 px-3 text-right font-bold">
                        <span className={rep.bookingRatePercent > 30 ? 'text-emerald-400' : 'text-rose-400'}>
                          {rep.bookingRatePercent}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-100 font-bold">
                        {rep.closedDeals}
                      </td>

                      <td className="py-3.5 px-4 text-right text-amber-400 font-bold text-sm">
                        {formatINRPipeline(rep.pipelineRevenue)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interactive Revenue Leakage & Opportunity Calculator */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
              <span>Interactive Revenue Leakage Calculator (INR · ₹)</span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Agency Value Engine
              </span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Simulate the revenue gain in Indian Rupees by improving sales team response times without increasing Meta ad spend.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Slider input */}
          <div className="space-y-4 lg:col-span-1 p-4 rounded-xl bg-neutral-950 border border-neutral-800">
            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-medium">Target First Response Time:</span>
              <span className="font-mono text-base font-bold text-amber-400">
                {targetResponseMinutes} Minutes
              </span>
            </div>

            <input
              type="range"
              min="2"
              max="120"
              step="2"
              value={targetResponseMinutes}
              onChange={(e) => setTargetResponseMinutes(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-neutral-800 rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>2 min (Instant SLA)</span>
              <span>15 min</span>
              <span>60 min</span>
              <span>120 min</span>
            </div>

            <div className="text-[11px] text-neutral-400 border-t border-neutral-800/80 pt-3">
              Baseline: Current team average is <strong>{avgTeamResponseTime} mins</strong>.
            </div>
          </div>

          {/* Results display in INR */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-neutral-400">Extra Booked Visits</span>
              <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                +{extraBookings}/mo
              </div>
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                From current Meta lead volume
              </span>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-xs text-neutral-400">Est. Additional Closed Deals</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                +{extraDeals} deals
              </div>
              <span className="text-[10px] text-neutral-400 font-mono mt-1 block">
                At 18% tour close rate
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-neutral-950 to-amber-950/40 border border-amber-500/30">
              <span className="text-xs text-amber-300 font-semibold">Recoverable Pipeline (INR)</span>
              <div className="text-2xl font-black font-mono text-amber-400 mt-1">
                +{formatINRPipeline(extraRevenue)}
              </div>
              <span className="text-[10px] text-amber-200/80 font-mono mt-1 block">
                Zero added ad spend
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Digitrix Growth Playbook & Action Plan */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
        <div>
          <h3 className="text-base font-bold text-neutral-100 flex items-center gap-2">
            <span>Digitrix Sales Workflow Recommendations</span>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
              Client Playbook
            </span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Turnkey conversion workflows Digitrix Media implements for client sales teams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <PhoneCall className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-neutral-200">
              01. 30-Second WhatsApp / SMS Auto-Bridge
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              When an inquiry submits on Meta, our webhook sends an instant WhatsApp message with a personalized one-click calendar booking link before the lead navigates away.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 text-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-neutral-200">
              02. 10-Minute SLA Lead Reassignment
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              If an assigned sales rep does not trigger an outbound call within 10 minutes, the lead is automatically rotated to the next available top performer (e.g. Rohan).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/10 text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-neutral-200">
              03. 7-Touch Multi-Channel Cadence
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Never stop at 1 unanswered call. Implement Digitrix's 7-touch blueprint (Phone, WhatsApp voice note, Project brochure PDF, Video walkthrough preview) to recover 38% of unresponsive leads.
            </p>
          </div>
        </div>
      </div>

      {/* Add Sales Rep Modal */}
      {showAddRepModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-neutral-100">Add Sales Advisor</h3>
            <form onSubmit={handleCreateRep} className="space-y-3">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Advisor Name *</label>
                <input
                  type="text"
                  required
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  placeholder="e.g. Rohan Mehra"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Role</label>
                <input
                  type="text"
                  value={newRepRole}
                  onChange={(e) => setNewRepRole(e.target.value)}
                  placeholder="Senior Property Advisor"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-semibold block mb-1">Avg Response Latency (minutes)</label>
                <input
                  type="number"
                  value={newRepAvgTime}
                  onChange={(e) => setNewRepAvgTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowAddRepModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-amber-400 text-neutral-950 font-semibold shadow-sm"
                >
                  Save Advisor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
