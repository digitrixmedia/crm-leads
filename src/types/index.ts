export type IntentGrade = 'A' | 'B' | 'C' | 'D';

export type DateRangePreset = 'all' | 'today' | 'yesterday' | '7d' | '14d' | '30d' | 'this_month' | 'last_month' | 'custom';

export interface DateFilter {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Warm Lead'
  | 'Qualified'
  | 'Appointment Booked'
  | 'Site Visit / Demo'
  | 'DNP (Call Again)'
  | 'Contract Sent'
  | 'Won / Closed'
  | 'Lost / Disqualified';

export type PlatformType = 'Facebook' | 'Instagram' | 'Messenger';
export type PlacementType = 'Feed' | 'Reels' | 'Stories' | 'Marketplace' | 'Audience Network';

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  campaignId: string;
  campaignName: string;
  adSetName: string;
  adCreativeName: string;
  platform: PlatformType;
  placement: PlacementType;
  submittedAt: string;
  budgetBracket: string;
  purchaseTimeline: string;
  propertyTypeOrService: string;
  intentScore: number; // 0 - 100
  intentGrade: IntentGrade;
  verifiedPhone: boolean;
  salesStatus: LeadStatus;
  firstResponseMinutes: number | null; // null if uncontacted
  followUpCount: number;
  assignedRep: string;
  notes: string;
  detailedComment?: string;
  estimatedValue: number;
  isMissingOnCrm?: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused';
  objective: string;
  dailyBudget: number;
  totalSpend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  ctr: number;
  leadsCount: number;
  cpl: number;
  qualifiedLeadsCount: number;
  costPerQualifiedLead: number;
  roas: number;
  targetCpl: number;
  pacingPercent: number;
}

export interface AdCreative {
  id: string;
  name: string;
  campaignId: string;
  headline: string;
  copy: string;
  format: 'Single Image' | 'Video Reel' | 'Carousel';
  imageUrl: string;
  impressions: number;
  spend: number;
  leads: number;
  cpl: number;
  ctr: number;
  conversionRate: number;
  rating: 'Top Performer' | 'Strong' | 'Average' | 'Needs Refresh';
}

export interface SalesRep {
  id: string;
  name: string;
  email: string;
  role: string;
  leadsAssigned: number;
  avgResponseMinutes: number;
  contactRatePercent: number;
  bookingRatePercent: number;
  closedDeals: number;
  pipelineRevenue: number;
}

export interface DailyMetric {
  date: string;
  spend: number;
  leads: number;
  cpl: number;
  targetCpl: number;
  qualifiedLeads: number;
}

export interface ClientProfile {
  id: string;
  companyName: string;
  industry: 'Real Estate' | 'Healthcare & Dental' | 'B2B Enterprise SaaS' | 'Luxury Home Services';
  tagline: string;
  targetCpl: number;
  monthlyBudget: number;
  currency: string;
  dealAverageValue: number;
  leadIntentsLabel: string;
  primaryContact: string;
  contactEmail: string;
}

export interface SpeedToLeadTier {
  range: string;
  leadsCount: number;
  bookingRatePercent: number;
  dropOffRatePercent: number;
  industryAveragePercent: number;
}

export interface DataSourceStatus {
  metaConnected: boolean;
  metaAccountId: string;
  metaAccountName: string;
  metaLastSync: string;
  metaAccessToken?: string;
  metaCurrency?: string;
  sheetsConnected: boolean;
  sheetUrl: string;
  sheetLastSync: string;
  sheetRowCount?: number;
  manualLeadsCount: number;
}

