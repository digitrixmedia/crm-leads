import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Calendar, Clock, Sparkles } from 'lucide-react';
import { ClientProfile } from '../types';

interface ScheduleReportModalProps {
  client: ClientProfile;
  onClose: () => void;
  onSaved: () => void;
}

export const ScheduleReportModal: React.FC<ScheduleReportModalProps> = ({
  client,
  onClose,
  onSaved,
}) => {
  const [recipient, setRecipient] = useState(client.contactEmail);
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [timeOfDay, setTimeOfDay] = useState('08:00 AM');
  const [includeSalesAudit, setIncludeSalesAudit] = useState(true);
  const [includeCreatives, setIncludeCreatives] = useState(true);
  const [customMemo, setCustomMemo] = useState(
    'Please review your weekly Meta Ads lead performance and sales team response times. Digitrix Media stands ready for our bi-weekly strategy alignment.'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono tracking-wider uppercase text-amber-400">
              Automated Dispatch System
            </span>
            <h3 className="text-lg font-bold text-neutral-100">
              Schedule Client Performance Reports
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Primary Client Recipient(s)
            </label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              Digitrix copy sent automatically to: <strong>digitrixmedia.agency@gmail.com</strong>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                <option value="weekly">Every Week</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Delivery Day
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400"
              >
                <option value="Monday">Monday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Friday">Friday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>

            <div>
              <label className="text-neutral-300 font-semibold block mb-1">
                Time (EST)
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 font-mono"
              >
                <option value="08:00 AM">08:00 AM</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-300 block mb-1">
              Included Report Modules:
            </span>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={includeSalesAudit}
                onChange={(e) => setIncludeSalesAudit(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <span>Sales Team Speed-to-Lead Audit & Revenue Bottlenecks</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
              <input
                type="checkbox"
                checked={includeCreatives}
                onChange={(e) => setIncludeCreatives(e.target.checked)}
                className="accent-amber-400 rounded"
              />
              <span>Meta Ad Creatives & Placement ROAS Metrics</span>
            </label>
          </div>

          <div>
            <label className="text-neutral-300 font-semibold block mb-1">
              Agency Executive Note (Appended to Email):
            </label>
            <textarea
              value={customMemo}
              onChange={(e) => setCustomMemo(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-100 focus:outline-none focus:border-amber-400 text-xs resize-none"
            />
          </div>

          {isSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Automated schedule active! Next dispatch: {dayOfWeek} at {timeOfDay}.</span>
            </div>
          )}

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
              disabled={isSuccess}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 transition-colors shadow-sm shadow-amber-400/20 disabled:opacity-50"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
