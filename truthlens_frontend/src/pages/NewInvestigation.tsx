import React, { useState, useCallback } from 'react';
import { UploadCloud, ShieldCheck, FileCheck, AlertCircle, ArrowRight, Loader2, Sparkles, Hash, Cpu } from 'lucide-react';
import { getApiBaseUrl } from '../services/api';
import { executeBrowserIngestion } from '../services/browserForensics';

interface NewInvestigationProps {
  onCaseCreated: (caseId: string) => void;
  onCancel: () => void;
}

export const NewInvestigation: React.FC<NewInvestigationProps> = ({
  onCaseCreated,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [examiner, setExaminer] = useState('Senior Forensic Examiner');
  const [priority, setPriority] = useState('High');
  const [tags, setTags] = useState('impersonation, manipulation, cyber-evidence');
  const [notes, setNotes] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [clientSha256, setClientSha256] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute SHA-256 client-side using Web Crypto API
  const handleFileChange = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setErrorMessage(null);

    try {
      const buffer = await selectedFile.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setClientSha256(hashHex);
    } catch (err) {
      console.error("Client SHA-256 calculation error:", err);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const steps = [
    "Preserving immutable evidence bytes & verifying SHA-256...",
    "Extracting deep EXIF, camera optics & GPS coordinates...",
    "Inspecting C2PA Content Credentials provenance manifest...",
    "Executing multi-channel Error Level Analysis (ELA)...",
    "Running 2D FFT spectral decomposition & noise variance...",
    "Searching candidate sources in forensic reference corpus...",
    "Synthesizing explainable findings & generating certified report..."
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage("Please select or drop a digital evidence image to investigate.");
      return;
    }
    if (!title.trim()) {
      setErrorMessage("Please provide an investigation case title.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setActiveStep(0);

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 600);

    const base = getApiBaseUrl();

    try {
      // First try cloud/local FastAPI backend
      let backendSuccess = false;
      let caseId = '';

      try {
        const caseFormData = new FormData();
        caseFormData.append('title', title);
        caseFormData.append('examiner', examiner);
        caseFormData.append('priority', priority);
        caseFormData.append('tags', tags);
        caseFormData.append('notes', notes);

        const caseRes = await fetch(`${base}/api/cases`, {
          method: 'POST',
          body: caseFormData,
          signal: AbortSignal.timeout(5000)
        });

        if (caseRes.ok) {
          const contentType = caseRes.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const caseData = await caseRes.json();
            caseId = caseData.case.id;

            // Ingest evidence
            const evidenceFormData = new FormData();
            evidenceFormData.append('file', file);
            evidenceFormData.append('ela_quality', '95');
            evidenceFormData.append('ela_scale', '18');

            const ingestRes = await fetch(`${base}/api/cases/${caseId}/evidence`, {
              method: 'POST',
              body: evidenceFormData,
              signal: AbortSignal.timeout(20000)
            });

            if (ingestRes.ok) {
              backendSuccess = true;
            }
          }
        }
      } catch (backendErr) {
        console.warn("FastAPI backend not reachable, seamlessly executing via client-side engine:", backendErr);
      }

      // If backend was not reachable or returned non-JSON/404, fallback to client-side engine!
      if (!backendSuccess) {
        const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        const localCase = await executeBrowserIngestion(
          { title, examiner, priority, tags: parsedTags, notes },
          file
        );
        caseId = localCase.id;
      }

      clearInterval(stepInterval);
      setActiveStep(steps.length - 1);

      setTimeout(() => {
        onCaseCreated(caseId);
      }, 500);

    } catch (err: any) {
      clearInterval(stepInterval);
      setIsSubmitting(false);
      setErrorMessage(err.message || "An unexpected error occurred during evidence ingestion.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
          <ShieldCheck className="w-6 h-6 text-cyan-400" />
          <span>New Forensic Evidence Investigation</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Preserve original image bytes, extract hardware metadata, run multi-modal tampering checks, and generate a certified chain-of-custody report.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSubmitting ? (
        /* Animated Ingestion Pipeline Stepper */
        <div className="bg-navy-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white tracking-wide">
              Ingesting Digital Evidence & Executing Forensics
            </h3>
            <p className="text-xs font-mono text-cyan-400">
              {steps[activeStep]}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 h-full transition-all duration-500"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            Step {activeStep + 1} of {steps.length} • Multi-modal forensic evaluation
          </div>
        </div>
      ) : (
        /* Ingestion Form */
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* File Upload Dropzone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              file
                ? 'border-cyan-500/50 bg-cyan-500/5'
                : 'border-slate-700/80 hover:border-cyan-500/40 bg-navy-900/60'
            }`}
          >
            {file && filePreview ? (
              <div className="space-y-4">
                <div className="relative max-h-56 max-w-sm mx-auto rounded-xl overflow-hidden border border-slate-700 shadow-xl">
                  <img
                    src={filePreview}
                    alt="Evidence Preview"
                    className="max-h-56 w-auto object-contain mx-auto"
                  />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono bg-navy-950/80 text-cyan-400 border border-cyan-500/30">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-bold text-white">{file.name}</div>
                  {clientSha256 && (
                    <div className="flex items-center justify-center space-x-1.5 text-xs font-mono text-slate-400">
                      <Hash className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-slate-300">Client-Verified SHA-256:</span>
                      <span className="text-cyan-400 font-bold">{clientSha256.slice(0, 20)}...</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setFilePreview(null);
                    setClientSha256(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 underline"
                >
                  Choose different image
                </button>
              </div>
            ) : (
              <div className="space-y-3 cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <div className="text-sm font-semibold text-white">
                    Drop suspicious evidence image here, or <span className="text-cyan-400 underline">browse files</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Supports JPEG, PNG, WebP, TIFF, BMP (Original file preserved with 0% alteration)
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
                  className="hidden"
                  id="evidence-file-input"
                />
                <label
                  htmlFor="evidence-file-input"
                  className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors"
                >
                  Select File from Disk
                </label>
              </div>
            )}
          </div>

          {/* Case Metadata Inputs */}
          <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Case Dossier & Evidence Metadata
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">
                  Case Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Incident 402 — Social Media Identity Impersonation Campaign"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Lead Examiner / Investigator
                </label>
                <input
                  type="text"
                  value={examiner}
                  onChange={(e) => setExaminer(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Investigation Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">
                  Investigation Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">
                  Incident Background & Investigator Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Record initial source context, where image was recovered, suspect claims, or custody origin..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-navy-950 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-colors text-center"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!file}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>Launch Ingestion & Analysis</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
