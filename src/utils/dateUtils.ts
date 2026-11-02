import { DateRangePreset, DateFilter } from '../types';

export const parseFlexibleDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  const now = new Date();

  if (lower === 'today' || lower === 'recent' || lower === 'just now') {
    return new Date();
  }
  if (lower === 'yesterday') {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  // Handle YYYY-MM-DD or YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
  const ymdMatch = trimmed.match(/^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const hours = ymdMatch[4] !== undefined ? parseInt(ymdMatch[4], 10) : 12;
    const mins = ymdMatch[5] !== undefined ? parseInt(ymdMatch[5], 10) : 0;
    const secs = ymdMatch[6] !== undefined ? parseInt(ymdMatch[6], 10) : 0;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return new Date(year, month, day, hours, mins, secs);
    }
  }

  // Handle DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY or MM/DD/YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\-\/\.](\d{1,2})[\-\/\.](\d{2,4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (dmyMatch) {
    let p1 = parseInt(dmyMatch[1], 10);
    let p2 = parseInt(dmyMatch[2], 10);
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const hours = dmyMatch[4] !== undefined ? parseInt(dmyMatch[4], 10) : 12;
    const mins = dmyMatch[5] !== undefined ? parseInt(dmyMatch[5], 10) : 0;
    const secs = dmyMatch[6] !== undefined ? parseInt(dmyMatch[6], 10) : 0;

    // If p1 > 12, p1 MUST be day, p2 is month
    if (p1 > 12 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
      return new Date(year, p2 - 1, p1, hours, mins, secs);
    }
    // If p2 > 12, p2 MUST be day, p1 is month
    if (p2 > 12 && p2 <= 31 && p1 >= 1 && p1 <= 12) {
      return new Date(year, p1 - 1, p2, hours, mins, secs);
    }
    // Default: p1 is day, p2 is month (Indian/International format DD/MM/YYYY)
    if (p1 >= 1 && p1 <= 31 && p2 >= 1 && p2 <= 12) {
      return new Date(year, p2 - 1, p1, hours, mins, secs);
    }
  }

  // Handle textual month dates like "6Oct", "6 Oct", "6-Oct-2026", "6 Oct 2026", "31Oct"
  const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  
  // Day Month Year e.g. "6Oct", "6 Oct", "06-Oct-2026", "31Oct"
  const dayMonthMatch = trimmed.match(/^(\d{1,2})[\s\-\,]*([a-zA-Z]{3,9})[\s\-\,]*(\d{2,4})?/i);
  if (dayMonthMatch) {
    const day = parseInt(dayMonthMatch[1], 10);
    const monthStr = dayMonthMatch[2].toLowerCase().slice(0, 3);
    const monthIndex = monthNames.indexOf(monthStr);
    let year = dayMonthMatch[3] ? parseInt(dayMonthMatch[3], 10) : now.getFullYear();
    if (year < 100) year += 2000;

    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      return new Date(year, monthIndex, day, 12, 0, 0);
    }
  }

  // Month Day Year e.g. "Oct 6, 2026", "October 31, 2026"
  const monthDayMatch = trimmed.match(/^([a-zA-Z]{3,9})[\s\-\,]+(\d{1,2})[\s\-\,]*(\d{2,4})?/i);
  if (monthDayMatch) {
    const monthStr = monthDayMatch[1].toLowerCase().slice(0, 3);
    const day = parseInt(monthDayMatch[2], 10);
    const monthIndex = monthNames.indexOf(monthStr);
    let year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : now.getFullYear();
    if (year < 100) year += 2000;

    if (monthIndex !== -1 && day >= 1 && day <= 31) {
      return new Date(year, monthIndex, day, 12, 0, 0);
    }
  }

  // Fallback to JS Date constructor
  const directDate = new Date(trimmed);
  if (!isNaN(directDate.getTime())) {
    return directDate;
  }

  return null;
};

export const getDateRangeBounds = (preset: DateRangePreset, customStart?: string, customEnd?: string): { start: Date; end: Date } => {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  let start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

  switch (preset) {
    case 'all':
      start = new Date(1970, 0, 1);
      end.setTime(new Date(2099, 11, 31).getTime());
      break;
    case 'today':
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case '7d':
      start.setDate(start.getDate() - 6);
      break;
    case '14d':
      start.setDate(start.getDate() - 13);
      break;
    case '30d':
      start.setDate(start.getDate() - 29);
      break;
    case 'this_month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end.setTime(new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).getTime());
      break;
    case 'custom':
      if (customStart) {
        start = new Date(customStart + 'T00:00:00');
      }
      if (customEnd) {
        end.setTime(new Date(customEnd + 'T23:59:59').getTime());
      }
      break;
  }

  return { start, end };
};

export const formatDateToYMD = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'recent' || lower === 'just now') return 'Recent';
  if (lower === 'today') return 'Today';
  if (lower === 'yesterday') return 'Yesterday';

  const d = parseFlexibleDate(dateStr);
  if (!d || isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const getDateFilterMultiplier = (filter: DateFilter): number => {
  if (!filter || filter.preset === 'all') return 1;
  switch (filter.preset) {
    case 'today':
    case 'yesterday':
      return 1 / 30;
    case '7d':
      return 7 / 30;
    case '14d':
      return 14 / 30;
    case '30d':
    case 'this_month':
    case 'last_month':
      return 1;
    case 'custom': {
      if (filter.startDate && filter.endDate) {
        const d1 = new Date(filter.startDate).getTime();
        const d2 = new Date(filter.endDate).getTime();
        const diffDays = Math.max(1, Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)));
        return Math.max(0.033, diffDays / 30);
      }
      return 1;
    }
    default:
      return 1;
  }
};

export const isDateInRange = (dateStr: string, filter: DateFilter): boolean => {
  if (!filter || filter.preset === 'all') return true;
  if (!dateStr) return true;
  const { start, end } = getDateRangeBounds(filter.preset, filter.startDate, filter.endDate);
  const target = parseFlexibleDate(dateStr);
  if (!target || isNaN(target.getTime())) return true;
  return target >= start && target <= end;
};

