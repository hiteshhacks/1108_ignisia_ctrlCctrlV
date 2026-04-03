'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { FileUpload } from '@/components/FileUpload';
import { DataDisplay } from '@/components/DataDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function UploadPage() {
  const [extractedData, setExtractedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUploadSuccess = (data: any) => {
    setExtractedData(data);
    setError(null);
    setIsLoading(false);
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
    setExtractedData(null);
    setIsLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Upload Medical Report</h1>
          <p className="text-slate-600">
            Upload a medical report image to extract structured data and analyze results
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {extractedData && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Data extracted successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Medical Report</CardTitle>
            <CardDescription>
              Upload an image of your medical report (PNG, JPG, or other image formats)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Extracted Data Display */}
        {extractedData && <DataDisplay data={extractedData} />}
      </div>
    </main>
  );
}
