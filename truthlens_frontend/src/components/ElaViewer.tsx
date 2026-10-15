import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertCircle, CheckCircle, Flame, Layers } from 'lucide-react';
import { ElaSummary } from '../types';
import { SplitSlider } from './SplitSlider';

interface ElaViewerProps {
  originalImageUrl: string;
  elaSummary: ElaSummary;
  storageRelPath: string;
  onRecomputeEla?: (quality: number, scale: number) => Promise<void>;
}

export const ElaViewer: React.FC<ElaViewerProps> = ({
  originalImageUrl,
  elaSummary,
  storageRelPath,
  onRecomputeEla
}) => {
  const [quality, setQuality] = useState<number>(elaSummary.quality_evaluated || 95);
  const [scale, setScale] = useState<number>(elaSummary.scale_factor || 18);
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [activeView, setActiveView] = useState<'split' | 'heatmap' | 'raw_ela'>('split');

  const handleRecompute = async () => {
    if (!onRecomputeEla) return;
    setIsRecomputing(true);
    try {
      await onRecomputeEla(quality, scale);
    } finally {
      setIsRecomputing(false);
    }
  };

  const heatmapUrl = `/vault/${elaSummary.heatmap_artifact_rel_path}`;
  const rawElaUrl = `/vault/${elaSummary.ela_artifact_rel_path}`;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Error Level Analysis (ELA)</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              JPEG COMPRESSION MATRIX
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects compression error discrepancies across image blocks caused by digital splicing or re-saved regions.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveView('split')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === 'split'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive Split View
          </button>
          <button
            onClick={() => setActiveView('heatmap')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === 'heatmap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            False-Color Heatmap
          </button>
          <button
            onClick={() => setActiveView('raw_ela')}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === 'raw_ela'
                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Amplified Residual
          </button>
        </div>
      </div>

      {/* Main Visual Display */}
      {activeView === 'split' ? (
        <SplitSlider
          leftImage={originalImageUrl}
          rightImage={heatmapUrl}
          leftLabel="Original Image"
          rightLabel="ELA False-Color Heatmap"
          heightClass="h-[460px]"
        />
      ) : activeView === 'heatmap' ? (
        <div className="relative h-[460px] w-full bg-navy-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <img
            src={heatmapUrl}
            alt="ELA Heatmap"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-3 right-3 bg-navy-950/80 px-3 py-1 rounded-md text-[11px] font-mono text-amber-400 border border-amber-500/30">
            Jet Colormap (High error = Red/Yellow)
          </div>
        </div>
      ) : (
        <div className="relative h-[460px] w-full bg-navy-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
          <img
            src={rawElaUrl}
            alt="Raw ELA"
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-3 right-3 bg-navy-950/80 px-3 py-1 rounded-md text-[11px] font-mono text-cyan-400 border border-cyan-500/30">
            Linear Diff Amplification ({elaSummary.scale_factor}x)
          </div>
        </div>
      )}

      {/* Interactive Controls & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        
        {/* Dynamic Sliders */}
        <div className="lg:col-span-1 bg-navy-950/80 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interactive Parameters</span>
            </span>
            {onRecomputeEla && (
              <button
                onClick={handleRecompute}
                disabled={isRecomputing}
                className="flex items-center space-x-1 px-2.5 py-1 text-[11px] font-medium rounded bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25 border border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRecomputing ? 'animate-spin' : ''}`} />
                <span>Apply</span>
              </button>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Recompression Quality:</span>
              <strong className="text-cyan-400">{quality}%</strong>
            </div>
            <input
              type="range"
              min="70"
              max="98"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>70% (Coarse)</span>
              <span>95% (Standard)</span>
              <span>98% (Fine)</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-300">
              <span>Scale Multiplier:</span>
              <strong className="text-cyan-400">{scale}x</strong>
            </div>
            <input
              type="range"
              min="5"
              max="30"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Statistical Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Block Variance</div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {elaSummary.block_variance}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {elaSummary.block_variance > 3.5 ? '⚠️ High Divergence' : '✓ Uniform Blocks'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">High Residual</div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {elaSummary.high_residual_percentage}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Pixels above threshold</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Mean Error</div>
            <div className="text-lg font-bold font-mono text-white mt-1">
              {elaSummary.mean_error}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Pixel difference level</div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400">Anomaly Rating</div>
            <div className="text-lg font-bold font-mono text-amber-400 mt-1">
              {elaSummary.ela_anomaly_score}/100
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {elaSummary.suspicious_regions_detected ? 'Suspicious patches' : 'Consistent baseline'}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
