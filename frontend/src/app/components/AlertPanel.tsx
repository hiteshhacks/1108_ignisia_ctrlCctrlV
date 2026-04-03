import { useState } from 'react';
import { AlertTriangle, AlertCircle, Clock, X, Bell, ChevronRight, Info } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { useNavigate } from 'react-router';

interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  confidence: number;
}

const mockAlerts: Alert[] = [
  { id: '1', patientId: 'P001', patientName: 'John Miller',    severity: 'critical', message: 'Possible Sepsis Detected — Lactate ↑ 3.1 mmol/L and BP ↓ 88/54', timestamp: '14:23', confidence: 89 },
  { id: '2', patientId: 'P003', patientName: 'Emily Davis',    severity: 'warning',  message: 'Blood pressure declining — monitor closely for deterioration',      timestamp: '14:08', confidence: 72 },
  { id: '3', patientId: 'P005', patientName: 'Michael Chen',   severity: 'warning',  message: 'SpO₂ dropping — consider supplemental oxygen adjustment',           timestamp: '13:55', confidence: 65 },
  { id: '4', patientId: 'P001', patientName: 'John Miller',    severity: 'info',     message: 'Lab results available — Blood Culture pending review',               timestamp: '13:30', confidence: 95 },
];

interface AlertPanelProps {
  onClose: () => void;
}

export function AlertPanel({ onClose }: AlertPanelProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());

  const filtered = mockAlerts.filter(a =>
    !snoozed.has(a.id) && (filter === 'all' || a.severity === filter)
  );

  const counts = {
    critical: mockAlerts.filter(a => a.severity === 'critical').length,
    warning:  mockAlerts.filter(a => a.severity === 'warning').length,
    info:     mockAlerts.filter(a => a.severity === 'info').length,
  };

  const severityMeta = {
    critical: {
      icon: AlertTriangle,
      headerBg: 'bg-red-50 border-red-200',
      border: 'border-l-red-500',
      cardBg: 'bg-red-50 border-red-100',
      labelColor: 'text-red-700 bg-red-100',
      iconColor: 'text-red-600',
      btnColor: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: AlertCircle,
      headerBg: 'bg-amber-50 border-amber-200',
      border: 'border-l-amber-500',
      cardBg: 'bg-amber-50 border-amber-100',
      labelColor: 'text-amber-700 bg-amber-100',
      iconColor: 'text-amber-600',
      btnColor: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    info: {
      icon: Info,
      headerBg: 'bg-blue-50 border-blue-200',
      border: 'border-l-blue-400',
      cardBg: 'bg-blue-50 border-blue-100',
      labelColor: 'text-blue-700 bg-blue-100',
      iconColor: 'text-blue-500',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  };

  return (
    <div className="h-full flex flex-col bg-white">

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-700" />
            <span className="font-semibold text-slate-900 text-sm">Real-Time Alerts</span>
            {counts.critical > 0 && (
              <span className="animate-live-dot h-2 w-2 rounded-full bg-red-500" />
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {([
            { key: 'all',      label: `All (${mockAlerts.length})`, color: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
            { key: 'critical', label: `Critical (${counts.critical})`, color: 'bg-red-100 text-red-700 hover:bg-red-200' },
            { key: 'warning',  label: `Warning (${counts.warning})`,  color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
            { key: 'info',     label: `Info (${counts.info})`,        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                filter === tab.key
                  ? tab.color + ' ring-2 ring-offset-1 ring-current/30'
                  : tab.color.replace('hover:', '') + ' opacity-60 hover:opacity-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2.5">
          {filtered.map((alert, i) => {
            const meta = severityMeta[alert.severity];
            const Icon = meta.icon;
            return (
              <div
                key={alert.id}
                className={`rounded-xl border border-l-4 ${meta.border} ${meta.cardBg} p-3.5 animate-slide-in transition-all hover:shadow-sm`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="flex items-start gap-2.5">
                  <Icon className={`h-4 w-4 flex-shrink-0 mt-0.5 ${meta.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <div>
                        <span className="text-xs font-semibold text-slate-900">{alert.patientName}</span>
                        <span className="text-xs text-slate-400 ml-1.5">{alert.patientId}</span>
                      </div>
                      <span className={`text-xs font-semibold uppercase px-1.5 py-0.5 rounded ${meta.labelColor} flex-shrink-0`}>
                        {alert.severity}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-xs text-slate-700 leading-relaxed mb-2">{alert.message}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {alert.timestamp}
                      </div>
                      <span className="text-xs text-slate-500">
                        Conf: <strong className="text-slate-700">{alert.confidence}%</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 mt-3">
                  <button
                    onClick={() => navigate(`/patient/${alert.patientId}`)}
                    className={`flex-1 flex items-center justify-center gap-1 text-xs font-medium py-1.5 rounded-lg transition-colors ${meta.btnColor}`}
                  >
                    View Patient
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setSnoozed(s => new Set([...s, alert.id]))}
                    className="px-3 text-xs font-medium py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Snooze
                  </button>
                  <button
                    onClick={() => setSnoozed(s => new Set([...s, alert.id]))}
                    className="px-2 text-xs py-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Bell className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No alerts</p>
              <p className="text-xs text-slate-300 mt-1">All patients are stable</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
