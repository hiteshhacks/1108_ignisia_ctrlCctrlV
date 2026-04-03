import { useNavigate } from 'react-router';
import {
  ArrowLeft, Clock, AlertTriangle, AlertCircle, CheckCircle2,
  TrendingUp, TrendingDown, Minus, ClipboardList, FileText,
  User, RefreshCw, ChevronRight
} from 'lucide-react';

interface PatientSummary {
  id: string;
  age: number;
  bed: string;
  riskLevel: 'critical' | 'warning' | 'stable';
  riskScore: number;
  keyChange: string;
  changeDir: 'worse' | 'better' | 'stable';
  pendingActions: string[];
}

const patients: PatientSummary[] = [
  {
    id: 'P001', age: 67, bed: 'A-101', riskLevel: 'critical', riskScore: 0.89,
    keyChange: 'Lactate rose from 1.2 → 3.1 mmol/L. BP declining. Sepsis protocol initiated.',
    changeDir: 'worse',
    pendingActions: ['Repeat lactate in 2h', 'Verify antibiotic coverage', 'Nephrology consult'],
  },
  {
    id: 'P002', age: 54, bed: 'A-102', riskLevel: 'stable', riskScore: 0.23,
    keyChange: 'Vitals stable throughout shift. No significant changes.',
    changeDir: 'stable',
    pendingActions: [],
  },
  {
    id: 'P003', age: 71, bed: 'A-103', riskLevel: 'warning', riskScore: 0.64,
    keyChange: 'BP trending down from 110/72 → 95/62. Fever noted at 14:00.',
    changeDir: 'worse',
    pendingActions: ['Blood cultures pending', 'Consider fluid challenge'],
  },
  {
    id: 'P004', age: 59, bed: 'A-104', riskLevel: 'stable', riskScore: 0.18,
    keyChange: 'Stable. Weaning from supplemental O₂ progressing well.',
    changeDir: 'better',
    pendingActions: [],
  },
  {
    id: 'P005', age: 63, bed: 'A-105', riskLevel: 'warning', riskScore: 0.58,
    keyChange: 'SpO₂ dropped from 98% → 95%. O₂ support increased to 4L/min.',
    changeDir: 'worse',
    pendingActions: ['Chest X-ray review due', 'Monitor SpO₂ closely'],
  },
  {
    id: 'P006', age: 48, bed: 'A-106', riskLevel: 'stable', riskScore: 0.15,
    keyChange: 'No changes. Planned for step-down to HDU tomorrow.',
    changeDir: 'better',
    pendingActions: ['HDU transfer paperwork'],
  },
];

function RiskBadge({ level, score }: { level: string; score: number }) {
  const map = {
    critical: 'bg-red-600 text-white',
    warning:  'bg-amber-500 text-white',
    stable:   'bg-emerald-600 text-white',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${map[level as keyof typeof map]}`}>
      {score.toFixed(2)}
    </span>
  );
}

function ChangeIcon({ dir }: { dir: 'worse' | 'better' | 'stable' }) {
  if (dir === 'worse')  return <TrendingDown className="h-4 w-4 text-red-500"     />;
  if (dir === 'better') return <TrendingUp   className="h-4 w-4 text-emerald-500" />;
  return                       <Minus        className="h-4 w-4 text-slate-400"   />;
}

export function HandoverPage() {
  const navigate = useNavigate();

  const criticalCount = patients.filter(p => p.riskLevel === 'critical').length;
  const warningCount  = patients.filter(p => p.riskLevel === 'warning').length;
  const stableCount   = patients.filter(p => p.riskLevel === 'stable').length;
  const pendingTotal  = patients.reduce((s, p) => s + p.pendingActions.length, 0);

  return (
    <div className="min-h-full" style={{ backgroundColor: '#F7F9FC' }}>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors py-1.5 px-2 rounded-lg hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Ward
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Shift Handover</h2>
            </div>
            <p className="text-sm text-slate-500">
              ICU Ward A &nbsp;·&nbsp; Summary for last 12 hours &nbsp;·&nbsp; 02:00 – 14:00
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5" />
            Generated: 14:30
          </div>
          <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5 max-w-6xl mx-auto">

        {/* ── Summary Stats ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Patients', value: patients.length, color: 'text-slate-900', bg: 'bg-white',       border: 'border-slate-200' },
            { label: 'Critical',       value: criticalCount,   color: 'text-red-700',   bg: 'bg-red-50',      border: 'border-red-200'   },
            { label: 'Warning',        value: warningCount,    color: 'text-amber-700', bg: 'bg-amber-50',    border: 'border-amber-200' },
            { label: 'Pending Actions',value: pendingTotal,    color: 'text-blue-700',  bg: 'bg-blue-50',     border: 'border-blue-200'  },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-5 py-4 shadow-sm`}>
              <p className="text-xs text-slate-500 mb-1">{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Incoming Nurse Note ───────────────────────────────── */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Outgoing: Dr. Sarah Johnson (ICU-A)</span>
          </div>
          <p className="text-sm text-blue-800 leading-relaxed">
            Attention incoming shift: P001 is the primary concern — sepsis protocol is active, please
            ensure lactate is repeated by 16:30. P003 and P005 are both worsening; close monitoring
            required. All other patients are stable. Lab results for P001 blood cultures are still
            pending from 08:00 collection.
          </p>
        </div>

        {/* ── Patient Table ─────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 pt-4 pb-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Patient Status Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Key changes and outstanding actions for each patient</p>
          </div>

          <div className="divide-y divide-slate-100">
            {patients.map(patient => {
              const riskColors = {
                critical: { row: 'bg-red-50/40', badge: 'bg-red-600' },
                warning:  { row: 'bg-amber-50/30', badge: 'bg-amber-500' },
                stable:   { row: '',               badge: 'bg-emerald-600' },
              }[patient.riskLevel];

              return (
                <div key={patient.id} className={`px-5 py-4 ${riskColors.row}`}>
                  <div className="flex items-start justify-between gap-4">

                    {/* Patient identity */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="flex flex-col items-center gap-1 flex-shrink-0">
                        <span className="text-sm font-semibold text-slate-900">{patient.id}</span>
                        <span className="text-xs text-slate-400">Bed {patient.bed}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Status row */}
                        <div className="flex items-center gap-2 mb-1.5">
                          <RiskBadge level={patient.riskLevel} score={patient.riskScore} />
                          <ChangeIcon dir={patient.changeDir} />
                          <span className="text-xs text-slate-500 capitalize">
                            {patient.changeDir === 'worse' ? 'Deteriorating' : patient.changeDir === 'better' ? 'Improving' : 'Stable'}
                          </span>
                        </div>

                        {/* Key change */}
                        <p className="text-xs text-slate-700 mb-2 leading-relaxed">{patient.keyChange}</p>

                        {/* Pending actions */}
                        {patient.pendingActions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {patient.pendingActions.map(action => (
                              <span key={action} className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded-full">
                                {action}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            No pending actions
                          </div>
                        )}
                      </div>
                    </div>

                    {/* View button */}
                    <button
                      onClick={() => navigate(`/patient/${patient.id}`)}
                      className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-800 flex-shrink-0 mt-1"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Missing Data Alerts ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            Missing / Overdue Data
          </h3>
          <div className="space-y-2">
            {[
              { patient: 'P001', issue: 'Blood culture results pending — drawn at 08:00 (6h overdue)', severity: 'critical' },
              { patient: 'P003', issue: 'Chest X-ray not yet reviewed by attending',                   severity: 'warning'  },
              { patient: 'P005', issue: 'Imaging section incomplete — no recent chest imaging',         severity: 'warning'  },
            ].map(item => (
              <div key={item.patient + item.issue}
                className={`flex items-start gap-2.5 p-3 rounded-lg border ${
                  item.severity === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                {item.severity === 'critical'
                  ? <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                  : <AlertCircle   className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                <div>
                  <span className="text-xs font-semibold text-slate-900 mr-1.5">{item.patient}</span>
                  <span className="text-xs text-slate-700">{item.issue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Print / Export ────────────────────────────────────── */}
        <div className="flex justify-end gap-2 pb-6">
          <button className="flex items-center gap-2 text-sm text-slate-600 border border-slate-200 bg-white px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors">
            <FileText className="h-4 w-4" />
            Export PDF
          </button>
          <button className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
            <CheckCircle2 className="h-4 w-4" />
            Confirm Handover
          </button>
        </div>
      </div>
    </div>
  );
}
