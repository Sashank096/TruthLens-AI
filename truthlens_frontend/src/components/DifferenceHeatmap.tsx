import React, { useState } from 'react';
import { Eye, Layers, Flame, Info } from 'lucide-react';

interface DifferenceHeatmapProps {
  originalImage: string;
  diffArtifactUrl: string | null;
  candidateImage: string;
  candidateTitle: string;
  similarityPct: number;
  ssim: number;
}

export const DifferenceHeatmap: React.FC<DifferenceHeatmapProps> = ({
  originalImage,
  diffArtifactUrl,
  candidateImage,
  candidateTitle,
  similarityPct,
  ssim,
}) => {
  const [viewMode, setViewMode] = useState<'overlay' | 'candidate' | 'original'>('overlay');

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
      
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Pixel-Level Visual Difference Analysis</span>
          </h4>
          <p className="text-xs text-slate-400">
            Comparing against: <span className="text-slate-200 font-medium">{candidateTitle}</span>
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'overlay'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 inline mr-1" />
            Diff Heatmap
          </button>
          <button
            onClick={() => setViewMode('candidate')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'candidate'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Candidate Image
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'original'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Original Ingested
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative h-[380px] w-full bg-navy-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
        {viewMode === 'overlay' && diffArtifactUrl ? (
          <img
            src={diffArtifactUrl}
            alt="Forensic difference overlay"
            className="w-full h-full object-contain"
          />
        ) : viewMode === 'candidate' ? (
          <img
            src={candidateImage}
            alt={candidateTitle}
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-full object-contain"
          />
        )}

        {/* Badge in top right */}
        <div className="absolute top-3 right-3 bg-navy-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-right">
          <div className="text-[10px] uppercase font-mono text-slate-400">Perceptual Match</div>
          <div className="text-sm font-bold text-amber-400 font-mono">{similarityPct}% Match</div>
          <div className="text-[10px] text-slate-400">SSIM: {ssim}</div>
        </div>
      </div>

      {/* Legend & Interpretation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
        <div className="flex items-start space-x-2 bg-navy-950/50 p-2.5 rounded-lg border border-slate-800/80">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">
            <strong className="text-white">Hot Zones (Red/Yellow):</strong> Indicate pixel clusters with highest divergence (pasted objects, altered banners, or color grading).
          </p>
        </div>
        <div className="flex items-start space-x-2 bg-navy-950/50 p-2.5 rounded-lg border border-slate-800/80">
          <Eye className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">
            <strong className="text-white">Dark Zones:</strong> Indicate pixel alignment and structural agreement with the reference source.
          </p>
        </div>
      </div>

    </div>
  );
};
