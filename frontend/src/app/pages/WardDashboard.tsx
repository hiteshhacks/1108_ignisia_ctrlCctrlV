import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  TrendingUp, TrendingDown, Minus, AlertTriangle, AlertCircle,
  Bell, Clock, Users, ChevronRight, RefreshCw, X
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface Patient {
  id: string;
  age: number;
  bedNumber: string;
  riskLevel: 'critical' | 'warning' | 'stable';
  riskScore: number;
  vitals: {
    hr:   { value: number; trend: 'up' | 'down' | 'stable' };
    bp:   { value: string; trend: 'up' | 'down' | 'stable' };
    spo2: { value: number; trend: 'up' | 'down' | 'stable' };
  };
  lastUpdated: string;
  alerts: number;
  image: string;
  ward: string;
}

const ICU_WARDS = [
  { id: 'MICU', label: 'MICU', fullName: 'Medical ICU' },
  { id: 'SICU', label: 'SICU', fullName: 'Surgical ICU' },
  { id: 'CICU', label: 'CICU', fullName: 'Cardiac ICU' },
  { id: 'NICU', label: 'NICU', fullName: 'Neonatal ICU' },
  { id: 'PICU', label: 'PICU', fullName: 'Pediatric ICU' },
];

const mockPatients: Patient[] = [
  // MICU
  {
    id: 'P001', age: 67, bedNumber: 'M-101', riskLevel: 'critical', riskScore: 0.89,
    vitals: {
      hr:   { value: 118, trend: 'up' },
      bp:   { value: '88/54', trend: 'down' },
      spo2: { value: 91, trend: 'down' },
    },
    lastUpdated: '2 min ago', alerts: 2,
    image: 'https://i.pravatar.cc/40?img=11',
    ward: 'MICU',
  },
  {
    id: 'P002', age: 54, bedNumber: 'M-102', riskLevel: 'stable', riskScore: 0.23,
    vitals: {
      hr:   { value: 78, trend: 'stable' },
      bp:   { value: '120/80', trend: 'stable' },
      spo2: { value: 98, trend: 'stable' },
    },
    lastUpdated: '5 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=22',
    ward: 'MICU',
  },
  {
    id: 'P003', age: 71, bedNumber: 'M-103', riskLevel: 'warning', riskScore: 0.64,
    vitals: {
      hr:   { value: 102, trend: 'up' },
      bp:   { value: '95/62', trend: 'down' },
      spo2: { value: 94, trend: 'stable' },
    },
    lastUpdated: '3 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=33',
    ward: 'MICU',
  },
  {
    id: 'P004', age: 59, bedNumber: 'M-104', riskLevel: 'stable', riskScore: 0.18,
    vitals: {
      hr:   { value: 72, trend: 'stable' },
      bp:   { value: '118/76', trend: 'stable' },
      spo2: { value: 99, trend: 'stable' },
    },
    lastUpdated: '4 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=44',
    ward: 'MICU',
  },
  {
    id: 'P005', age: 63, bedNumber: 'M-105', riskLevel: 'warning', riskScore: 0.58,
    vitals: {
      hr:   { value: 95, trend: 'up' },
      bp:   { value: '100/68', trend: 'stable' },
      spo2: { value: 95, trend: 'down' },
    },
    lastUpdated: '6 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=55',
    ward: 'MICU',
  },
  {
    id: 'P006', age: 48, bedNumber: 'M-106', riskLevel: 'stable', riskScore: 0.15,
    vitals: {
      hr:   { value: 68, trend: 'stable' },
      bp:   { value: '115/75', trend: 'stable' },
      spo2: { value: 99, trend: 'stable' },
    },
    lastUpdated: '7 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=66',
    ward: 'MICU',
  },
  // SICU
  {
    id: 'P007', age: 45, bedNumber: 'S-101', riskLevel: 'critical', riskScore: 0.82,
    vitals: {
      hr:   { value: 112, trend: 'up' },
      bp:   { value: '90/58', trend: 'down' },
      spo2: { value: 92, trend: 'down' },
    },
    lastUpdated: '1 min ago', alerts: 2,
    image: 'https://i.pravatar.cc/40?img=1',
    ward: 'SICU',
  },
  {
    id: 'P008', age: 38, bedNumber: 'S-102', riskLevel: 'warning', riskScore: 0.61,
    vitals: {
      hr:   { value: 98, trend: 'up' },
      bp:   { value: '98/65', trend: 'down' },
      spo2: { value: 95, trend: 'stable' },
    },
    lastUpdated: '4 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=2',
    ward: 'SICU',
  },
  {
    id: 'P009', age: 52, bedNumber: 'S-103', riskLevel: 'stable', riskScore: 0.21,
    vitals: {
      hr:   { value: 76, trend: 'stable' },
      bp:   { value: '122/82', trend: 'stable' },
      spo2: { value: 98, trend: 'stable' },
    },
    lastUpdated: '6 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=3',
    ward: 'SICU',
  },
  {
    id: 'P010', age: 61, bedNumber: 'S-104', riskLevel: 'stable', riskScore: 0.17,
    vitals: {
      hr:   { value: 70, trend: 'stable' },
      bp:   { value: '116/74', trend: 'stable' },
      spo2: { value: 99, trend: 'stable' },
    },
    lastUpdated: '9 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=4',
    ward: 'SICU',
  },
  // CICU
  {
    id: 'P011', age: 74, bedNumber: 'C-101', riskLevel: 'critical', riskScore: 0.91,
    vitals: {
      hr:   { value: 125, trend: 'up' },
      bp:   { value: '85/52', trend: 'down' },
      spo2: { value: 90, trend: 'down' },
    },
    lastUpdated: '1 min ago', alerts: 3,
    image: 'https://i.pravatar.cc/40?img=5',
    ward: 'CICU',
  },
  {
    id: 'P012', age: 66, bedNumber: 'C-102', riskLevel: 'warning', riskScore: 0.67,
    vitals: {
      hr:   { value: 105, trend: 'up' },
      bp:   { value: '96/63', trend: 'down' },
      spo2: { value: 93, trend: 'stable' },
    },
    lastUpdated: '3 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=6',
    ward: 'CICU',
  },
  {
    id: 'P013', age: 58, bedNumber: 'C-103', riskLevel: 'stable', riskScore: 0.27,
    vitals: {
      hr:   { value: 80, trend: 'stable' },
      bp:   { value: '119/78', trend: 'stable' },
      spo2: { value: 97, trend: 'stable' },
    },
    lastUpdated: '8 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=7',
    ward: 'CICU',
  },
  {
    id: 'P014', age: 70, bedNumber: 'C-104', riskLevel: 'warning', riskScore: 0.55,
    vitals: {
      hr:   { value: 93, trend: 'up' },
      bp:   { value: '102/67', trend: 'stable' },
      spo2: { value: 94, trend: 'down' },
    },
    lastUpdated: '5 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=8',
    ward: 'CICU',
  },
  // NICU
  {
    id: 'P015', age: 0, bedNumber: 'N-101', riskLevel: 'critical', riskScore: 0.85,
    vitals: {
      hr:   { value: 185, trend: 'up' },
      bp:   { value: '55/35', trend: 'down' },
      spo2: { value: 89, trend: 'down' },
    },
    lastUpdated: '1 min ago', alerts: 2,
    image: 'https://i.pravatar.cc/40?img=9',
    ward: 'NICU',
  },
  {
    id: 'P016', age: 0, bedNumber: 'N-102', riskLevel: 'warning', riskScore: 0.59,
    vitals: {
      hr:   { value: 168, trend: 'up' },
      bp:   { value: '52/32', trend: 'stable' },
      spo2: { value: 93, trend: 'stable' },
    },
    lastUpdated: '4 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=10',
    ward: 'NICU',
  },
  {
    id: 'P017', age: 0, bedNumber: 'N-103', riskLevel: 'stable', riskScore: 0.20,
    vitals: {
      hr:   { value: 145, trend: 'stable' },
      bp:   { value: '58/38', trend: 'stable' },
      spo2: { value: 97, trend: 'stable' },
    },
    lastUpdated: '6 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=12',
    ward: 'NICU',
  },
  // PICU
  {
    id: 'P018', age: 6, bedNumber: 'PI-101', riskLevel: 'critical', riskScore: 0.80,
    vitals: {
      hr:   { value: 145, trend: 'up' },
      bp:   { value: '78/50', trend: 'down' },
      spo2: { value: 91, trend: 'down' },
    },
    lastUpdated: '2 min ago', alerts: 2,
    image: 'https://i.pravatar.cc/40?img=13',
    ward: 'PICU',
  },
  {
    id: 'P019', age: 9, bedNumber: 'PI-102', riskLevel: 'warning', riskScore: 0.62,
    vitals: {
      hr:   { value: 128, trend: 'up' },
      bp:   { value: '85/55', trend: 'down' },
      spo2: { value: 93, trend: 'stable' },
    },
    lastUpdated: '5 min ago', alerts: 1,
    image: 'https://i.pravatar.cc/40?img=14',
    ward: 'PICU',
  },
  {
    id: 'P020', age: 4, bedNumber: 'PI-103', riskLevel: 'stable', riskScore: 0.19,
    vitals: {
      hr:   { value: 110, trend: 'stable' },
      bp:   { value: '90/60', trend: 'stable' },
      spo2: { value: 98, trend: 'stable' },
    },
    lastUpdated: '7 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=15',
    ward: 'PICU',
  },
  {
    id: 'P021', age: 12, bedNumber: 'PI-104', riskLevel: 'stable', riskScore: 0.14,
    vitals: {
      hr:   { value: 92, trend: 'stable' },
      bp:   { value: '100/65', trend: 'stable' },
      spo2: { value: 99, trend: 'stable' },
    },
    lastUpdated: '10 min ago', alerts: 0,
    image: 'https://i.pravatar.cc/40?img=16',
    ward: 'PICU',
  },
];

interface PanelAlert {
  id: string;
  patientId: string;
  severity: 'critical' | 'warning';
  message: string;
  confidence: number;
  timestamp: string;
}

const panelAlerts: PanelAlert[] = [
  { id: '1', patientId: 'P001', severity: 'critical', message: 'Possible Sepsis Detected — Lactate ↑ 3.1', confidence: 89, timestamp: '14:23' },
  { id: '2', patientId: 'P003', severity: 'warning',  message: 'BP declining trend — monitor closely',     confidence: 72, timestamp: '14:15' },
  { id: '3', patientId: 'P005', severity: 'warning',  message: 'SpO₂ dropping — review O₂ support',       confidence: 65, timestamp: '14:08' },
  { id: '4', patientId: 'P001', severity: 'critical', message: 'HR tachycardia persisting > 20 min',       confidence: 91, timestamp: '13:58' },
];

// ─── Helpers ───────────────────────────────────────────────────────

function getRiskMeta(level: string) {
  switch (level) {
    case 'critical': return { label: 'Critical', textColor: 'text-red-700',    bg: 'bg-red-50',     border: 'border-red-300',    badge: 'bg-red-600',     glow: 'animate-critical-glow' };
    case 'warning':  return { label: 'Warning',  textColor: 'text-amber-700',  bg: 'bg-amber-50',   border: 'border-amber-300',  badge: 'bg-amber-500',   glow: 'animate-warning-glow'  };
    default:         return { label: 'Stable',   textColor: 'text-emerald-700',bg: 'bg-emerald-50', border: 'border-emerald-200',badge: 'bg-emerald-600', glow: '' };
  }
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up')     return <TrendingUp   className="h-3.5 w-3.5 text-red-500"     />;
  if (trend === 'down')   return <TrendingDown className="h-3.5 w-3.5 text-red-500"     />;
  return                         <Minus        className="h-3.5 w-3.5 text-emerald-500" />;
}

function VitalChip({ label, value, unit, trend }: { label: string; value: string | number; unit: string; trend: 'up' | 'down' | 'stable' }) {
  return (
    <div className="bg-white border border-slate-100 rounded-lg px-3 py-2">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs text-slate-500">{label}</span>
        <TrendIcon trend={trend} />
      </div>
      <div className="flex items-baseline gap-0.5">
        <span className="text-base font-semibold text-slate-900">{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

// ─── Component ─────────────────────────────────────────────────────

export function WardDashboard() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [activeWard, setActiveWard] = useState('MICU');

  const wardPatients = mockPatients.filter(p => p.ward === activeWard);
  const criticalCount = wardPatients.filter(p => p.riskLevel === 'critical').length;
  const warningCount  = wardPatients.filter(p => p.riskLevel === 'warning').length;
  const stableCount   = wardPatients.filter(p => p.riskLevel === 'stable').length;
  const visibleAlerts = panelAlerts.filter(a => !dismissed.has(a.id));
  const activeWardInfo = ICU_WARDS.find(w => w.id === activeWard)!;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>
      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-6 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">{activeWardInfo.fullName} — Patient Overview</h2>
          </div>
          <p className="text-sm text-slate-500">Real-time AI risk monitoring · {wardPatients.length} patients</p>
        </div>
        <button className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors py-1.5 px-3 rounded-lg hover:bg-white border border-transparent hover:border-slate-200">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Ward Tabs ────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 px-6 pb-4">
        {ICU_WARDS.map(ward => (
          <button
            key={ward.id}
            onClick={() => setActiveWard(ward.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all border
              ${activeWard === ward.id
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}
            `}
          >
            {ward.label}
            <span className={`ml-1.5 text-xs ${activeWard === ward.id ? 'text-blue-200' : 'text-slate-400'}`}>
              {ward.fullName.replace(' ICU', '')}
            </span>
          </button>
        ))}
      </div>

      {/* ── Summary Stats ────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 px-6 pb-5">
        {[
          { label: 'Total Patients', value: wardPatients.length, color: 'text-slate-900',   bg: 'bg-white',       border: 'border-slate-200' },
          { label: 'Critical',       value: criticalCount,       color: 'text-red-700',     bg: 'bg-red-50',      border: 'border-red-200'   },
          { label: 'Warning',        value: warningCount,        color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200' },
          { label: 'Stable',         value: stableCount,         color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200'},
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl px-5 py-4 shadow-sm`}>
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Main Content: Grid + Alert Panel ─────────────────── */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* Patient Grid */}
        <ScrollArea className="flex-1 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {wardPatients.map((patient, i) => {
              const meta = getRiskMeta(patient.riskLevel);
              return (
                <div
                  key={patient.id}
                  onClick={() => navigate(`/patient/${patient.id}`)}
                  className={`
                    bg-white border-2 ${meta.border} rounded-xl cursor-pointer
                    transition-all hover:shadow-md hover:-translate-y-0.5
                    ${meta.glow} animate-fade-up
                  `}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Card header */}
                  <div className={`${meta.bg} px-4 py-3 rounded-t-xl border-b ${meta.border} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <ImageWithFallback
                        src={patient.image}
                        alt={patient.id}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 text-sm">{patient.id}</span>
                          <span className="text-xs text-slate-500">· Bed {patient.bedNumber}</span>
                        </div>
                        <span className="text-xs text-slate-500">{patient.age === 0 ? 'Neonate' : `${patient.age} yrs`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {patient.alerts > 0 && (
                        <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          {patient.alerts}
                        </span>
                      )}
                      <Badge className={`${meta.badge} text-white text-xs px-2.5`}>
                        {meta.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Risk score */}
                  <div className="px-4 pt-3 pb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-500">Sepsis Risk Score</span>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-xl font-bold ${meta.textColor}`}>
                          {patient.riskScore.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">/ 1.0</span>
                      </div>
                    </div>
                    <Progress
                      value={patient.riskScore * 100}
                      className="h-1.5"
                      style={{
                        '--progress-color':
                          patient.riskLevel === 'critical' ? '#DC2626' :
                          patient.riskLevel === 'warning'  ? '#D97706' : '#059669',
                      } as React.CSSProperties}
                    />
                  </div>

                  {/* Vitals */}
                  <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                    <VitalChip label="HR"   value={patient.vitals.hr.value}   unit="bpm" trend={patient.vitals.hr.trend}   />
                    <VitalChip label="BP"   value={patient.vitals.bp.value}   unit=""    trend={patient.vitals.bp.trend}   />
                    <VitalChip label="SpO₂" value={patient.vitals.spo2.value} unit="%"   trend={patient.vitals.spo2.trend} />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      Updated {patient.lastUpdated}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      View details
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* ── Right: Real-Time Alert Panel ─────────────────── */}
        <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white flex flex-col">
          {/* Panel header */}
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-slate-700" />
                <span className="font-semibold text-slate-900 text-sm">Live Alerts</span>
                {visibleAlerts.filter(a => a.severity === 'critical').length > 0 && (
                  <span className="animate-live-dot h-2 w-2 rounded-full bg-red-500" />
                )}
              </div>
              <span className="text-xs text-slate-400">{visibleAlerts.length} active</span>
            </div>
            <div className="flex gap-1.5">
              <span className="text-xs bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                Critical ({panelAlerts.filter(a => a.severity === 'critical').length})
              </span>
              <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">
                Warning ({panelAlerts.filter(a => a.severity === 'warning').length})
              </span>
            </div>
          </div>

          {/* Alert list */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {visibleAlerts.map((alert, i) => (
                <div
                  key={alert.id}
                  className={`
                    rounded-xl border-l-4 p-3 animate-slide-in transition-all
                    ${alert.severity === 'critical'
                      ? 'bg-red-50 border-red-500 border border-red-100'
                      : 'bg-amber-50 border-amber-500 border border-amber-100'}
                  `}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {alert.severity === 'critical'
                        ? <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                        : <AlertCircle   className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-xs font-semibold uppercase tracking-wide ${
                            alert.severity === 'critical' ? 'text-red-700' : 'text-amber-700'
                          }`}>{alert.severity}</span>
                          <span className="text-xs text-slate-400">· {alert.patientId}</span>
                        </div>
                        <p className="text-xs text-slate-700 leading-snug">{alert.message}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-slate-400">{alert.timestamp}</span>
                          <span className="text-xs text-slate-500">Conf: <strong>{alert.confidence}%</strong></span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDismissed(d => new Set([...d, alert.id])); }}
                      className="text-slate-300 hover:text-slate-500 flex-shrink-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => navigate(`/patient/${alert.patientId}`)}
                    className={`mt-2 w-full text-xs font-medium py-1.5 rounded-lg transition-colors ${
                      alert.severity === 'critical'
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    View Details
                  </button>
                </div>
              ))}

              {visibleAlerts.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active alerts</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
