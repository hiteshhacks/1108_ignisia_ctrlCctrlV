'use client';

import { Copy, Check, User, FlaskConical, Building2, Stethoscope, Calendar } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DataDisplayProps {
  data: any;
  title?: string;
}

export function DataDisplay({ data, title = 'Extracted Data' }: DataDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract the inner data object (from API response shape)  
  const inner = data?.data || data;
  const patient = inner?.patient;
  const tests = inner?.tests;
  const timeline = inner?.timeline;
  const labName = inner?.lab_name;
  const doctorName = inner?.doctor_name;
  const isMedicalData = patient && tests;

  return (
    <div className="space-y-4">
      {/* Copy Button Card */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="flex items-center gap-1.5"
        >
          {copied ? (
            <><Check className="h-4 w-4 text-emerald-600" /><span>Copied!</span></>
          ) : (
            <><Copy className="h-4 w-4" /><span>Copy JSON</span></>
          )}
        </Button>
      </div>

      {isMedicalData ? (
        <>
          {/* ── Patient Info + Meta Row ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Patient Card */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                  <User className="h-4 w-4" /> Patient
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-xl font-bold text-slate-900">{patient.name || 'Unknown'}</p>
                <div className="flex gap-3 text-sm text-slate-600">
                  {patient.age && <span>Age: <strong>{patient.age}</strong></span>}
                  {patient.gender && <span>Gender: <strong>{patient.gender}</strong></span>}
                </div>
              </CardContent>
            </Card>

            {/* Lab Card */}
            <Card className="border-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
                  <Building2 className="h-4 w-4" /> Lab / Hospital
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base font-semibold text-slate-800">{labName || 'Not specified'}</p>
              </CardContent>
            </Card>

            {/* Doctor + Timeline Card */}
            <Card className="border-slate-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
                  <Stethoscope className="h-4 w-4" /> Doctor & Date
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-base font-semibold text-slate-800">{doctorName || 'Not specified'}</p>
                {timeline && timeline.length > 0 && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {timeline.join(', ')}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Tests Table ── */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FlaskConical className="h-4 w-4 text-blue-600" />
                Medical Tests ({tests.length})
              </CardTitle>
              <CardDescription>All extracted test results from the report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Test Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Value</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Unit</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Reference Range</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.map((test: any, idx: number) => {
                      const hasValue = test.value && test.value.trim() !== '';
                      return (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-3 px-4 text-slate-900 font-medium max-w-xs">{test.name}</td>
                          <td className="py-3 px-4">
                            {hasValue ? (
                              <span className="font-semibold text-slate-800 bg-blue-50 px-2 py-0.5 rounded">{test.value}</span>
                            ) : (
                              <span className="text-slate-400 italic text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">empty</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">{test.unit || '—'}</td>
                          <td className="py-3 px-4">
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                              {test.reference_range || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-xs">{test.date || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* ── Fallback: Generic JSON Viewer ── */
        <Card>
          <CardHeader>
            <CardTitle>Raw Response</CardTitle>
            <CardDescription>Formatted extraction results</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs font-mono text-slate-700 overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
