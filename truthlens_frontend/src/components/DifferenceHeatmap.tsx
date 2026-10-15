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
    <div className="bg-navy-900 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-4">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Pixel-Level Visual Difference Analysis</span>
          </h4>
          <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-sm">
            Comparing against: <span className="text-slate-200 font-medium">{candidateTitle}</span>
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-lg border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-2.5 py-1 rounded text-[11px] sm:text-xs font-medium transition-colors shrink-0 ${
              viewMode === 'overlay'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Diff Heatmap
          </button>
          <button
            onClick={() => setViewMode('candidate')}
            className={`px-2.5 py-1 rounded text-[11px] sm:text-xs font-medium transition-colors shrink-0 ${
              viewMode === 'candidate'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Candidate
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded text-[11px] sm:text-xs font-medium transition-colors shrink-0 ${
              viewMode === 'original'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="relative h-[260px] sm:h-[340px] md:h-[380px] w-full bg-navy-950 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
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
        <div className="absolute top-2.5 right-2.5 bg-navy-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 text-right">
          <div className="text-[9px] uppercase font-mono text-slate-400">Match</div>
          <div className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{similarityPct}%</div>
          <div className="text-[9px] text-slate-400 font-mono">SSIM: {ssim}</div>
        </div>
      </div>

      {/* Legend & Interpretation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs">
        <div className="flex items-start space-x-2 bg-navy-950/50 p-2 sm:p-2.5 rounded-lg border border-slate-800/80">
          <Info className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">
            <strong className="text-white">Hot Zones:</strong> High pixel divergence (splicing, added graphics, or lighting adjustments).
          </p>
        </div>
        <div className="flex items-start space-x-2 bg-navy-950/50 p-2 sm:p-2.5 rounded-lg border border-slate-800/80">
          <Eye className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-slate-300">
            <strong className="text-white">Dark Zones:</strong> Structural and pixel alignment with candidate source.
          </p>
        </div>
      </div>

    </div>
  );
};
