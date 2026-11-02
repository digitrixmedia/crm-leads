import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  HelpCircle, 
  KeyRound, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  Copy, 
  Lock
} from 'lucide-react';
import { Campaign, DataSourceStatus } from '../types';
import { formatINR } from '../utils/formatters';

interface MetaAdsConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataSourceStatus: DataSourceStatus;
  onUpdateDataSources: (updated: DataSourceStatus) => void;
  onSyncCampaigns: (campaigns: Campaign[], totalSpend: number) => void;
}

export const MetaAdsConnectModal: React.FC<MetaAdsConnectModalProps> = ({
  isOpen,
  onClose,
  dataSourceStatus,
  onUpdateDataSources,
  onSyncCampaigns,
}) => {
  const [accountId, setAccountId] = useState(dataSourceStatus.metaAccountId || 'act_948201847192');
  const [accessToken, setAccessToken] = useState(dataSourceStatus.metaAccessToken || '');
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeGuideTab, setActiveGuideTab] = useState<'quick' | 'system-user' | 'formulas'>('quick');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleTestAndSync = async (overrideAccountId?: string, overrideToken?: string) => {
    const actId = (overrideAccountId || accountId).trim();
    const token = (overrideToken || accessToken).trim();

    if (!actId) {
      setErrorMsg('Please enter your Meta Ad Account ID (e.g., act_1234567890).');
      return;
    }
    if (!token) {
      setErrorMsg('Please enter your Meta Graph API Access Token or System User Token.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch('/api/meta-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: actId,
          accessToken: token,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to connect to Meta Marketing API.');
      }

      // Successfully synced
      onUpdateDataSources({
        ...dataSourceStatus,
        metaConnected: true,
        metaAccountId: data.accountId,
        metaAccountName: data.accountName,
        metaLastSync: `Just now (${data.metaLastSync || 'Live Sync'})`,
        metaAccessToken: token,
        metaCurrency: data.currency || 'INR',
      });

      if (Array.isArray(data.campaigns) && data.campaigns.length > 0) {
        onSyncCampaigns(data.campaigns, data.totalSpend || 0);
      }

      setSuccessMsg(
        `Successfully connected! Fetched ${data.campaigns?.length || 0} active campaigns, ₹${(data.totalSpend || 0).toLocaleString('en-IN')} total spend, and ₹${(data.averageCpl || 0).toFixed(1)} real CPL.`
      );
    } catch (err: any) {
      console.error('Meta connection error:', err);
      setErrorMsg(err.message || 'Could not verify Meta credentials. Please check token permissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoAccount = () => {
    setAccountId('act_948201847192');
    setAccessToken('demo_token_agency_live');
    handleTestAndSync('act_948201847192', 'demo_token_agency_live');
  };

  const handleDisconnect = () => {
    onUpdateDataSources({
      ...dataSourceStatus,
      metaConnected: false,
      metaLastSync: 'Disconnected',
      metaAccessToken: '',
    });
    setSuccessMsg('Meta Ads Manager disconnected from workspace.');
    setAccessToken('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-6 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-lg">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-neutral-100">
                  Connect Direct Meta Ads Manager
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Graph API v21.0
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Pulls real-time Ad Spend, exact Cost Per Lead (CPL), CPC, and campaign pacing directly into your Digitrix client dashboard in INR (₹).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Badge */}
        {dataSourceStatus.metaConnected ? (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-between gap-3 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold">Live Connected:</span> {dataSourceStatus.metaAccountName} ({dataSourceStatus.metaAccountId})
                <span className="text-[11px] text-emerald-400/80 block">Last synchronized: {dataSourceStatus.metaLastSync}</span>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl flex items-center gap-2 text-xs text-amber-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Awaiting Meta Ads API Credentials:</strong> Enter your Ad Account ID and Graph API Access Token below to enable live INR spend & real CPL sync.
            </span>
          </div>
        )}

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">{errorMsg}</div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Ensure your token has <code className="text-amber-400">ads_read</code> and <code className="text-amber-400">leads_retrieval</code> permissions, and your Ad Account ID includes the <code className="text-neutral-200">act_</code> prefix.
              </div>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="font-semibold">{successMsg}</div>
          </div>
        )}

        {/* Input Form */}
        <div className="space-y-4 bg-neutral-950 p-4 sm:p-5 rounded-xl border border-neutral-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Meta Ad Account ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Meta Ad Account ID</span>
                <span className="text-[10px] text-neutral-500 font-mono">Format: act_XXXXXXXX</span>
              </label>
              <input
                type="text"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                placeholder="act_948201847192"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[10px] text-neutral-500">
                Found in Meta Ads Manager URL: <code className="text-neutral-400">?act=123456789</code> or top account picker.
              </p>
            </div>

            {/* Currency setting */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
                <span>Account Currency</span>
                <span className="text-[10px] text-amber-400 font-mono">Digitrix Requirement</span>
              </label>
              <div className="flex items-center px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 justify-between">
                <span>Indian Rupee (INR · ₹)</span>
                <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
              </div>
              <p className="text-[10px] text-neutral-500">
                All Meta campaign spend, CPC, and CPL are automatically calculated and reported in ₹.
              </p>
            </div>
          </div>

          {/* Meta Access Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Meta Graph API Access Token / System User Token</span>
              </label>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 font-mono"
              >
                {showToken ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showToken ? 'Hide' : 'Reveal'}</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="EAAO... (Permanent System User Token or Graph API Explorer Token)"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <p className="text-[10px] text-neutral-500">
              Requires permissions: <code className="text-neutral-300">ads_read</code> (to pull spend/metrics) and <code className="text-neutral-300">leads_retrieval</code> (to capture instant form leads).
            </p>
          </div>

          {/* Button actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleLoadDemoAccount}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Agency Demo Account</span>
            </button>

            <button
              onClick={() => handleTestAndSync()}
              disabled={loading || !accountId.trim() || !accessToken.trim()}
              className="w-full sm:w-auto px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-neutral-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/30 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Validating with Meta Graph API...' : 'Verify & Sync Live Meta Ads (INR)'}</span>
            </button>
          </div>
        </div>

        {/* Step-by-Step Educational Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>How To Generate Your Meta Credentials:</span>
            </h4>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveGuideTab('quick')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeGuideTab === 'quick' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-neutral-300'
                }`}
              >
                2-Min Quick Setup
              </button>
              <button
                onClick={() => setActiveGuideTab('system-user')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeGuideTab === 'system-user' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-neutral-300'
                }`}
              >
                Permanent Agency Token
              </button>
              <button
                onClick={() => setActiveGuideTab('formulas')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeGuideTab === 'formulas' ? 'bg-neutral-800 text-amber-400' : 'text-neutral-400 hover:text-neutral-300'
                }`}
              >
                CPL & Spend Calculation
              </button>
            </div>
          </div>

          {activeGuideTab === 'quick' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <div className="font-semibold text-neutral-200 flex items-center justify-between">
                <span>Method 1: Fast 2-Minute Setup (Meta Graph API Explorer)</span>
                <a
                  href="https://developers.facebook.com/tools/explorer/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                >
                  <span>Open Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 text-[11px] pl-1">
                <li>
                  Open <a href="https://developers.facebook.com/tools/explorer/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">Meta Graph API Explorer</a> in a new tab.
                </li>
                <li>
                  Under <strong>Meta App</strong>, select your app (or click Create App → Business).
                </li>
                <li>
                  Under <strong>User or Page</strong>, select <strong>"Get User Access Token"</strong>.
                </li>
                <li>
                  Under <strong>Add a permission</strong>, search and select:
                  <div className="flex flex-wrap gap-1.5 mt-1 font-mono text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">ads_read</span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">leads_retrieval</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300">pages_manage_ads</span>
                  </div>
                </li>
                <li>
                  Click <strong>Generate Access Token</strong>, approve permissions in the popup, and copy the token into the field above.
                </li>
              </ol>
            </div>
          )}

          {activeGuideTab === 'system-user' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2">
              <div className="font-semibold text-neutral-200 flex items-center justify-between">
                <span>Method 2: Permanent Agency System User (Never Expires)</span>
                <a
                  href="https://business.facebook.com/settings/system-users"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px]"
                >
                  <span>Open Meta Business Suite</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-400 text-[11px] pl-1">
                <li>
                  Navigate to <strong>Meta Business Suite</strong> → <strong>Business Settings</strong> → <strong>System Users</strong>.
                </li>
                <li>
                  Click <strong>Add</strong> → Name: <code className="text-amber-400">Digitrix Analytics Engine</code>, Role: <strong>Admin</strong>.
                </li>
                <li>
                  Click <strong>Assign Assets</strong> → Select <strong>Ad Accounts</strong> → Choose your client's ad account → Toggle <strong>Full Control (Manage Campaigns)</strong>.
                </li>
                <li>
                  Click <strong>Generate New Token</strong> → Check <code className="text-blue-300">ads_read</code> and <code className="text-blue-300">leads_retrieval</code>.
                </li>
                <li>
                  Copy the generated token. This token <strong>never expires</strong> and powers 24/7 automated client reporting.
                </li>
              </ol>
            </div>
          )}

          {activeGuideTab === 'formulas' && (
            <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-2.5">
              <div className="font-semibold text-neutral-200">
                How Meta Ad Spend & CPL are Calculated in INR (₹)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 block font-sans font-semibold">Cost Per Lead (CPL):</span>
                  <span className="text-amber-400 font-bold">CPL = Total Spend (₹) / Total Leads</span>
                  <p className="text-[10px] text-neutral-500 font-sans">
                    Pulled directly from Meta <code className="text-neutral-400">insights?fields=cost_per_action_type</code>.
                  </p>
                </div>
                <div className="p-2.5 bg-neutral-900 rounded-lg border border-neutral-800 space-y-1">
                  <span className="text-neutral-400 block font-sans font-semibold">Cost Per Qualified Lead (CPQL):</span>
                  <span className="text-emerald-400 font-bold">CPQL = Total Spend (₹) / Verified Leads</span>
                  <p className="text-[10px] text-neutral-500 font-sans">
                    Calculated by filtering leads with verified phone numbers & Grade-A/B purchase timeline.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-500 font-mono">
          <span>Digitrix Media · Meta Ads Intelligence Integration</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
