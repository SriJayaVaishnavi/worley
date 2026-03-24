import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle2, AlertCircle, Database } from 'lucide-react';
import { ProjectTask } from '../types';
import { cn } from '../lib/utils';

interface FileUploadProps {
  onDataLoaded: (data: ProjectTask[]) => void;
}

const SAMPLE_DATA: ProjectTask[] = [
  {
    task_id: "T-101",
    task_name: "Turbine Install",
    is_critical: true,
    spi: 0.87,
    vendor: "Siemens_X",
    vendor_delay_days: 12,
    cost_variance_pct: 16
  },
  {
    task_id: "T-102",
    task_name: "Cooling System",
    is_critical: false,
    spi: 0.95,
    vendor: "GE_Y",
    vendor_delay_days: 2,
    cost_variance_pct: 5
  },
  {
    task_id: "T-103",
    task_name: "Foundation Work",
    is_critical: true,
    spi: 0.98,
    vendor: "Local_Z",
    vendor_delay_days: 10,
    cost_variance_pct: 2
  },
  {
    task_id: "T-104",
    task_name: "Electrical Grid",
    is_critical: true,
    spi: 0.75,
    vendor: "Power_A",
    vendor_delay_days: 0,
    cost_variance_pct: 25
  }
];

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setStatus('parsing');
    setError(null);

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const mappedData: ProjectTask[] = results.data.map((row: any) => ({
            task_id: String(row.Task || row.task_id || Math.random().toString(36).substr(2, 9)),
            task_name: row.task_name || row.Task || 'Unknown Task',
            is_critical: row.is_critical === true || row.Critical === 'Yes' || row.is_critical === 'true',
            spi: parseFloat(row.spi || row.SPI || 1.0),
            vendor: row.vendor || row.Vendor || 'Unknown Vendor',
            vendor_delay_days: parseInt(row.vendor_delay_days || row['Vendor Delay'] || 0),
            cost_variance_pct: parseFloat(String(row.cost_variance_pct || row['Cost Variance'] || '0%').replace('%', '')),
          }));

          onDataLoaded(mappedData);
          setStatus('success');
        } catch (err) {
          console.error(err);
          setError('Failed to map CSV data to schema. Please check column names.');
          setStatus('error');
        }
      },
      error: (err) => {
        setError(err.message);
        setStatus('error');
      }
    });
  };

  const loadSampleData = () => {
    setStatus('parsing');
    setTimeout(() => {
      onDataLoaded(SAMPLE_DATA);
      setStatus('success');
    }, 800);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'text/csv') {
      handleFileUpload(file);
    } else {
      setError('Please upload a valid CSV file.');
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="w-5 h-5 text-zinc-500" />
          Data Ingestion
        </h3>
        <button
          onClick={loadSampleData}
          className="flex items-center gap-2 px-3 py-1.5 bg-worley-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg hover:bg-worley-primary-hover transition-all"
        >
          <Database className="w-3 h-3" />
          Load Sample Data
        </button>
      </div>
      
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-10 transition-all flex flex-col items-center justify-center text-center cursor-pointer",
          isDragging ? "border-worley-primary bg-zinc-50" : "border-zinc-200 hover:border-zinc-400",
          status === 'error' && "border-red-200 bg-red-50"
        )}
        onClick={() => document.getElementById('csv-upload')?.click()}
      >
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
        />
        
        {status === 'idle' && (
          <>
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-worley-navy">Click to upload or drag and drop</p>
            <p className="text-xs text-zinc-500 mt-1">Schedule, Procurement, or Cost CSV</p>
          </>
        )}

        {status === 'parsing' && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-worley-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Processing project data...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
            <p className="text-sm font-medium text-green-900">Data ingested successfully</p>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
              className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-worley-navy"
            >
              Upload another
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-sm font-medium text-red-900">{error || 'Upload failed'}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus('idle'); }}
              className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-worley-navy"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {['Schedule', 'Procurement', 'Cost'].map((sys) => (
          <div key={sys} className="p-3 bg-zinc-50 rounded-lg border border-zinc-100 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-zinc-300" />
            <span className="text-xs font-medium text-zinc-600 uppercase tracking-tighter">{sys} System</span>
          </div>
        ))}
      </div>
    </div>
  );
};
