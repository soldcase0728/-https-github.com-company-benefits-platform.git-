import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

// Adjust these imports based on your UI component location
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
// OR if you have the shared package working:
// import { Card, CardContent, CardHeader, CardTitle } from '@benefits/ui/components/card';

import { 
  Upload, 
  Target, 
  Database,
  CheckCircle,
  Eye,
  BarChart3
} from 'lucide-react';

interface ExtractionResult {
  status: string;
  extracted_fields: Record<string, any[]>;
  confidence_summary: Record<string, any>;
  total_extractions: number;
  processing_time?: number;
  engines_used?: string[];
}

interface FieldOption {
  id: string;
  label: string;
  description: string;
}

interface PrecisionExtractionUploadProps {
  onExtractionComplete?: (data: any) => void;
}

export default function PrecisionExtractionUpload({ 
  onExtractionComplete 
}: PrecisionExtractionUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState([
    'plan_name', 'carrier_name', 'actuarial_value', 'currency', 'percentage',
    'date', 'ein', 'coverage_tiers', 'plan_benefits'
  ]);

  const availableFields: FieldOption[] = [
    { id: 'plan_name', label: 'Plan Name', description: 'Insurance plan identification' },
    { id: 'carrier_name', label: 'Carrier Name', description: 'Insurance carrier/provider' },
    { id: 'carrier_ein', label: 'Carrier EIN', description: 'Employer Identification Number' },
    { id: 'actuarial_value', label: 'Actuarial Value', description: 'ACA actuarial value percentage' },
    { id: 'currency', label: 'Currency Values', description: 'Premium amounts, deductibles, costs' },
    { id: 'percentage', label: 'Percentages', description: 'Coinsurance, copay percentages' },
    { id: 'date', label: 'Dates', description: 'Effective dates, termination dates' },
    { id: 'coverage_tiers', label: 'Coverage Tiers', description: 'Employee, family pricing tiers' },
    { id: 'plan_benefits', label: 'Plan Benefits', description: 'Deductibles, copays, benefits' }
  ];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setResults(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('target_fields', selectedFields.join(','));

      const startTime = Date.now();
      const response = await fetch('/api/docai/extract-precise-data', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const processingTime = Date.now() - startTime;
      
      const enhancedResult: ExtractionResult = {
        ...result,
        processing_time: processingTime,
        engines_used: result.engines_used || ['Tesseract', 'EasyOCR', 'PaddleOCR', 'TrOCR']
      };

      setResults(enhancedResult);
      
      if (onExtractionComplete) {
        onExtractionComplete(enhancedResult.extracted_fields);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Extraction failed';
      setError(errorMessage);
      console.error('Precision extraction failed:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFields, onExtractionComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const toggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-3">
          <Target className="h-8 w-8 text-blue-600" />
          World-Class Precision Extraction
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Advanced multi-engine OCR with AI-powered validation, designed specifically for 
          insurance documents and ACA compliance data extraction.
        </p>
      </div>

      {/* Field Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Target Fields Selection
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select which data fields to extract from your documents
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableFields.map(field => (
              <div
                key={field.id}
                className={`border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedFields.includes(field.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleField(field.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedFields.includes(field.id)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedFields.includes(field.id) && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="font-medium text-sm">{field.label}</span>
                </div>
                <p className="text-xs text-gray-500">{field.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-600">
            Selected: <Badge variant="secondary">{selectedFields.length} fields</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Document Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${isDragActive 
                ? 'border-blue-400 bg-blue-50' 
                : isProcessing 
                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`h-12 w-12 mx-auto mb-4 ${
              isProcessing ? 'text-gray-300' : 'text-gray-400'
            }`} />
            
            {isProcessing ? (
              <div className="space-y-4">
                <p className="text-gray-600">Processing document...</p>
                <Progress value={undefined} className="w-full max-w-md mx-auto" />
                <div className="text-sm text-gray-500">
                  Running multi-engine OCR analysis...
                </div>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-600">Drop the PDF here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600">
                  Drag & drop an insurance PDF, or click to select
                </p>
                <Button variant="outline">
                  Choose PDF File
                </Button>
                <p className="text-xs text-gray-500">
                  Supports: PDF files up to 50MB
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Extraction Failed:</strong> {error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Extraction Results
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">
                {results.total_extractions} extractions found
              </Badge>
              <Badge variant="secondary">
                {Object.keys(results.extracted_fields).length} fields processed
              </Badge>
              {results.processing_time && (
                <Badge variant="secondary">
                  {(results.processing_time / 1000).toFixed(1)}s processing time
                </Badge>
              )}
              {results.engines_used && (
                <Badge variant="secondary">
                  {results.engines_used.length} OCR engines
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(results.extracted_fields).map(([field, extractions]) => (
                <div key={field} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium capitalize">
                      {field.replace('_', ' ')}
                    </h4>
                    <Badge variant={extractions.length > 0 ? "default" : "secondary"}>
                      {extractions.length} found
                    </Badge>
                  </div>
                  
                  {extractions.length > 0 ? (
                    <div className="space-y-2">
                      {extractions.slice(0, 5).map((extraction: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-mono text-sm font-medium">
                              {extraction.text}
                            </div>
                            {extraction.validated_value && extraction.validated_value !== extraction.text && (
                              <div className="text-xs text-green-600 mt-1">
                                Validated: <span className="font-mono">{extraction.validated_value}</span>
                              </div>
                            )}
                            {extraction.bbox && (
                              <div className="text-xs text-gray-400 mt-1">
                                Location: ({extraction.bbox[0]}, {extraction.bbox[1]})
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(extraction.confidence || 0)}`} />
                            <Badge 
                              variant={(extraction.confidence || 0) > 0.8 ? "default" : "secondary"}
                            >
                              {Math.round((extraction.confidence || 0) * 100)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {extractions.length > 5 && (
                        <p className="text-sm text-gray-500 text-center">
                          ... and {extractions.length - 5} more results
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No {field.replace('_', ' ')} data found</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
