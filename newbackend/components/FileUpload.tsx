'use client';

import { useState, useCallback } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
  onUploadError: (error: string) => void;
  isLoading: boolean;
}

export function FileUpload({ onUploadSuccess, onUploadError, isLoading }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onUploadError('Please upload an image file');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      const { extractReport } = await import('@/lib/api');
      const response = await extractReport(file);
      onUploadSuccess(response.data);
    } catch (error) {
      onUploadError(
        error instanceof Error ? error.message : 'Failed to extract data from image'
      );
      setPreviewUrl(null);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <p className="text-slate-700 font-medium mb-2">Drag and drop your medical report</p>
        <p className="text-slate-500 text-sm mb-4">or</p>
        <label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isLoading}
            className="hidden"
          />
          <Button disabled={isLoading} asChild className="cursor-pointer">
            <span>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                'Browse Files'
              )}
            </span>
          </Button>
        </label>
      </div>

      {previewUrl && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-slate-900 mb-3">Preview</h3>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-64 rounded-lg border border-slate-200"
          />
        </div>
      )}
    </div>
  );
}
