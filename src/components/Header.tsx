import React from 'react';
import { RefreshCw, Presentation, ShieldCheck, ChevronDown, Check, Database, Trash2 } from 'lucide-react';
import { ClientProfile, DateFilter } from '../types';
import { DateFilterBar } from './DateFilterBar';

interface HeaderProps {
  clients: ClientProfile[];
  activeClient: ClientProfile;
  onSelectClient: (client: ClientProfile) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isSyncing: boolean;
  onSync: () => void;
  presentationMode: boolean;
  onTogglePresentationMode: () => void;
  dateFilter: DateFilter;
  onChangeDateFilter: (filter: DateFilter) => void;
  hasData: boolean;
  onLoadSampleData: () => void;
  onClearAllData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  clients,
  activeClient,
  onSelectClient,
  activeTab,
  onSelectTab,
  isSyncing,
  onSync,
  presentationMode,
  onTogglePresentationMode,
  dateFilter,
  onChangeDateFilter,
  hasData,
  onLoadSampleData,
  onClearAllData,
}) => {
  const [clientDropdownOpen, setClientDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'meta-ads', label: 'Meta Ads & Spend' },
    { id: 'crm', label: 'Lead Quality & CRM' },
    { id: 'sales-audit', label: 'Sales Speed Audit' },
    { id: 'reporting', label: 'Automated Reports' },
    { id: 'integrations', label: 'Data Sources' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-neutral-950 text-sm tracking-wider shadow-sm shadow-amber-500/20">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-base text-neutral-100 whitespace-nowrap">
                DIGITRIX<span className="text-amber-400 font-normal ml-1">MEDIA</span>
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">
                Meta Ads Intelligence
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-400">
            {navLinks.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-neutral-100 ${
                    isActive ? 'text-amber-400 font-semibold' : ''
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Date Filter, Client Selector, Pitch Mode & Sync */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Date Filter Bar */}
            <DateFilterBar
              dateFilter={dateFilter}
              onChangeDateFilter={onChangeDateFilter}
            />

            {/* Client Picker Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setClientDropdownOpen(!clientDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-200 hover:border-neutral-700 transition-colors whitespace-nowrap"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-medium">{activeClient.companyName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {clientDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-neutral-400 uppercase border-b border-neutral-800 mb-1">
                    Digitrix Agency Clients
                  </div>
                  {clients.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectClient(c);
                        setClientDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center justify-between transition-colors ${
                        activeClient.id === c.id
                          ? 'bg-amber-400/10 text-amber-400 font-semibold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{c.companyName}</div>
                        <div className="text-[10px] text-neutral-400">{c.industry} · Budget ₹{(c.monthlyBudget / 100000).toFixed(1)}L/mo</div>
                      </div>
                      {activeClient.id === c.id && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}

                  <div className="border-t border-neutral-800 mt-1 pt-1.5 px-2 pb-1 space-y-1">
                    {!hasData ? (
                      <button
                        onClick={() => {
                          onLoadSampleData();
                          setClientDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1 text-[11px] font-mono rounded text-amber-400 hover:bg-amber-400/10 flex items-center gap-1.5"
                      >
                        <Database className="w-3 h-3" />
                        <span>Load Sample Demo Data</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onClearAllData();
                          setClientDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1 text-[11px] font-mono rounded text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear All Data (Blank Slate)</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Client Presentation Mode Toggle */}
            <button
              onClick={onTogglePresentationMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap border ${
                presentationMode
                  ? 'bg-amber-400 text-neutral-950 border-amber-400 font-semibold shadow-sm shadow-amber-400/20'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
              title="Toggle Client-Facing Presentation Mode"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {presentationMode ? 'Exit Client View' : 'Client Pitch View'}
              </span>
            </button>

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400 text-neutral-950 hover:bg-amber-300 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav strip */}
        <div className="flex lg:hidden overflow-x-auto gap-4 py-2 border-t border-neutral-800 scrollbar-none text-xs">
          {navLinks.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`whitespace-nowrap px-2 py-1 rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-amber-400/10 text-amber-400 font-semibold' : 'text-neutral-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
