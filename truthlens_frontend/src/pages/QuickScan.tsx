import React, { useState } from 'react';
import { Search, UploadCloud, ShieldCheck, AlertCircle, Loader2, Sparkles, Flame, Waves, Radio, Camera, Award } from 'lucide-react';
import { RiskMeter } from '../components/RiskMeter';
import { VerifiedFactsCard } from '../components/VerifiedFactsCard';
import { ElaViewer } from '../components/ElaViewer';
import { FftViewer } from '../components/FftViewer';
import { NoiseViewer } from '../components/NoiseViewer';
import { ExifDossier } from '../components/ExifDossier';
import { C2paDossier } from '../components/C2paDossier';
import { CandidateMatches } from '../components/CandidateMatches';

export const QuickScan: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = async (selected: File) => {
    setFile(selected);
    setFilePreview(URL.createObjectURL(selected));
    setErrorMessage(null);
    setScanResult(null);

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append('file', selected);
      formData.append('ela_quality', '95');
      formData.append('ela_scale', '18');

      const res = await fetch('/api/forensics/quick-scan', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error("Forensic quick-scan failed. Please verify the image file format.");
      }

      const data = await res.json();
      setScanResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to scan file");
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <Search className="w-3.5 h-3.5" />
          <span>FAST TRIAGE TOOL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Instant Image Forensic Triage
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Quickly test an image without creating a permanent case container. Runs full ELA, 2D FFT, noise variance, EXIF, and reverse source searches in seconds.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-slate-700/80 hover:border-cyan-500/50 rounded-2xl p-8 text-center bg-navy-900/50 transition-all cursor-pointer"
      >
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white">
              Drop image here for immediate triage scan, or <span className="text-cyan-400 underline">browse</span>
            </div>
            <p className="text-xs text-slate-500">
              Supports JPEG, PNG, WebP, TIFF (Fast in-memory processing)
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            id="quick-scan-file-input"
            className="hidden"
            onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
          />
          <label
            htmlFor="quick-scan-file-input"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors"
          >
            Select Image
          </label>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isScanning && (
        <div className="p-12 text-center text-slate-400 bg-navy-900 border border-slate-800 rounded-2xl space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">Analyzing Image Artifacts...</h3>
          <p className="text-xs text-slate-500 font-mono">
            Evaluating compression error levels, 2D FFT harmonics, and candidate sources
          </p>
        </div>
      )}

      {/* Results Workspace */}
      {scanResult && (
        <div className="space-y-6">
          
          {/* Quick Sub-navigation */}
          <div className="border-b border-slate-800 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {[
                { id: 'overview', label: 'Overview & Risk', icon: ShieldCheck },
                { id: 'ela', label: 'Error Level (ELA)', icon: Flame },
                { id: 'fft', label: '2D FFT Spectrum', icon: Waves },
                { id: 'noise', label: 'Sensor Noise', icon: Radio },
                { id: 'exif', label: 'EXIF Metadata', icon: Camera },
                { id: 'c2pa', label: 'C2PA Credentials', icon: Award },
                { id: 'candidates', label: 'Source Candidates', icon: Search },
              ].map((t) => {
                const Icon = t.icon;
                const isAct = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isAct
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <RiskMeter
                score={scanResult.risk_score}
                level={scanResult.risk_level}
                verdict={scanResult.summary_verdict}
                confidence={scanResult.confidence_rating}
                redFlags={scanResult.red_flags}
              />
              <VerifiedFactsCard
                verifiedFacts={scanResult.verified_facts}
                estimates={scanResult.estimates}
              />
            </div>
          )}

          {activeTab === 'ela' && (
            <ElaViewer
              originalImageUrl={`/vault/${scanResult.storage_rel_path}`}
              elaSummary={scanResult.ela}
              storageRelPath={scanResult.storage_rel_path}
            />
          )}

          {activeTab === 'fft' && (
            <FftViewer fftSummary={scanResult.fft} />
          )}

          {activeTab === 'noise' && (
            <NoiseViewer noiseSummary={scanResult.noise} />
          )}

          {activeTab === 'exif' && (
            <ExifDossier metadata={scanResult.metadata} />
          )}

          {activeTab === 'c2pa' && (
            <C2paDossier c2pa={scanResult.c2pa} />
          )}

          {activeTab === 'candidates' && (
            <CandidateMatches
              originalImageUrl={`/vault/${scanResult.storage_rel_path}`}
              candidates={scanResult.candidates || []}
            />
          )}

        </div>
      )}

    </div>
  );
};
