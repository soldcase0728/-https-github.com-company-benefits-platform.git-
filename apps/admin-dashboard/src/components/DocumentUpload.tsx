import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUpload }) => {
  const [uploadState, setUploadState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<any>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadState('processing');
    try {
      // Call your docai-svc endpoint
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/docai/extract', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setConfidence(data.source_confidence);
      setExtractedData(data);
      setUploadState('success');
      await onUpload(file);
    } catch (error) {
      setUploadState('error');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-8">
      <motion.div 
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
      >
        {/* Main Upload Area */}
        <div 
          {...getRootProps()} 
          className={`
            relative overflow-hidden rounded-3xl bg-white 
            ${isDragActive ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}
            transition-all duration-300 cursor-pointer
            ${uploadState === 'idle' ? 'hover:shadow-2xl' : ''}
          `}
          style={{
            boxShadow: uploadState === 'idle' 
              ? '0 10px 40px rgba(0,0,0,0.08)' 
              : '0 20px 60px rgba(0,0,0,0.15)',
            transform: isDragActive ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s cubic-bezier(0.43, 0.13, 0.23, 0.96)'
          }}
        >
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {uploadState === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16 text-center"
              >
                <motion.div
                  animate={{ 
                    scale: isDragActive ? 1.1 : 1,
                    rotate: isDragActive ? 5 : 0 
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Upload className="w-16 h-16 mx-auto mb-6 text-gray-400" strokeWidth={1.5} />
                </motion.div>
                <h2 className="text-2xl font-light text-gray-800 mb-2">
                  Drop your document here
                </h2>
                <p className="text-gray-500 font-light">
                  or click to browse
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    PDF
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    DOCX
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    DOC
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    PNG
                  </span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    JPG
                  </span>
                </div>
              </motion.div>
            )}
            {uploadState === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16"
              >
                <div className="flex flex-col items-center">
                  {/* Elegant processing animation */}
                  <div className="relative w-24 h-24 mb-8">
                    <motion.div
                      className="absolute inset-0 border-2 border-gray-200 rounded-full"
                    />
                    <motion.div
                      className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <FileText className="absolute inset-4 w-12 h-12 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-light text-gray-800 mb-2">
                    Analyzing Document
                  </h3>
                  <p className="text-sm text-gray-500 font-light">
                    Using AI to extract plan information
                  </p>
                  {/* Progress steps */}
                  <div className="mt-8 space-y-2 w-full max-w-xs">
                    {['Reading document', 'Extracting text', 'Analyzing structure', 'Validating data'].map((step, i) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.5 }}
                        className="flex items-center gap-3"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ delay: i * 0.5, duration: 0.3 }}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                        />
                        <span className="text-sm text-gray-600 font-light">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {uploadState === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-16"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-10 h-10 text-green-600" strokeWidth={1.5} />
                </motion.div>
                <h3 className="text-2xl font-light text-gray-800 mb-2 text-center">
                  Document Processed
                </h3>
                {/* Confidence indicator */}
                <div className="mt-6 mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Confidence</span>
                    <span className={`font-medium ${confidence > 0.8 ? 'text-green-600' : confidence > 0.6 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {(confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${confidence > 0.8 ? 'bg-green-500' : confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    />
                  </div>
                </div>
                {/* Extracted data preview */}
                {extractedData && (
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Plan Type</span>
                      <span className="font-medium">{extractedData.plan_tiers?.[0]?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Network</span>
                      <span className="font-medium">{extractedData.network?.name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Pricing Tiers</span>
                      <span className="font-medium">{extractedData.pricing?.length || 0} found</span>
                    </div>
                  </div>
                )}
                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setUploadState('idle')}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-light hover:bg-gray-200 transition-colors"
                  >
                    Upload Another
                  </button>
                  <button
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-light hover:bg-blue-700 transition-colors"
                  >
                    Review & Deploy
                  </button>
                </div>
              </motion.div>
            )}
            {uploadState === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-16 text-center"
              >
                <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-500" strokeWidth={1.5} />
                <h3 className="text-xl font-light text-gray-800 mb-2">
                  Processing Failed
                </h3>
                <p className="text-gray-500 font-light mb-6">
                  Please check the document format and try again
                </p>
                <button
                  onClick={() => setUploadState('idle')}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-light hover:bg-gray-800 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Subtle helper text */}
        <motion.p 
          className="text-center mt-6 text-sm text-gray-500 font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Supported formats: PDF, DOCX, DOC, PNG, JPG • Max 50MB
        </motion.p>
      </motion.div>
    </div>
  );
};
