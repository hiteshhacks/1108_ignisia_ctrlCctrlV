'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { ChartComponent } from '@/components/ChartComponent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, BarChart2 } from 'lucide-react';

export default function ChartsPage() {
  const [patientName, setPatientName] = useState('');
  const [chartData, setChartData] = useState<any>(null);
  const [patientLabel, setPatientLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchCharts = async () => {
    if (!patientName.trim()) {
      setError('Please enter a patient name');
      return;
    }

    setIsLoading(true);
    setError(null);
    setChartData(null);

    try {
      const { getChartData } = await import('@/lib/api');
      // /patient/{name}/chart-data returns:
      // { success, patient, chart_data: { "Test Name": { unit, reference_range, data: [{date, value, raw_value_string}] } }, raw_tests }
      const response = await getChartData(patientName);
      const raw = response.data;

      // Transform chart_data object into arrays for ChartComponent
      const rawChartData: Record<string, any> = raw.chart_data || {};

      // Build trends array — one entry per test (line chart)
      const trends = Object.entries(rawChartData).map(([testName, info]: [string, any]) => ({
        test: testName,
        unit: info.unit,
        reference_range: info.reference_range,
        data: info.data.map((d: any) => ({
          date: d.date,
          value: typeof d.value === 'number' ? d.value : parseFloat(d.value) || 0,
        })),
      }));

      // Build comparisons array — flat bar chart of latest value per test
      const comparisons = [
        {
          title: `Latest Values — ${raw.patient}`,
          description: 'Most recent recorded value per test',
          data: Object.entries(rawChartData).map(([testName, info]: [string, any]) => {
            const latest = info.data[info.data.length - 1];
            return {
              test: testName.length > 20 ? testName.slice(0, 20) + '…' : testName,
              value: typeof latest?.value === 'number' ? latest.value : parseFloat(latest?.value) || 0,
              unit: info.unit,
            };
          }),
        },
      ];

      setChartData({ trends, comparisons });
      setPatientLabel(raw.patient);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to fetch chart data';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleFetchCharts();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Charts</h1>
          <p className="text-slate-600">
            View patient test trends and value comparisons via interactive charts from the database
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Input Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
            <CardDescription>Enter a patient name to load their chart data from the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="e.g. DUMMY"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleFetchCharts}
                disabled={isLoading || !patientName.trim()}
                className="min-w-fit"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Loading...
                  </>
                ) : (
                  'Load Charts'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Alert */}
        {chartData && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Chart data loaded for patient: <strong>{patientLabel}</strong> — {chartData.trends.length} test(s) found
            </AlertDescription>
          </Alert>
        )}

        {/* Charts Grid */}
        {chartData && (
          <div className="grid gap-8">
            {/* Line Charts — Trend per test */}
            {chartData.trends && chartData.trends.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Test Trends Over Time</h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {chartData.trends.map((trend: any, idx: number) => (
                    <ChartComponent
                      key={idx}
                      data={trend.data}
                      type="line"
                      title={trend.test}
                      description={`Unit: ${trend.unit || 'N/A'} · Ref: ${trend.reference_range || 'N/A'}`}
                      xKey="date"
                      yKey="value"
                      highlightAbnormal
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Bar Charts — Comparisons */}
            {chartData.comparisons && chartData.comparisons.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Value Comparisons (Latest)</h2>
                <div className="grid gap-6 lg:grid-cols-1">
                  {chartData.comparisons.map((comparison: any, idx: number) => (
                    <ChartComponent
                      key={idx}
                      data={comparison.data}
                      type="bar"
                      title={comparison.title}
                      description={comparison.description}
                      xKey="test"
                      yKey="value"
                      highlightAbnormal
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!chartData && !isLoading && (
          <Card className="border-slate-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center text-slate-500">
                <BarChart2 className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No charts yet</p>
                <p className="text-sm">Enter a patient name and click Load Charts to visualize their test history</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
