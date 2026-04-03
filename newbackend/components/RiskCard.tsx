'use client';

import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RiskCardProps {
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
  findings: string[];
  evidence: Array<{ test: string; value: string; unit: string; status: string }>;
  trends: string[];
}

export function RiskCard({ riskLevel, confidence, findings, evidence, trends }: RiskCardProps) {
  const riskConfig = {
    low: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: CheckCircle,
      label: 'Low Risk',
      color: 'text-green-600',
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: AlertTriangle,
      label: 'Medium Risk',
      color: 'text-yellow-600',
    },
    high: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: AlertCircle,
      label: 'High Risk',
      color: 'text-red-600',
    },
  };

  const config = riskConfig[riskLevel];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Risk Level Card */}
      <Card className={`${config.bg} border-2 ${config.border}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon className={`h-8 w-8 ${config.color}`} />
              <div>
                <CardTitle className={config.text}>{config.label}</CardTitle>
                <CardDescription>Confidence: {(confidence * 100).toFixed(1)}%</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {findings.map((finding, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="text-blue-600 font-bold mt-0.5">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Supporting Evidence Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Supporting Evidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Test</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Value</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Unit</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {evidence.map((item, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-3 text-slate-900">{item.test}</td>
                    <td className="py-2 px-3 text-slate-700 font-medium">{item.value}</td>
                    <td className="py-2 px-3 text-slate-600">{item.unit}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === 'abnormal'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Trend Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trend Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {trends.map((trend, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-slate-700">
                <span className="text-blue-600 font-bold mt-0.5">→</span>
                <span>{trend}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
