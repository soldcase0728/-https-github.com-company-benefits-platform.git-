"use client";

import { useState } from 'react';
import Link from 'next/link';
import PrecisionExtractionUpload from '../../src/components/precision-extraction/PrecisionExtractionUpload';

export default function PrecisionExtractPage() {
  const [extractedData, setExtractedData] = useState(null);

  const handleExtractionComplete = (data: any) => {
    setExtractedData(data);
    console.log('Extraction completed:', data);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">OCR Precision Extraction</h1>
      <PrecisionExtractionUpload onExtractionComplete={handleExtractionComplete} />
      {extractedData && (
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Extracted Data Preview</h2>
          <pre className="bg-[var(--color-bg-surface-alt)] border border-[var(--color-border)] p-4 rounded-lg overflow-auto text-xs md:text-sm">
            {JSON.stringify(extractedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
