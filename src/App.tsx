import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CLIENTS, 
  INITIAL_CAMPAIGNS, 
  INITIAL_CREATIVES, 
  INITIAL_SALES_REPS, 
  INITIAL_LEADS, 
  INITIAL_DAILY_METRICS, 
  SPEED_TO_LEAD_BENCHMARKS, 
  INITIAL_DATA_SOURCES,
  SAMPLE_STARTER_DATA
} from './data/mockData';
import { 
  ClientProfile, 
  Campaign, 
  AdCreative, 
  SalesRep, 
  Lead, 
  DailyMetric, 
  LeadStatus, 
  DataSourceStatus,
  DateFilter
} from './types';
import { Header } from './components/Header';
import { ExecutiveOverview } from './components/ExecutiveOverview';
import { MetaAdsEfficiency } from './components/MetaAdsEfficiency';
import { LeadCRMView } from './components/LeadCRMView';
import { SalesBottleneckAudit } from './components/SalesBottleneckAudit';
import { AutomatedReporting } from './components/AutomatedReporting';
import { DataIntegrations } from './components/DataIntegrations';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { NewLeadModal } from './components/NewLeadModal';
import { ScheduleReportModal } from './components/ScheduleReportModal';
import { MetaAdsConnectModal } from './components/MetaAdsConnectModal';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  Zap, 
  Bell, 
  Presentation, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { 
  fetchGoogleSheetCsv, 
  parseCsvString, 
  autoDetectColumns, 
  convertSheetRowsToLeads, 
  deriveSalesRepsFromLeads, 
  deriveCampaignsFromLeads, 
  deriveDailyMetricsFromLeads, 
  ColumnMapping 
} from './utils/googleSheets';

export default function App() {
  const [clients] = useState<ClientProfile[]>(INITIAL_CLIENTS);
  const [activeClient, setActiveClient] = useState<ClientProfile>(INITIAL_CLIENTS[0]);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateFilter, setDateFilter] = useState<DateFilter>({ preset: 'all' });
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Core Data States with localStorage persistence
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('digitrix_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });

  const [creatives, setCreatives] = useState<AdCreative[]>(() => {
    const saved = localStorage.getItem('digitrix_creatives');
    return saved ? JSON.parse(saved) : INITIAL_CREATIVES;
  });

  const [salesReps, setSalesReps] = useState<SalesRep[]>(() => {
    const saved = localStorage.getItem('digitrix_salesReps');
    return saved ? JSON.parse(saved) : INITIAL_SALES_REPS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('digitrix_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>(() => {
    const saved = localStorage.getItem('digitrix_dailyMetrics');
    return saved ? JSON.parse(saved) : INITIAL_DAILY_METRICS;
  });

  const [dataSources, setDataSources] = useState<DataSourceStatus>(() => {
    const saved = localStorage.getItem('digitrix_dataSources');
    return saved ? JSON.parse(saved) : INITIAL_DATA_SOURCES;
  });

  // Google Sheets Sync State
  const [sheetUrlInput, setSheetUrlInput] = useState<string>(() => {
    return localStorage.getItem('digitrix_sheet_url') || '';
  });
  const [sheetLoading, setSheetLoading] = useState<boolean>(false);
  const [detectedColumns, setDetectedColumns] = useState<ColumnMapping | null>(null);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem('digitrix_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('digitrix_creatives', JSON.stringify(creatives));
  }, [creatives]);

  useEffect(() => {
    localStorage.setItem('digitrix_salesReps', JSON.stringify(salesReps));
  }, [salesReps]);

  useEffect(() => {
    localStorage.setItem('digitrix_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('digitrix_dailyMetrics', JSON.stringify(dailyMetrics));
  }, [dailyMetrics]);

  useEffect(() => {
    localStorage.setItem('digitrix_dataSources', JSON.stringify(dataSources));
  }, [dataSources]);

  // Live Google Sheet Ingestion Handler
  const handleConnectGoogleSheet = async (url: string) => {
    if (!url || !url.trim()) {
      showToast('Please enter a Google Sheet URL.');
      return;
    }
    setSheetLoading(true);
    try {
      const csvText = await fetchGoogleSheetCsv(url);
      const parsed = parseCsvString(csvText);
      if (parsed.rows.length === 0) {
        throw new Error('No data rows found in Google Sheet. Please check that row 1 has headers and row 2+ has leads.');
      }
      const mapping = autoDetectColumns(parsed.headers);
      setDetectedColumns(mapping);

      const parsedLeads = convertSheetRowsToLeads(parsed.rows, mapping);
      const derivedReps = deriveSalesRepsFromLeads(parsedLeads);
      const derivedCamps = deriveCampaignsFromLeads(parsedLeads);
      const derivedMetrics = deriveDailyMetricsFromLeads(
        parsedLeads,
        derivedCamps.reduce((a, b) => a + b.totalSpend, 0)
      );

      setLeads(parsedLeads);
      if (derivedReps.length > 0) setSalesReps(derivedReps);
      if (derivedCamps.length > 0) setCampaigns(derivedCamps);
      if (derivedMetrics.length > 0) setDailyMetrics(derivedMetrics);

      setDataSources((prev) => ({
        ...prev,
        sheetsConnected: true,
        sheetUrl: url,
        sheetRowCount: parsedLeads.length,
        sheetLastSync: 'Just now',
      }));

      localStorage.setItem('digitrix_sheet_url', url);
      showToast(`Google Sheet connected! Synced ${parsedLeads.length} live leads into CRM.`);
    } catch (err: any) {
      console.error('Sheet Sync Error:', err);
      showToast(err.message || 'Failed to sync Google Sheet. Check permissions.');
      throw err;
    } finally {
      setSheetLoading(false);
    }
  };

  // Auto-refresh connected Google Sheet data on mount to ensure updated mappings apply
  useEffect(() => {
    const savedSheetUrl = localStorage.getItem('digitrix_sheet_url');
    if (savedSheetUrl && savedSheetUrl.trim()) {
      handleConnectGoogleSheet(savedSheetUrl).catch(() => {});
    }
  }, []);

  // Modals & Drawers
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newLeadModalOpen, setNewLeadModalOpen] = useState<boolean>(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [metaModalOpen, setMetaModalOpen] = useState<boolean>(false);

  // Sync real-time Meta campaigns into state
  const handleSyncMetaCampaigns = (newCampaigns: Campaign[], totalSpend: number) => {
    setCampaigns(newCampaigns);
    const derivedMetrics = deriveDailyMetricsFromLeads(leads, totalSpend);
    if (derivedMetrics.length > 0) {
      setDailyMetrics(derivedMetrics);
    }
    showToast(`Live Meta Ads synchronized! Updated ${newCampaigns.length} campaigns in INR.`);
  };

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const hasData = campaigns.length > 0 || leads.length > 0 || salesReps.length > 0;

  // Load Sample Agency Dataset on demand
  const handleLoadSampleData = () => {
    setCampaigns(SAMPLE_STARTER_DATA.campaigns);
    setCreatives(SAMPLE_STARTER_DATA.creatives);
    setSalesReps(SAMPLE_STARTER_DATA.salesReps);
    setLeads(SAMPLE_STARTER_DATA.leads);
    showToast('Loaded sample dataset for testing & preview.');
  };

  // Clear all data (blank slate)
  const handleClearAllData = () => {
    setCampaigns([]);
    setCreatives([]);
    setSalesReps([]);
    setLeads([]);
    setDailyMetrics([]);
    localStorage.removeItem('digitrix_campaigns');
    localStorage.removeItem('digitrix_creatives');
    localStorage.removeItem('digitrix_salesReps');
    localStorage.removeItem('digitrix_leads');
    localStorage.removeItem('digitrix_dailyMetrics');
    showToast('All workspace data cleared. Fresh blank slate.');
  };

  // Toggle Campaign active/paused
  const handleToggleCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'active' ? 'paused' : 'active' }
          : c
      )
    );
    showToast('Meta Campaign delivery state updated.');
  };

  // Add campaign
  const handleAddCampaign = (newCamp: Campaign) => {
    setCampaigns((prev) => [newCamp, ...prev]);
    showToast(`Registered campaign: ${newCamp.name}`);
  };

  // Add sales rep
  const handleAddSalesRep = (newRep: SalesRep) => {
    setSalesReps((prev) => [newRep, ...prev]);
    showToast(`Registered advisor: ${newRep.name}`);
  };

  // Update lead status
  const handleUpdateLeadStatus = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, salesStatus: newStatus } : l))
    );
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, salesStatus: newStatus } : null));
    }
    showToast(`Lead updated to: ${newStatus}`);
  };

  // Update notes
  const handleUpdateNotes = (leadId: string, notes: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, notes } : l))
    );
    showToast('Lead follow-up notes recorded.');
  };

  // Update assigned rep
  const handleUpdateRep = (leadId: string, repName: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, assignedRep: repName } : l))
    );
    showToast(`Lead reassigned to ${repName}`);
  };

  // Add lead manually
  const handleAddLead = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev]);
    showToast(`Added inquiry: ${newLead.fullName}`);
  };

  // Batch import leads
  const handleImportLeads = (newLeads: Lead[]) => {
    setLeads((prev) => [...newLeads, ...prev]);
    showToast(`Imported ${newLeads.length} leads successfully!`);
  };

  // Sync Meta Ads simulation
  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setDataSources((prev) => ({
        ...prev,
        metaLastSync: 'Just now (Synced with Meta Graph API)',
      }));
      showToast('Meta Ads Manager sync complete: Metrics refreshed.');
    }, 1200);
  };

  // Simulate an incoming instant lead from Meta Lead Ads
  const handleTriggerTestLead = () => {
    const testNames = [
      'Vikram Mittal',
      'Radhika Singhal',
      'Dr. Kabir Anand',
      'Alok Vardhan',
      'Shalini Chawla',
    ];
    const chosenName = testNames[Math.floor(Math.random() * testNames.length)];
    const randomPhone = `+91 98${Math.floor(10 + Math.random() * 89)} ${Math.floor(10000 + Math.random() * 89999)}`;

    const incomingLead: Lead = {
      id: `lead-live-${Date.now()}`,
      fullName: chosenName,
      email: `${chosenName.toLowerCase().replace(/[^a-z]/g, '')}@investorholdings.in`,
      phone: randomPhone,
      campaignId: campaigns[0]?.id || 'camp-1',
      campaignName: campaigns[0]?.name || 'Meta Instant Lead Form',
      adSetName: 'High Net Worth Inbound',
      adCreativeName: 'Dusk Architecture Hook',
      platform: 'Instagram',
      placement: 'Reels',
      submittedAt: new Date().toISOString(),
      budgetBracket: '₹3 Cr - ₹5 Cr',
      purchaseTimeline: 'Ready within 30 days',
      propertyTypeOrService: 'Waterfront 4-BHK Villa',
      intentScore: 97,
      intentGrade: 'A',
      verifiedPhone: true,
      salesStatus: 'New',
      firstResponseMinutes: null,
      followUpCount: 0,
      assignedRep: salesReps[0]?.name || 'Unassigned',
      detailedComment: 'Interested in booking immediate private walkthrough this weekend. Looking for sea-facing villa with high ceiling and private deck.',
      notes: 'New live submission captured via Meta Webhook listener. Instant WhatsApp notification sent.',
      estimatedValue: 35000000,
    };

    setLeads((prev) => [incomingLead, ...prev]);
    showToast(`New Grade-A Lead Captured: ${incomingLead.fullName} via Meta Ads!`);
  };

  // Client switcher handler
  const handleSelectClient = (client: ClientProfile) => {
    setActiveClient(client);
    showToast(`Switched workspace to: ${client.companyName}`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Client Pitch Presentation Mode Header Bar */}
      {presentationMode && (
        <div className="bg-amber-400 text-neutral-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md z-50">
          <div className="flex items-center gap-2">
            <Presentation className="w-4 h-4" />
            <span>
              <strong>Digitrix Media Client Presentation Mode Active</strong> · Presenting to {activeClient.companyName}
            </span>
          </div>
          <button
            onClick={() => setPresentationMode(false)}
            className="px-2.5 py-0.5 rounded bg-neutral-950 text-amber-400 text-[11px] font-bold hover:bg-neutral-900 transition-colors"
          >
            Exit Client View
          </button>
        </div>
      )}

      {/* Main Top Navigation */}
      <Header
        clients={clients}
        activeClient={activeClient}
        onSelectClient={handleSelectClient}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isSyncing={isSyncing}
        onSync={handleSync}
        presentationMode={presentationMode}
        onTogglePresentationMode={() => setPresentationMode(!presentationMode)}
        dateFilter={dateFilter}
        onChangeDateFilter={setDateFilter}
        hasData={hasData}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <ExecutiveOverview
            client={activeClient}
            campaigns={campaigns}
            creatives={creatives}
            dailyMetrics={dailyMetrics}
            leads={leads}
            salesReps={salesReps}
            dateFilter={dateFilter}
            presentationMode={presentationMode}
            onNavigateTab={setActiveTab}
            onOpenReportModal={() => setActiveTab('reporting')}
            onOpenNewLeadModal={() => setNewLeadModalOpen(true)}
            onLoadSampleData={handleLoadSampleData}
            metaConnected={dataSources.metaConnected}
          />
        )}

        {activeTab === 'meta-ads' && (
          <MetaAdsEfficiency
            campaigns={campaigns}
            creatives={creatives}
            client={activeClient}
            dateFilter={dateFilter}
            onToggleCampaign={handleToggleCampaign}
            onAddCampaign={handleAddCampaign}
            onTriggerTestLead={handleTriggerTestLead}
            onOpenMetaModal={() => setMetaModalOpen(true)}
            metaConnected={dataSources.metaConnected}
          />
        )}

        {activeTab === 'crm' && (
          <LeadCRMView
            leads={leads}
            client={activeClient}
            dateFilter={dateFilter}
            onUpdateLeadStatus={handleUpdateLeadStatus}
            onSelectLead={setSelectedLead}
            onOpenNewLeadModal={() => setNewLeadModalOpen(true)}
            onOpenImportModal={() => setActiveTab('integrations')}
          />
        )}

        {activeTab === 'sales-audit' && (
          <SalesBottleneckAudit
            salesReps={salesReps}
            benchmarks={SPEED_TO_LEAD_BENCHMARKS}
            client={activeClient}
            leads={leads}
            onAddSalesRep={handleAddSalesRep}
          />
        )}

        {activeTab === 'reporting' && (
          <AutomatedReporting
            client={activeClient}
            campaigns={campaigns}
            creatives={creatives}
            salesReps={salesReps}
            leads={leads}
            dateFilter={dateFilter}
            onOpenScheduleModal={() => setScheduleModalOpen(true)}
            metaConnected={dataSources.metaConnected}
          />
        )}

        {activeTab === 'integrations' && (
          <DataIntegrations
            dataSourceStatus={dataSources}
            onUpdateDataSources={setDataSources}
            onImportLeads={handleImportLeads}
            onTriggerTestLead={handleTriggerTestLead}
            onOpenMetaModal={() => setMetaModalOpen(true)}
            onConnectGoogleSheet={handleConnectGoogleSheet}
            sheetLoading={sheetLoading}
            sheetUrlInput={sheetUrlInput}
            setSheetUrlInput={setSheetUrlInput}
            detectedColumns={detectedColumns}
            onLoadSampleData={handleLoadSampleData}
            totalLeadsCount={leads.length}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-5 text-neutral-400 text-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-200">Digitrix Media</span>
            <span>·</span>
            <span>Meta Ads Lead Intelligence & Sales Acceleration System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Client: {activeClient.companyName}</span>
            <span>·</span>
            <span>Contact: digitrixmedia.agency@gmail.com</span>
          </div>
        </div>
      </footer>

      {/* Slide-over Lead Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        salesReps={salesReps}
        onClose={() => setSelectedLead(null)}
        onUpdateStatus={handleUpdateLeadStatus}
        onUpdateNotes={handleUpdateNotes}
        onUpdateRep={handleUpdateRep}
      />

      {/* Manual New Lead Modal */}
      {newLeadModalOpen && (
        <NewLeadModal
          client={activeClient}
          salesReps={salesReps}
          onClose={() => setNewLeadModalOpen(false)}
          onAddLead={handleAddLead}
        />
      )}

      {/* Automated Report Scheduling Modal */}
      {scheduleModalOpen && (
        <ScheduleReportModal
          client={activeClient}
          onClose={() => setScheduleModalOpen(false)}
          onSaved={() => showToast('Automated client report schedule saved.')}
        />
      )}

      {/* Meta Ads Direct API Connect Modal */}
      <MetaAdsConnectModal
        isOpen={metaModalOpen}
        onClose={() => setMetaModalOpen(false)}
        dataSourceStatus={dataSources}
        onUpdateDataSources={setDataSources}
        onSyncCampaigns={handleSyncMetaCampaigns}
      />

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 border border-amber-500/40 text-neutral-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-150">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-neutral-400 hover:text-neutral-200 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
