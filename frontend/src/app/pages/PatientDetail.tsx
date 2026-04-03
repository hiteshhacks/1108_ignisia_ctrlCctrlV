import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Upload, TrendingUp, TrendingDown, AlertTriangle,
  FileText, Clock, Activity, Droplets, Thermometer, Wind,
  CheckCircle2, Info, Stethoscope, BookOpen, Brain, ShieldAlert,
  ChevronRight, X
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ScrollArea } from '../components/ui/scroll-area';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

// ─── Extract API Types ────────────────────────────────────────────

interface ExtractTest {
  name: string;
  value: string;
  unit: string;
  reference_range: string;
  date: string;
}

interface ExtractData {
  timeline: string[];
  tests: ExtractTest[];
  patient: { name: string; age: string; gender: string };
  lab_name: string;
  doctor_name: string;
}

// ─── Mock Data ────────────────────────────────────────────────────

const vitalSignsData = [
  { time: '00:00', hr: 72,  bp_sys: 120, bp_dia: 80, temp: 36.8, spo2: 98 },
  { time: '02:00', hr: 75,  bp_sys: 118, bp_dia: 78, temp: 36.9, spo2: 98 },
  { time: '04:00', hr: 78,  bp_sys: 115, bp_dia: 76, temp: 37.1, spo2: 97 },
  { time: '06:00', hr: 85,  bp_sys: 110, bp_dia: 72, temp: 37.5, spo2: 96 },
  { time: '08:00', hr: 92,  bp_sys: 105, bp_dia: 68, temp: 37.9, spo2: 95 },
  { time: '10:00', hr: 102, bp_sys: 98,  bp_dia: 62, temp: 38.3, spo2: 94 },
  { time: '12:00', hr: 110, bp_sys: 92,  bp_dia: 58, temp: 38.7, spo2: 92 },
  { time: '14:00', hr: 118, bp_sys: 88,  bp_dia: 54, temp: 38.9, spo2: 91 },
];

const labData = [
  { time: '00:00', lactate: 1.2, creatinine: 0.9, wbc: 8.5  },
  { time: '04:00', lactate: 1.4, creatinine: 1.0, wbc: 9.2  },
  { time: '08:00', lactate: 1.8, creatinine: 1.2, wbc: 11.5 },
  { time: '12:00', lactate: 2.4, creatinine: 1.5, wbc: 14.8 },
  { time: '14:00', lactate: 3.1, creatinine: 1.7, wbc: 16.2 },
];

const timelineEvents = [
  { time: '14:23', type: 'alert',      severity: 'critical', description: 'Sepsis risk elevated to 0.89 — AI recommendation: immediate intervention', confidence: 89 },
  { time: '12:15', type: 'lab',        severity: 'warning',  description: 'Lab results: Lactate 3.1 mmol/L (↑ elevated)', confidence: null },
  { time: '10:30', type: 'vital',      severity: 'warning',  description: 'Blood pressure declining trend detected — 88/54 mmHg', confidence: 72 },
  { time: '08:00', type: 'medication', severity: 'info',     description: 'Vancomycin 1g IV administered', confidence: null },
  { time: '06:45', type: 'alert',      severity: 'warning',  description: 'Temperature rising — monitor for infection source', confidence: 65 },
  { time: '00:00', type: 'admission',  severity: 'info',     description: 'Patient admitted to ICU Ward A, Bed A-101', confidence: null },
];

// ─── Sub-Components ────────────────────────────────────────────────

function TimelineItem({ event }: { event: typeof timelineEvents[0] }) {
  const colorMap = {
    critical: { dot: 'bg-red-500',    bar: 'border-red-200',  bg: 'bg-red-50',    text: 'text-red-700'    },
    warning:  { dot: 'bg-amber-500',  bar: 'border-amber-200',bg: 'bg-amber-50',  text: 'text-amber-700'  },
    info:     { dot: 'bg-blue-400',   bar: 'border-blue-200', bg: 'bg-blue-50',   text: 'text-blue-700'   },
  };
  const c = colorMap[event.severity as keyof typeof colorMap];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`h-2.5 w-2.5 rounded-full mt-1.5 ${c.dot} ring-2 ring-white ring-offset-1`} />
        <div className="w-px flex-1 bg-slate-200 mt-1" />
      </div>
      <div className={`flex-1 ${c.bg} border ${c.bar} rounded-lg p-3 mb-2`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-semibold text-slate-600">{event.time}</span>
            <span className={`text-xs font-medium uppercase px-1.5 py-0.5 rounded ${c.bg} ${c.text} border ${c.bar}`}>
              {event.type}
            </span>
            {event.confidence !== null && (
              <span className="text-xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                Conf: {event.confidence}%
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-700">{event.description}</p>
      </div>
    </div>
  );
}

function CurrentVital({ icon: Icon, label, value, unit, status }: {
  icon: React.ElementType; label: string; value: string; unit: string; status: 'normal' | 'warning' | 'critical';
}) {
  const statusColor = status === 'critical' ? 'text-red-600' : status === 'warning' ? 'text-amber-600' : 'text-slate-900';
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-400" />
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`font-semibold text-sm ${statusColor}`}>{value}</span>
        <span className="text-xs text-slate-400">{unit}</span>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [dragging, setDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading]       = useState(false);
  const [extractData, setExtractData]   = useState<ExtractData | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const uploadToExtract = async (file: File) => {
    setUploading(true);
    setExtractError(null);
    setExtractData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/extract', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.detail || json.message || 'Extraction failed');
      }
      setExtractData(json.data);
      setUploadedFiles(prev => [...prev, file.name]);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadToExtract(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadToExtract(file);
      e.target.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#F7F9FC' }}>

      {/* ── Sticky Patient Header ────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-sm">
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
              <span className="text-lg font-semibold text-slate-900">John Miller</span>
              <Badge className="bg-red-600 text-white text-xs">Critical</Badge>
            </div>
            <p className="text-sm text-slate-500">
              ID: {patientId} &nbsp;·&nbsp; 67 yrs &nbsp;·&nbsp; Bed A-101
              &nbsp;·&nbsp; Ward ICU-A
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <span className="animate-live-dot h-2 w-2 rounded-full bg-red-500" />
              <span className="text-sm font-semibold text-red-700">Risk: 0.89</span>
            </div>
            <p className="text-xs text-slate-400">Updated 2 min ago</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
      </div>

      {/* ── Main Grid: Left 60% + Right 40% ─────────────────── */}
      <div className="flex flex-1 gap-0 overflow-hidden">

        {/* LEFT: Timeline + Charts */}
        <ScrollArea className="flex-[3] border-r border-slate-200">
          <div className="p-6 space-y-5">

            {/* Vital Signs Charts */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Vital Signs — 24h Trend
                </h3>
              </div>
              <div className="p-5">
                <Tabs defaultValue="hr-bp">
                  <TabsList className="mb-4 h-8">
                    <TabsTrigger value="hr-bp"  className="text-xs px-3 h-7">HR & BP</TabsTrigger>
                    <TabsTrigger value="temp"   className="text-xs px-3 h-7">Temp & SpO₂</TabsTrigger>
                  </TabsList>

                  <TabsContent value="hr-bp">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={vitalSignsData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left"  tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line yAxisId="left"  type="monotone" dataKey="hr"     stroke="#ef4444" strokeWidth={2} dot={false} name="Heart Rate (bpm)" />
                        <Line yAxisId="right" type="monotone" dataKey="bp_sys" stroke="#3b82f6" strokeWidth={2} dot={false} name="BP Systolic (mmHg)" />
                        <Line yAxisId="right" type="monotone" dataKey="bp_dia" stroke="#93c5fd" strokeWidth={1.5} dot={false} strokeDasharray="4 4" name="BP Diastolic" />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>

                  <TabsContent value="temp">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart data={vitalSignsData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="left"  domain={[36, 40]} tick={{ fontSize: 11 }} />
                        <YAxis yAxisId="right" orientation="right" domain={[85, 100]} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line yAxisId="left"  type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={false} name="Temperature (°C)" />
                        <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#10b981" strokeWidth={2} dot={false} name="SpO₂ (%)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Lab Results */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-600" />
                  Laboratory Results
                </h3>
              </div>
              <div className="p-5">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={labData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="lactate"    x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#dc2626" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="creatinine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="wbc"        x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#059669" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left"  tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area yAxisId="left"  type="monotone" dataKey="lactate"    stroke="#dc2626" fill="url(#lactate)"    strokeWidth={2} name="Lactate (mmol/L)" />
                    <Area yAxisId="left"  type="monotone" dataKey="creatinine" stroke="#7c3aed" fill="url(#creatinine)" strokeWidth={2} name="Creatinine (mg/dL)" />
                    <Area yAxisId="right" type="monotone" dataKey="wbc"        stroke="#059669" fill="url(#wbc)"        strokeWidth={2} name="WBC (×10⁹/L)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Clinical Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  Clinical Timeline
                </h3>
              </div>
              <div className="p-5">
                <div className="space-y-0">
                  {timelineEvents.map((event, i) => (
                    <TimelineItem key={i} event={event} />
                  ))}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <Upload className="h-4 w-4 text-blue-600" />
                  Upload Clinical Files
                </h3>
              </div>
              <div className="p-5">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-8 text-center transition-all
                    ${uploading ? 'cursor-wait opacity-60' : 'cursor-pointer'}
                    ${dragging
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                  `}
                >
                  {uploading ? (
                    <>
                      <div className="h-8 w-8 mx-auto mb-3 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                      <p className="text-sm font-medium text-blue-600">Extracting data from image…</p>
                      <p className="text-xs text-slate-400 mt-0.5">This may take a few seconds</p>
                    </>
                  ) : (
                    <>
                      <Upload className={`h-8 w-8 mx-auto mb-3 ${dragging ? 'text-blue-500' : 'text-slate-300'}`} />
                      <p className="text-sm font-medium text-slate-700 mb-1">
                        {dragging ? 'Drop image here' : 'Drag & drop a lab report image, or click to browse'}
                      </p>
                      <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP · Max 20 MB</p>
                    </>
                  )}
                </div>

                {extractError && (
                  <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-red-700">{extractError}</p>
                  </div>
                )}

                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-1.5">
                    {uploadedFiles.map((name, i) => (
                      <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-xs text-slate-700">{name}</span>
                        </div>
                        <button onClick={() => setUploadedFiles(f => f.filter((_, j) => j !== i))}>
                          <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── Extracted Results ───────────────────────── */}
                {extractData && (
                  <div className="mt-4 border border-emerald-200 rounded-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-800">Extraction Successful</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 mt-2">
                        <p className="text-xs text-slate-600"><span className="font-medium">Patient:</span> {extractData.patient.name || '—'}</p>
                        <p className="text-xs text-slate-600"><span className="font-medium">Age:</span> {extractData.patient.age || '—'}</p>
                        <p className="text-xs text-slate-600"><span className="font-medium">Gender:</span> {extractData.patient.gender || '—'}</p>
                        <p className="text-xs text-slate-600"><span className="font-medium">Date:</span> {extractData.timeline[0] || '—'}</p>
                        <p className="text-xs text-slate-600 col-span-2"><span className="font-medium">Lab:</span> {extractData.lab_name || '—'}</p>
                        <p className="text-xs text-slate-600 col-span-2"><span className="font-medium">Doctor:</span> {extractData.doctor_name || '—'}</p>
                      </div>
                    </div>

                    {/* Tests table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="text-left px-3 py-2 font-semibold text-slate-600 w-1/2">Test</th>
                            <th className="text-right px-3 py-2 font-semibold text-slate-600">Value</th>
                            <th className="text-right px-3 py-2 font-semibold text-slate-600">Unit</th>
                            <th className="text-right px-3 py-2 font-semibold text-slate-600">Reference</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractData.tests.map((test, i) => (
                            <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                              <td className="px-3 py-2 text-slate-700 leading-snug">{test.name}</td>
                              <td className="px-3 py-2 text-right font-semibold text-slate-900">
                                {test.value || <span className="text-slate-400 font-normal">—</span>}
                              </td>
                              <td className="px-3 py-2 text-right text-slate-500">{test.unit}</td>
                              <td className="px-3 py-2 text-right text-slate-400">{test.reference_range}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* RIGHT: AI Risk Panel */}
        <ScrollArea className="flex-[2]">
          <div className="p-5 space-y-4">

            {/* Risk Score Card */}
            <div className="bg-red-600 rounded-xl p-5 text-white shadow-md animate-critical-glow">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="h-5 w-5 text-red-200" />
                <span className="font-semibold text-sm">AI Sepsis Risk Assessment</span>
              </div>

              <div className="flex items-end justify-between mb-3">
                <div>
                  <div className="text-5xl font-bold">0.89</div>
                  <div className="text-red-200 text-sm mt-0.5">± 0.12 confidence interval</div>
                </div>
                <div className="text-right">
                  <div className="text-red-100 text-xs mb-1">Risk Level</div>
                  <div className="bg-white/20 text-white font-semibold text-sm px-3 py-1 rounded-lg">CRITICAL</div>
                </div>
              </div>

              <Progress value={89} className="h-2 mb-4 bg-red-500" />

              {/* Confidence metrics */}
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: 'Temporal', value: '95%' },
                  { label: 'Data Quality', value: '92%' },
                  { label: 'Certainty', value: '89%' },
                ].map(m => (
                  <div key={m.label} className="bg-red-700/40 rounded-lg p-2 text-center">
                    <div className="text-white font-bold text-sm">{m.value}</div>
                    <div className="text-red-200 text-xs">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Completeness */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Data Completeness
              </h4>
              {[
                { label: 'Vital Signs',   pct: 100 },
                { label: 'Lab Results',   pct: 85  },
                { label: 'Medication Hx',pct: 100 },
                { label: 'Imaging',       pct: 60  },
              ].map(d => (
                <div key={d.label} className="mb-2.5">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{d.label}</span>
                    <span className="font-medium text-slate-700">{d.pct}%</span>
                  </div>
                  <Progress value={d.pct} className="h-1.5" />
                </div>
              ))}
            </div>

            {/* Top Contributing Signals */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Top Contributing Signals
              </h4>
              <div className="space-y-2">
                {[
                  { signal: '↑ Lactate',      value: '3.1 mmol/L', weight: 0.28, color: 'text-red-600'   },
                  { signal: '↓ BP',           value: '88/54 mmHg', weight: 0.24, color: 'text-red-600'   },
                  { signal: '↑ Heart Rate',   value: '118 bpm',    weight: 0.19, color: 'text-amber-600' },
                  { signal: '↑ Temperature',  value: '38.9°C',     weight: 0.16, color: 'text-amber-600' },
                  { signal: '↑ WBC',          value: '16.2 ×10⁹', weight: 0.13, color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.signal} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className={`h-3.5 w-3.5 ${s.color}`} />
                      <div>
                        <span className={`text-xs font-semibold ${s.color}`}>{s.signal}</span>
                        <span className="text-xs text-slate-500 ml-1.5">{s.value}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                      +{Math.round(s.weight * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Explanation */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-blue-500" />
                Clinical Reasoning
              </h4>
              <div className="space-y-2">
                {[
                  'Lactate ≥ 2 mmol/L meets Sepsis-3 organ dysfunction criterion',
                  'Hypotension unresponsive to fluid challenge suggests septic shock',
                  'Tachycardia with rising temperature indicates systemic inflammatory response',
                  'WBC elevation consistent with infectious process',
                ].map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-700 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI Clinical Summary
              </h4>
              <p className="text-xs text-blue-800 leading-relaxed">
                Patient P001, a 67-year-old male admitted to ICU-A, is showing a rapidly
                deteriorating clinical picture consistent with early septic shock. Over the past
                14 hours, lactate has risen from 1.2 to 3.1 mmol/L, blood pressure has declined
                to 88/54 mmHg, and heart rate has escalated to 118 bpm alongside a fever of 38.9°C.
                WBC elevation (16.2 ×10⁹/L) suggests an active infectious process. Immediate
                physician review and adherence to the Surviving Sepsis Campaign 1-hour bundle
                is strongly recommended.
              </p>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl border border-red-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                AI Recommendations
              </h4>
              <ol className="space-y-2">
                {[
                  'Immediate physician notification — do not delay',
                  'Initiate fluid resuscitation (30 mL/kg crystalloid IV)',
                  'Verify and broaden antibiotic coverage',
                  'Repeat lactate in 2 hours — target clearance >10%',
                ].map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-xs font-bold text-red-600 flex-shrink-0 w-4">{i + 1}.</span>
                    <p className="text-xs text-slate-700">{rec}</p>
                  </li>
                ))}
              </ol>
            </div>

            {/* Guideline Reference */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-slate-400" />
                Guideline Reference
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-800">Surviving Sepsis Campaign 2021:</strong> Early
                recognition and intervention within 1 hour of sepsis identification significantly
                improves patient outcomes. Lactate &gt; 2 mmol/L with organ dysfunction meets
                Sepsis-3 diagnostic criteria.
              </p>
            </div>

            {/* Current Vitals */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Current Vitals</h4>
              <CurrentVital icon={Activity}    label="Heart Rate"      value="118"    unit="bpm"   status="critical" />
              <CurrentVital icon={TrendingDown} label="Blood Pressure"  value="88/54"  unit="mmHg"  status="critical" />
              <CurrentVital icon={Thermometer} label="Temperature"     value="38.9"   unit="°C"    status="warning"  />
              <CurrentVital icon={Wind}        label="SpO₂"            value="91"     unit="%"     status="critical" />
              <CurrentVital icon={Activity}    label="Respiratory Rate" value="24"    unit="/min"  status="warning"  />
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400" />
                Recent Reports
              </h4>
              <div className="space-y-1.5">
                {[
                  { name: 'Blood Culture Results', ago: '2 hours ago', icon: CheckCircle2, color: 'text-emerald-500' },
                  { name: 'Chest X-Ray',           ago: '8 hours ago', icon: FileText,     color: 'text-blue-400'    },
                  { name: 'Complete Blood Count',  ago: '12 hours ago',icon: FileText,     color: 'text-blue-400'    },
                ].map(r => (
                  <button
                    key={r.name}
                    className="w-full flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-2.5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2">
                      <r.icon className={`h-3.5 w-3.5 ${r.color}`} />
                      <div>
                        <p className="text-xs font-medium text-slate-800">{r.name}</p>
                        <p className="text-xs text-slate-400">{r.ago}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
