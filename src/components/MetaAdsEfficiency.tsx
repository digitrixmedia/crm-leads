import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  Layers, 
  Smartphone, 
  Share2, 
  Eye, 
  MousePointer, 
  CheckCircle2, 
  AlertCircle,
  BarChart3,
  Sliders,
  Sparkles,
  Zap,
  Plus,
  X,
  KeyRound
} from 'lucide-react';
import { Campaign, AdCreative, ClientProfile, DateFilter } from '../types';
import { formatINRPipeline, formatINR } from '../utils/formatters';
import { getDateFilterMultiplier } from '../utils/dateUtils';

interface MetaAdsEfficiencyProps {
  campaigns: Campaign[];
  creatives: AdCreative[];
  client: ClientProfile;
  dateFilter: DateFilter;
  onToggleCampaign: (id: string) => void;
  onAddCampaign: (newCampaign: Campaign) => void;
  onTriggerTestLead: () => void;
  onOpenMetaModal?: () => void;
  metaConnected: boolean;
}

export const MetaAdsEfficiency: React.FC<MetaAdsEfficiencyProps> = ({
  campaigns,
  creatives,
  client,
  dateFilter,
  onToggleCampaign,
  onAddCampaign,
  onTriggerTestLead,
  onOpenMetaModal,
  metaConnected,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [showAddCampaignModal, setShowAddCampaignModal] = useState(false);

  // New campaign form state
  const [newCampName, setNewCampName] = useState('');
  const [newCampDailyBudget, setNewCampDailyBudget] = useState(10000);
  const [newCampSpend, setNewCampSpend] = useState(150000);
  const [newCampLeads, setNewCampLeads] = useState(180);
  const [newCampObjective, setNewCampObjective] = useState('Lead Generation');

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) return;

    const cpl = newCampLeads > 0 ? newCampSpend / newCampLeads : 0;
    const qualLeads = Math.round(newCampLeads * 0.8);
    const cpql = qualLeads > 0 ? newCampSpend / qualLeads : 0;

    const created: Campaign = {
      id: `camp-${Date.now()}`,
      name: newCampName,
      status: 'active',
      objective: newCampObjective,
      dailyBudget: newCampDailyBudget,
      totalSpend: newCampSpend,
      impressions: newCampLeads * 240,
      clicks: Math.round(newCampLeads * 9.5),
      cpc: Math.round((newCampSpend / (newCampLeads * 9.5)) * 10) / 10,
      ctr: 3.8,
      leadsCount: newCampLeads,
      cpl: Math.round(cpl * 100) / 100,
      qualifiedLeadsCount: qualLeads,
      costPerQualifiedLead: Math.round(cpql * 100) / 100,
      roas: 12.5,
      targetCpl: client.targetCpl,
      pacingPercent: 95,
    };

    onAddCampaign(created);
    setNewCampName('');
    setShowAddCampaignModal(false);
  };

  const filteredCampaigns = campaigns.filter(c => {
    if (filterStatus === 'all') return true;
    return c.status === filterStatus;
  });

  const filteredCreatives = creatives.filter(cr => {
    if (selectedFormat === 'all') return true;
    return cr.format === selectedFormat;
  });

  const dateMultiplier = getDateFilterMultiplier(dateFilter);
  const rawSpend = campaigns.reduce((acc, c) => acc + c.totalSpend, 0);
  const totalSpend = Math.round(rawSpend * dateMultiplier);
  const rawLeads = campaigns.reduce((acc, c) => acc + c.leadsCount, 0);
  const totalLeads = Math.round(rawLeads * dateMultiplier);
  const blendedCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const rawQualified = campaigns.reduce((acc, c) => acc + c.qualifiedLeadsCount, 0);
  const totalQualified = Math.round(rawQualified * dateMultiplier);
  const blendedCpql = totalQualified > 0 ? totalSpend / totalQualified : 0;

  const placements = [
    { name: 'Instagram Reels', share: '38%', cpl: '₹685', leads: totalLeads > 0 ? Math.round(totalLeads * 0.38) : 0, ctr: '4.1%', convRate: '14.2%', icon: Smartphone },
    { name: 'Instagram Feed & Explore', share: '32%', cpl: '₹740', leads: totalLeads > 0 ? Math.round(totalLeads * 0.32) : 0, ctr: '3.8%', convRate: '12.8%', icon: Eye },
    { name: 'Facebook Mobile Feed', share: '22%', cpl: '₹890', leads: totalLeads > 0 ? Math.round(totalLeads * 0.22) : 0, ctr: '3.2%', convRate: '10.4%', icon: Layers },
    { name: 'Facebook Messenger & WhatsApp', share: '8%', cpl: '₹980', leads: totalLeads > 0 ? Math.round(totalLeads * 0.08) : 0, ctr: '2.9%', convRate: '8.6%', icon: Share2 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Real-time Meta Sync & Agency Edge */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Meta Marketing API v21.0 · Live Lead Ads Listener</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-100">
            Real-Time Ad Spend & Acquisition Efficiency (INR · ₹)
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
            Live attribution tracking directly from Meta Business Manager. Monitor cost-per-lead (CPL) versus client target in Indian Rupees.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenMetaModal && (
            <button
              onClick={onOpenMetaModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-neutral-100 transition-colors shadow-sm shadow-blue-600/30 whitespace-nowrap"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Connect Meta Ads API</span>
            </button>
          )}

          <button
            onClick={() => setShowAddCampaignModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm shadow-amber-400/20 whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Campaign</span>
          </button>

          <button
            onClick={onTriggerTestLead}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-100 border border-neutral-700 transition-colors whitespace-nowrap"
            title="Simulate receiving an instant lead from Meta Lead Ads webhook"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Simulate Lead</span>
          </button>
        </div>
      </div>

      {/* Notice Banner if Meta Not Connected */}
      {!metaConnected && (
        <div className="rounded-xl bg-blue-950/40 border border-blue-500/40 p-4 text-xs text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-4 h-4 text-blue-400 shrink-0" />
            <span>Meta Ads Manager is not connected. All ad spend, impressions, CTR, CPL, CPC, and ROAS metrics are shown as <strong>NA</strong> until Meta connection is established. Google Sheet leads are active in the CRM tab.</span>
          </div>
          {onOpenMetaModal && (
            <button
              onClick={onOpenMetaModal}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold whitespace-nowrap self-start sm:self-auto"
            >
              Connect Meta Ads
            </button>
          )}
        </div>
      )}

      {/* Campaign Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <span className="text-xs text-neutral-400">Total Meta Ad Spend</span>
          <div className="text-2xl font-bold font-mono text-neutral-100 mt-1">
            {metaConnected ? (totalSpend > 0 ? formatINRPipeline(totalSpend) : '₹0') : 'NA'}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            {metaConnected ? `${campaigns.length} Active Campaigns` : 'Connect Meta Ads'}
          </span>
        </div>

        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <span className="text-xs text-neutral-400">Blended CPL</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {metaConnected ? (blendedCpl > 0 ? `₹${blendedCpl.toFixed(0)}` : '₹0') : 'NA'}
          </div>
          <span className="text-[11px] text-emerald-400 font-mono">
            Target: ₹{client.targetCpl}
          </span>
        </div>

        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <span className="text-xs text-neutral-400">Cost / Qualified Lead (CPQL)</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {metaConnected ? (blendedCpql > 0 ? `₹${blendedCpql.toFixed(0)}` : '₹0') : 'NA'}
          </div>
          <span className="text-[11px] text-neutral-400 font-mono">
            {totalQualified} Pre-Screened Leads
          </span>
        </div>

        <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4">
          <span className="text-xs text-neutral-400">Campaign Delivery</span>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {campaigns.filter(c => c.status === 'active').length} Active
          </div>
          <span className="text-[11px] text-neutral-400">
            Pacing optimized by Digitrix
          </span>
        </div>
      </div>

      {/* Campaigns Table or Empty State */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden shadow-lg">
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              Active Meta Ad Campaigns
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Live pacing, lead forms, and cost metrics in INR synced from Meta Ads Manager.
            </p>
          </div>

          {/* Filter tabs */}
          {campaigns.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-neutral-950 rounded-lg border border-neutral-800 self-start sm:self-auto">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All ({campaigns.length})
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Active ({campaigns.filter(c => c.status === 'active').length})
              </button>
              <button
                onClick={() => setFilterStatus('paused')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  filterStatus === 'paused'
                    ? 'bg-neutral-800 text-neutral-100 font-semibold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Paused ({campaigns.filter(c => c.status === 'paused').length})
              </button>
            </div>
          )}
        </div>

        {campaigns.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto">
              <Layers className="w-5 h-5 text-amber-400" />
            </div>
            <div className="max-w-sm mx-auto text-xs text-neutral-400">
              <p className="font-semibold text-neutral-200">No Meta campaigns registered yet.</p>
              <p className="mt-0.5">Add your Meta Ad Campaign details to start monitoring spend and CPL efficiency.</p>
            </div>
            <button
              onClick={() => setShowAddCampaignModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm shadow-amber-400/20"
            >
              Add First Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/60 border-b border-neutral-800 text-neutral-400 font-medium">
                <tr>
                  <th className="py-3 px-4">Campaign Name & Objective</th>
                  <th className="py-3 px-3 text-right">Daily Budget</th>
                  <th className="py-3 px-3 text-right">Spend</th>
                  <th className="py-3 px-3 text-right">Impressions</th>
                  <th className="py-3 px-3 text-right">CTR</th>
                  <th className="py-3 px-3 text-right">Leads</th>
                  <th className="py-3 px-3 text-right font-bold text-amber-400">CPL</th>
                  <th className="py-3 px-3 text-right font-bold text-emerald-400">Cost/Qual.</th>
                  <th className="py-3 px-3 text-right">ROAS</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {filteredCampaigns.map((camp) => {
                  const isUnderTarget = camp.cpl <= camp.targetCpl;
                  return (
                    <tr key={camp.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans">
                        <div className="font-semibold text-neutral-200 text-sm">
                          {camp.name}
                        </div>
                        <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5 font-mono">
                          <span>{camp.objective}</span>
                          <span>·</span>
                          <span>Pacing {camp.pacingPercent}%</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-300">
                        ₹{camp.dailyBudget.toLocaleString('en-IN')}/day
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-200 font-bold">
                        ₹{Math.round(camp.totalSpend * dateMultiplier).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-400">
                        {Math.round(camp.impressions * dateMultiplier).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-3 text-right text-cyan-400">
                        {camp.ctr}%
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-100 font-bold">
                        {Math.round(camp.leadsCount * dateMultiplier)}
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className={`font-bold ${isUnderTarget ? 'text-amber-400' : 'text-rose-400'}`}>
                          ₹{camp.cpl.toFixed(0)}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right text-emerald-400 font-bold">
                        ₹{camp.costPerQualifiedLead.toFixed(0)}
                      </td>

                      <td className="py-3.5 px-3 text-right text-neutral-300">
                        {camp.roas}x
                      </td>

                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={() => onToggleCampaign(camp.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors border ${
                            camp.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                              : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                          }`}
                        >
                          {camp.status === 'active' ? (
                            <>
                              <Play className="w-3 h-3 fill-emerald-400" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 fill-neutral-400" />
                              <span>Paused</span>
                            </>
                          )}
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

      {/* Placement Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              Meta Placement Efficiency
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Breakdown across Instagram vs Facebook placements in INR.
            </p>
          </div>

          <div className="space-y-3">
            {placements.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold text-neutral-200">{p.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400">{p.cpl} CPL</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] text-neutral-400 font-mono mt-2 pt-2 border-t border-neutral-800/80">
                    <div>
                      <span>Leads: </span>
                      <strong className="text-neutral-200">{p.leads}</strong>
                    </div>
                    <div>
                      <span>CTR: </span>
                      <strong className="text-cyan-400">{p.ctr}</strong>
                    </div>
                    <div>
                      <span>Form Conv: </span>
                      <strong className="text-emerald-400">{p.convRate}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ad Creatives Matrix */}
        <div className="lg:col-span-2 rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              Ad Creative Performance Matrix
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Visual assets and creative copy performance.
            </p>
          </div>

          {filteredCreatives.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400 border border-dashed border-neutral-800 rounded-xl">
              No active ad creative assets linked yet. Add campaigns to display creative metrics.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredCreatives.map((cr) => (
                <div
                  key={cr.id}
                  className="rounded-xl bg-neutral-950/80 border border-neutral-800 overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative aspect-video bg-neutral-900">
                    <img
                      src={cr.imageUrl}
                      alt={cr.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-neutral-950/80 text-neutral-200 border border-neutral-700 backdrop-blur-sm">
                      {cr.format}
                    </div>
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-400 text-neutral-950">
                      {cr.rating}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-200 line-clamp-2">
                        "{cr.headline}"
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1">
                        {cr.copy}
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[11px] font-mono pt-2 border-t border-neutral-800 text-center">
                      <div>
                        <div className="text-neutral-400 text-[10px]">Spend</div>
                        <div className="font-bold text-neutral-200">₹{(cr.spend / 1000).toFixed(0)}k</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 text-[10px]">Leads</div>
                        <div className="font-bold text-emerald-400">{cr.leads}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 text-[10px]">CPL</div>
                        <div className="font-bold text-amber-400">₹{cr.cpl.toFixed(0)}</div>
                      </div>
                      <div>
                        <div className="text-neutral-400 text-[10px]">Conv %</div>
                        <div className="font-bold text-cyan-400">{cr.conversionRate}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Campaign Modal */}
      {showAddCampaignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-5 space-y-4 text-xs animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-neutral-100">Add Meta Ad Campaign</h3>
              <button
                onClick={() => setShowAddCampaignModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-3">
              <div>
                <label className="text-neutral-300 font-semibold block mb-1">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  required
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="e.g. VIP Seafront Villas · Instant Form"
                  className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Daily Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={newCampDailyBudget}
                    onChange={(e) => setNewCampDailyBudget(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Total Spend (₹)
                  </label>
                  <input
                    type="number"
                    value={newCampSpend}
                    onChange={(e) => setNewCampSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Leads Generated
                  </label>
                  <input
                    type="number"
                    value={newCampLeads}
                    onChange={(e) => setNewCampLeads(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-neutral-300 font-semibold block mb-1">
                    Objective
                  </label>
                  <select
                    value={newCampObjective}
                    onChange={(e) => setNewCampObjective(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="Conversations & WhatsApp">Conversations & WhatsApp</option>
                    <option value="Website Conversions">Website Conversions</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCampaignModal(false)}
                  className="px-3 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold shadow-sm"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
