"use client";

import React, { useState, useRef } from 'react';

interface PlanUploadProps {
  onUploadComplete: (extractedData: any) => void;
  onUploadStart?: () => void;
}

export default function PlanUpload({ onUploadComplete, onUploadStart }: PlanUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [result, setResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    if (onUploadStart) {
      onUploadStart();
    }

    setUploadStatus('Uploading and processing...');

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      // Mock OCR processing - replace with actual API endpoint
      // const response = await fetch('/api/ocr/extract', {
      //   method: 'POST',
      //   body: formData,
      // });
      // const data = await response.json();

      // Simulate OCR extraction with mock data
      setTimeout(() => {
        const mockExtractedData = {
          plan_name: files[0].name.replace('.pdf', '').replace(/_/g, ' '),
          plan_type: 'Medical',
          carrier: 'Blue Cross Blue Shield',
          confidence: 0.85,
          pricing: {
            employee: 450,
            employee_spouse: 890,
            family: 1200,
          },
          deductible: 2000,
          out_of_pocket_max: 8000,
          copay_primary: 25,
          copay_specialist: 50,
          network: 'PPO',
          effective_date: '2025-01-01',
        };

        setResult(mockExtractedData);
        onUploadComplete(mockExtractedData);
        setUploadStatus('Extraction complete!');
        setTimeout(() => {
          setUploadStatus('');
        }, 3000);
      }, 2000); // Simulate 2 second processing time

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('Upload failed. Please try again.');
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div
        className={`upload-zone${isDragging ? ' active' : ''}`}
        id="uploadZone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        tabIndex={0}
        style={{ maxWidth: 700, width: '100%', margin: '0 auto' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files);
            }
          }}
          className="hidden"
        />
        <div className="upload-icon">⚡</div>
        <h2 style={{ fontSize: 24, marginBottom: 10, fontWeight: 600 }}>Drop Documents Here</h2>
        <p style={{ color: '#999' }}>PDF, PNG, JPG, DOC, DOCX (Max 10MB)</p>
        <button
          className="btn btn-primary"
          style={{ marginTop: 20 }}
          onClick={() => fileInputRef.current?.click()}
        >
          Choose Files
        </button>
      </div>
      {uploadStatus && (
        <div className={`mt-4 p-3 rounded text-sm ${
          uploadStatus.includes('failed') 
            ? 'bg-red-100 text-red-700' 
            : uploadStatus.includes('complete')
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {uploadStatus}
        </div>
      )}
      {result && (
        <div className="mt-8 w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg shadow p-6 text-left">
          <h3 className="text-lg font-semibold mb-2">Extracted Plan Data</h3>
          <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
