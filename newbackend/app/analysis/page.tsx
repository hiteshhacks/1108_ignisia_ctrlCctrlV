'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, CheckCircle, Brain } from 'lucide-react';

export default function AnalysisPage() {
  const [patientName, setPatientName] = useState('');
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!patientName.trim()) {
      setError('Please enter a patient name');
      return;
    }

    setIsLoading(true);
    setError(null);
    setReasoning(null);

    try {
      const { analyzePatient } = await import('@/lib/api');
      // /reason-medical returns: { success, reasoning: string (markdown), message }
      const response = await analyzePatient(patientName);
      setReasoning(response.data.reasoning);
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to analyze patient';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleAnalyze();
    }
  };

  // Render markdown-ish text nicely
  const renderReasoning = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold text-slate-900 mt-4 mb-1">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="text-lg font-bold text-blue-700 mt-5 mb-2 border-b border-blue-100 pb-1">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="text-xl font-bold text-slate-900 mt-4 mb-2">{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="ml-4 text-slate-700 text-sm list-disc">{line.replace(/^[-*] /, '')}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={idx} className="font-semibold text-slate-800 text-sm mt-2">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      return <p key={idx} className="text-slate-700 text-sm leading-relaxed">{line}</p>;
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Patient Analysis</h1>
          <p className="text-slate-600">
            Enter a patient name to generate a full AI-powered clinical report with RAG-cited medical guidelines
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
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Enter the patient&apos;s name exactly as it was extracted from the lab report</CardDescription>
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
                onClick={handleAnalyze}
                disabled={isLoading || !patientName.trim()}
                className="min-w-fit"
              >
                {isLoading ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Generating Report...
                  </>
                ) : (
                  'Analyze'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <Card className="border-blue-100 bg-blue-50 mb-6">
            <CardContent className="flex items-center justify-center py-12 gap-4">
              <Spinner className="h-6 w-6 text-blue-600" />
              <div className="text-center">
                <p className="font-medium text-blue-800">Running Multi-Agent Analysis...</p>
                <p className="text-sm text-blue-600 mt-1">Fetching patient data → Running AI agents → Citing medical guidelines</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success + Report */}
        {reasoning && (
          <>
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Clinical report generated successfully with RAG citations!
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <CardTitle>Clinical Report — {patientName.toUpperCase()}</CardTitle>
                </div>
                <CardDescription>AI-generated analysis based on historical patient data from the database</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none space-y-1">
                  {renderReasoning(reasoning)}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Empty State */}
        {!reasoning && !isLoading && (
          <Card className="border-slate-200 bg-white">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center text-slate-500">
                <Brain className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-lg font-medium">No analysis yet</p>
                <p className="text-sm">Enter a patient name and click Analyze to generate a full AI clinical report</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
