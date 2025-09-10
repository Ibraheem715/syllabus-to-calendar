'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onFileProcessed: (result: any) => void;
  onError: (error: string) => void;
}

export default function FileUpload({ onFileProcessed, onError }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      onError('Please upload a PDF file only.');
      setUploadStatus('error');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      onError('File size must be less than 10MB.');
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);
    setUploadStatus('uploading');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      setUploadStatus('processing');

      // Upload to API
      const response = await fetch('/api/process-syllabus', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to process syllabus');
      }

      setUploadStatus('success');
      onFileProcessed(result.data);

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process syllabus';
      onError(errorMessage);
      setUploadStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'processing':
        return <div className="loading-spinner" />;
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Upload className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Uploading file...';
      case 'processing':
        return 'Processing syllabus with AI...';
      case 'success':
        return `Successfully processed ${fileName}`;
      case 'error':
        return 'Upload failed';
      default:
        return 'Upload your syllabus PDF';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${isProcessing ? 'pointer-events-none opacity-75' : 'hover:border-gray-400 hover:bg-gray-50'}
          ${uploadStatus === 'success' ? 'border-green-300 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInputChange}
          className="hidden"
          id="file-upload"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center space-y-4">
          {getStatusIcon()}

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {getStatusMessage()}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {uploadStatus === 'idle' && (
                <>
                  Drag and drop your PDF here, or{' '}
                  <label
                    htmlFor="file-upload"
                    className="text-blue-600 hover:text-blue-500 cursor-pointer font-medium"
                  >
                    browse
                  </label>
                </>
              )}
              {uploadStatus === 'processing' && (
                'This may take 30-60 seconds depending on syllabus length'
              )}
              {uploadStatus === 'success' && (
                <button
                  onClick={resetUpload}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Upload another file
                </button>
              )}
            </p>
          </div>

          {fileName && uploadStatus !== 'idle' && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="w-4 h-4" />
              <span>{fileName}</span>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>Supported format: PDF • Maximum size: 10MB</p>
          <p>Text-based PDFs only (scanned documents not supported)</p>
        </div>
      </div>

      {uploadStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Upload Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Please try again or check that your PDF is text-based and under 10MB.</p>
                <button
                  onClick={resetUpload}
                  className="mt-2 text-red-600 hover:text-red-500 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
