import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Share2, 
  RefreshCw, 
  CheckCircle2, 
  Upload, 
  Download, 
  Sliders, 
  Link2, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  FileText, 
  HelpCircle, 
  Eye, 
  ClipboardPaste, 
  X, 
  ExternalLink, 
  ArrowRight,
  Sparkles,
  Table,
  KeyRound
} from 'lucide-react';
import { DataSourceStatus, Lead } from '../types';
import { 
  ColumnMapping, 
  getSampleGoogleSheetCsv, 
  parseCsvString, 
  autoDetectColumns, 
  convertSheetRowsToLeads,
  fetchGoogleSheetCsv
} from '../utils/googleSheets';

interface DataIntegrationsProps {
  dataSourceStatus: DataSourceStatus;
  onUpdateDataSources: (updated: DataSourceStatus) => void;
  onImportLeads: (newLeads: Lead[]) => void;
  onTriggerTestLead: () => void;
  onOpenMetaModal?: () => void;
  onConnectGoogleSheet?: (url: string) => Promise<void>;
  sheetLoading?: boolean;
  sheetUrlInput?: string;
  setSheetUrlInput?: (url: string) => void;
  detectedColumns?: ColumnMapping | null;
  onLoadSampleData?: () => void;
  totalLeadsCount?: number;
}

export const DataIntegrations: React.FC<DataIntegrationsProps> = ({
  dataSourceStatus,
  onUpdateDataSources,
  onImportLeads,
  onTriggerTestLead,
  onOpenMetaModal,
  onConnectGoogleSheet,
  sheetLoading: parentSheetLoading = false,
  sheetUrlInput: parentSheetUrl = '',
  setSheetUrlInput,
  detectedColumns: parentDetectedColumns = null,
  onLoadSampleData,
  totalLeadsCount = 0,
}) => {
  // Local state fallbacks to guarantee no undefined exceptions
  const [localUrl, setLocalUrl] = useState<string>(parentSheetUrl || '');
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    details?: string;
  }>({
    type: dataSourceStatus.sheetsConnected ? 'success' : 'idle',
    message: dataSourceStatus.sheetsConnected 
      ? `Live Connected · ${totalLeadsCount} rows synced from Google Sheet` 
      : '',
  });

  const [activeMode, setActiveMode] = useState<'url' | 'grid-paste'>('url');
  const [showMappingDetails, setShowMappingDetails] = useState(false);

  // Direct Grid / TSV Paste State
  const [directPasteText, setDirectPasteText] = useState('');
  const [directParsedRows, setDirectParsedRows] = useState<Record<string, string>[]>([]);
  const [directHeaders, setDirectHeaders] = useState<string[]>([]);
  const [directMapping, setDirectMapping] = useState<ColumnMapping | null>(null);
  const [directImportSuccess, setDirectImportSuccess] = useState<string | null>(null);

  // Sync parent sheet URL to local state if provided
  useEffect(() => {
    if (parentSheetUrl && parentSheetUrl !== localUrl) {
      setLocalUrl(parentSheetUrl);
    }
  }, [parentSheetUrl]);

  const currentUrl = parentSheetUrl !== undefined && parentSheetUrl !== '' ? parentSheetUrl : localUrl;
  const isLoading = parentSheetLoading || internalLoading;

  const handleUrlChange = (newVal: string) => {
    setLocalUrl(newVal);
    if (setSheetUrlInput) {
      setSheetUrlInput(newVal);
    }
    // Clear error on new input
    if (syncStatus.type === 'error') {
      setSyncStatus({ type: 'idle', message: '' });
    }
  };

  // Perform Google Sheet synchronization
  const handlePerformSync = async (urlToFetch?: string) => {
    const targetUrl = (urlToFetch || currentUrl).trim();
    if (!targetUrl) {
      setSyncStatus({
        type: 'error',
        message: 'Please paste a valid Google Sheet URL first.',
        details: 'Example: https://docs.google.com/spreadsheets/d/1BxiMVs0.../edit#gid=0',
      });
      return;
    }

    setInternalLoading(true);
    setSyncStatus({
      type: 'loading',
      message: 'Reading Google Sheet and auto-mapping lead columns...',
    });

    try {
      if (onConnectGoogleSheet) {
        await onConnectGoogleSheet(targetUrl);
        setSyncStatus({
          type: 'success',
          message: 'Google Sheet successfully synced! Dashboard and CRM updated.',
        });
      } else {
        // Fallback internal fetch if parent handler is not provided
        const csv = await fetchGoogleSheetCsv(targetUrl);
        const parsed = parseCsvString(csv);
        if (parsed.rows.length === 0) {
          throw new Error('No data rows found in Google Sheet. Make sure row 1 has column headers and row 2+ has leads.');
        }
        const mapping = autoDetectColumns(parsed.headers);
        const newLeads = convertSheetRowsToLeads(parsed.rows, mapping);
        onImportLeads(newLeads);
        onUpdateDataSources({
          ...dataSourceStatus,
          sheetsConnected: true,
          sheetUrl: targetUrl,
          sheetRowCount: newLeads.length,
          sheetLastSync: 'Just now',
        });
        setSyncStatus({
          type: 'success',
          message: `Successfully loaded ${newLeads.length} leads from Google Sheet!`,
        });
      }
    } catch (err: any) {
      console.error('Google Sheet Sync Error:', err);
      setSyncStatus({
        type: 'error',
        message: err.message || 'Unable to access Google Sheet.',
        details: 'Please ensure sharing is set to "Anyone with the link can view", or use the Direct Sheet Paste tab.',
      });
    } finally {
      setInternalLoading(false);
    }
  };

  // Handle immediate paste on input
  const handleInputPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted) {
      handleUrlChange(pasted);
      // If it looks like a spreadsheet URL, auto-trigger fetch immediately
      if (pasted.includes('docs.google.com/spreadsheets') || pasted.includes('/pub?output=csv') || pasted.endsWith('.csv')) {
        setTimeout(() => {
          handlePerformSync(pasted);
        }, 100);
      }
    }
  };

  // Handle Enter key on input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePerformSync();
    }
  };

  // Download starter CSV template
  const handleDownloadTemplate = () => {
    const csvContent = getSampleGoogleSheetCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'digitrix_google_sheets_meta_leads_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle Direct Paste Parsing (TSV or CSV copied directly from Google Sheets grid)
  const handleDirectPasteChange = (text: string) => {
    setDirectPasteText(text);
    if (!text.trim()) {
      setDirectParsedRows([]);
      setDirectHeaders([]);
      setDirectMapping(null);
      return;
    }
    const parsed = parseCsvString(text);
    if (parsed.headers.length > 0 && parsed.rows.length > 0) {
      setDirectHeaders(parsed.headers);
      setDirectParsedRows(parsed.rows);
      setDirectMapping(autoDetectColumns(parsed.headers));
    }
  };

  const handleImportDirectRows = () => {
    if (!directMapping || directParsedRows.length === 0) return;
    const leads = convertSheetRowsToLeads(directParsedRows, directMapping);
    onImportLeads(leads);
    onUpdateDataSources({
      ...dataSourceStatus,
      sheetsConnected: true,
      sheetRowCount: leads.length,
      sheetLastSync: 'Just now (Direct Grid Paste)',
    });
    setDirectImportSuccess(`Successfully imported ${leads.length} leads directly into CRM!`);
    setDirectPasteText('');
    setDirectParsedRows([]);
    setTimeout(() => setDirectImportSuccess(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Overview header */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 mb-1">
          <span>Live Google Sheets & Meta Ingestion Engine</span>
          <span>·</span>
          <span>Zero Mock Data</span>
        </div>
        <h2 className="text-xl font-bold text-neutral-100">
          Data Connectors & Real-Time Sync
        </h2>
        <p className="text-xs text-neutral-400 mt-1 max-w-2xl">
          Connect your live Google Sheet or paste sheet rows directly to feed all dashboard charts, conversion funnels, and sales speed audits with 100% real lead data in INR (₹).
        </p>
      </div>

      {/* Main Focus: Live Google Sheets Connector */}
      <div className="rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950/20 border border-emerald-500/30 p-6 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-100">Google Sheets Direct Connection</h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                {dataSourceStatus.sheetsConnected ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Live Connected ({totalLeadsCount} rows synced)</span>
                  </>
                ) : (
                  <span>Ready to Sync</span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
              title="Download standard template with sample columns"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Download Template CSV</span>
            </button>

            {onLoadSampleData && (
              <button
                onClick={onLoadSampleData}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 border border-amber-400/30 transition-colors"
                title="Populate dashboard with sample Digitrix agency test data"
              >
                Load Sample Sheet Data
              </button>
            )}
          </div>
        </div>

        {/* Tab switcher: URL Link vs Direct Grid Paste */}
        <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
          <button
            onClick={() => setActiveMode('url')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'url'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Google Sheet Web Link</span>
          </button>

          <button
            onClick={() => setActiveMode('grid-paste')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
              activeMode === 'grid-paste'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>Direct Sheet Copy-Paste (No Sharing Needed)</span>
          </button>
        </div>

        {/* Mode 1: URL Link with Instant Auto-Fetch */}
        {activeMode === 'url' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-300 block">
                  Google Spreadsheet Link (Any public or view-shared Google Sheet)
                </label>
                {currentUrl && (
                  <button
                    onClick={() => handleUrlChange('')}
                    className="text-[11px] text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear URL</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onPaste={handleInputPaste}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Paste link here: https://docs.google.com/spreadsheets/d/.../edit#gid=0"
                    className="w-full pl-9 pr-24 py-2.5 text-xs rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 font-mono"
                  />
                  {currentUrl && (
                    <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ready
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handlePerformSync()}
                  disabled={isLoading || !currentUrl.trim()}
                  className="px-5 py-2.5 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-neutral-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm shadow-emerald-500/20"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>{isLoading ? 'Reading Google Sheet...' : 'Fetch & Sync Live Sheet'}</span>
                </button>
              </div>

              <p className="text-[11px] text-neutral-500">
                Tip: Paste your Google Sheet URL above and press <kbd className="px-1 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono text-[10px]">Enter</kbd> or click <strong>Fetch & Sync Live Sheet</strong>.
              </p>
            </div>

            {/* Live Feedback / Status Banners */}
            {syncStatus.type === 'loading' && (
              <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3 text-xs text-emerald-200 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold">{syncStatus.message}</div>
                  <div className="text-[11px] text-emerald-400/80">Fetching CSV payload, auto-detecting column mappings and deriving real-time metrics...</div>
                </div>
              </div>
            )}

            {syncStatus.type === 'error' && (
              <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl space-y-2 text-xs text-rose-200">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{syncStatus.message}</span>
                </div>
                {syncStatus.details && (
                  <p className="text-[11px] text-neutral-300 pl-6">
                    {syncStatus.details}
                  </p>
                )}
                <div className="pl-6 pt-1 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveMode('grid-paste')}
                    className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-[11px] font-semibold border border-rose-500/30 flex items-center gap-1"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Try Direct Sheet Copy-Paste Instead</span>
                  </button>
                  {onLoadSampleData && (
                    <button
                      onClick={onLoadSampleData}
                      className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-semibold border border-neutral-700"
                    >
                      Load Sample Demo Data
                    </button>
                  )}
                </div>
              </div>
            )}

            {syncStatus.type === 'success' && (
              <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold">{syncStatus.message}</span>
                    <span className="text-[11px] text-emerald-400/80 block">All dashboard charts, conversion rates, and sales bottlenecks are now live.</span>
                  </div>
                </div>
                <button
                  onClick={() => handlePerformSync()}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Re-Sync Now</span>
                </button>
              </div>
            )}

            {/* Sharing instructions */}
            <div className="p-3.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
              <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>How to ensure your Google Sheet can be read:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-neutral-400 text-[11px] pl-1">
                <li>In Google Sheets, click the top-right <strong>Share</strong> button.</li>
                <li>Under General Access, choose <strong>"Anyone with the link"</strong> with role set to <strong>"Viewer"</strong>.</li>
                <li>Copy the browser URL and paste it into the box above.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Mode 2: Direct Sheet Grid Copy-Paste */}
        {activeMode === 'grid-paste' && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 block">
                Copy Cells in Google Sheets (Ctrl+C) & Paste Here (Ctrl+V)
              </label>
              <p className="text-[11px] text-neutral-400">
                No sharing permissions or link configuration needed. Open your Google Sheet, select the rows with column headers, copy them, and paste below:
              </p>
              <textarea
                value={directPasteText}
                onChange={(e) => handleDirectPasteChange(e.target.value)}
                placeholder="Full Name	Phone	Email	Budget (INR)	Sales Status&#10;Rajesh Singhania	+91 98201 44820	rajesh@corp.in	₹3 Cr - ₹5 Cr	Appointment Booked&#10;Priya Sundaram	+91 98112 59012	priya@sundaram.co	₹5 Cr+	Contacted"
                rows={5}
                className="w-full p-3 text-[11px] font-mono rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 resize-y"
              />
            </div>

            {directImportSuccess && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{directImportSuccess}</span>
              </div>
            )}

            {/* Preview table if parsed */}
            {directParsedRows.length > 0 && directMapping && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-200">
                    <Table className="w-4 h-4 text-amber-400" />
                    <span>Detected {directParsedRows.length} Rows</span>
                  </div>
                  <button
                    onClick={handleImportDirectRows}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm shadow-amber-400/20"
                  >
                    Import {directParsedRows.length} Leads into CRM
                  </button>
                </div>

                <div className="overflow-x-auto max-h-40 border border-neutral-800 rounded-lg">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-neutral-900 text-neutral-400 sticky top-0 font-mono">
                      <tr>
                        {directHeaders.slice(0, 6).map((h, idx) => (
                          <th key={idx} className="px-3 py-1.5 border-b border-neutral-800">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900 font-mono">
                      {directParsedRows.slice(0, 3).map((r, rIdx) => (
                        <tr key={rIdx} className="hover:bg-neutral-900/50">
                          {directHeaders.slice(0, 6).map((h, hIdx) => (
                            <td key={hIdx} className="px-3 py-1.5 text-neutral-300 truncate max-w-[120px]">{r[h]}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Auto-detected Column Mapping Telemetry */}
        {(parentDetectedColumns || directMapping) && (
          <div className="pt-2 border-t border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>Auto-Detected Sheet Column Mappings</span>
              </span>
              <button
                onClick={() => setShowMappingDetails(!showMappingDetails)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showMappingDetails ? 'Hide Details' : 'Inspect Columns'}</span>
              </button>
            </div>

            {showMappingDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                {(() => {
                  const m = parentDetectedColumns || directMapping!;
                  return (
                    <>
                      <div>
                        <span className="text-neutral-500 block">Name:</span>
                        <span className="text-neutral-200">{m.nameCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Phone:</span>
                        <span className="text-neutral-200">{m.phoneCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Email:</span>
                        <span className="text-neutral-200">{m.emailCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Budget:</span>
                        <span className="text-neutral-200">{m.budgetCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Status:</span>
                        <span className="text-neutral-200">{m.statusCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Response Time:</span>
                        <span className="text-neutral-200">{m.responseMinutesCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Assigned Rep:</span>
                        <span className="text-neutral-200">{m.repCol || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-neutral-500 block">Deal Value:</span>
                        <span className="text-neutral-200">{m.valueCol || 'Not found'}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Secondary Integrations: Meta API & Manual CSV Paste */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source: Meta Ads Graph API */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  M
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Meta Marketing API</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    v21.0 Active
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-300 font-mono bg-neutral-950 p-3 rounded-xl border border-neutral-800">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">API Connection:</span>
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${dataSourceStatus.metaConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dataSourceStatus.metaConnected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live Connected</span>
                    </>
                  ) : (
                    <span>Awaiting Token</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Ad Account ID:</span>
                <span className="text-neutral-200">{dataSourceStatus.metaAccountId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Account Name:</span>
                <span className="text-neutral-200 truncate max-w-[180px]">{dataSourceStatus.metaAccountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Currency:</span>
                <span className="text-emerald-400 font-semibold">INR (₹)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Last Synced:</span>
                <span className="text-neutral-300 text-[11px]">{dataSourceStatus.metaLastSync}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-2">
            <button
              onClick={onOpenMetaModal}
              className="w-full py-2.5 px-3 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-neutral-100 flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-600/30"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{dataSourceStatus.metaConnected ? 'Manage Meta API & Re-Sync Live Spend' : 'Connect Direct Meta Ads Manager'}</span>
            </button>

            <button
              onClick={onTriggerTestLead}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Simulate Real-time Meta Lead Ingestion</span>
            </button>
          </div>
        </div>

        {/* Source: CSV Batch Paste */}
        <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">Manual CSV / Batch Row Ingestion</h3>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    Instant Fallback
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <textarea
                value={directPasteText}
                onChange={(e) => handleDirectPasteChange(e.target.value)}
                placeholder="Full Name,Phone,Email,Budget,Timeline&#10;Victoria Stone,+91 98201 99811,v.stone@corp.in,₹3 Cr - ₹5 Cr,Ready <30d"
                rows={3}
                className="w-full p-2.5 text-[11px] font-mono rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 resize-none"
              />
            </div>

            {directImportSuccess && (
              <div className="p-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{directImportSuccess}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-800">
            <button
              onClick={handleImportDirectRows}
              disabled={!directPasteText.trim() || directParsedRows.length === 0}
              className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-amber-400/20"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Rows into CRM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
