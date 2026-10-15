import React from 'react';
import { Radio, AlertOctagon, CheckCircle2, Info } from 'lucide-react';
import { NoiseSummary } from '../types';
import { resolveAssetUrl } from '../services/api';

interface NoiseViewerProps {
  noiseSummary: NoiseSummary;
}

export const NoiseViewer: React.FC<NoiseViewerProps> = ({ noiseSummary }) => {
  const rawPath = noiseSummary?.noise_artifact_rel_path || '';
  const noiseMapUrl = rawPath ? resolveAssetUrl(rawPath.startsWith('data:') ? rawPath : `/vault/${rawPath}`) : '';

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 sm:pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">Sensor Noise & PRNU Residual</h3>
            <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              LAPLACIAN FILTER
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
            Isolates high-frequency sensor noise across block regions to detect mixed-source compositing and localized retouching.
          </p>
        </div>

        {/* Splicing Status Badge */}
        <div>
          {noiseSummary.splicing_detected ? (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
              <span>Noise Discontinuity</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Single-Sensor Noise</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center">
        
        {/* Noise Map Image */}
        <div className="relative h-[250px] sm:h-[320px] md:h-[360px] w-full bg-navy-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
          <img
            src={noiseMapUrl}
            alt="Noise Variance Map"
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute top-3 left-3 bg-navy-950/85 backdrop-blur-md px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
            Viridis Colormap (Local Variance)
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-3 sm:space-y-4">
          
          <div className="p-3.5 sm:p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-1 sm:space-y-2">
            <span className="text-[10px] sm:text-[11px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
              Sensor Noise Consistency Finding
            </span>
            <p className="text-xs sm:text-sm font-medium text-slate-200">
              {noiseSummary.finding_summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            <div className="p-3 sm:p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">Dispersion (CV)</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
                {noiseSummary.coefficient_of_variation}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">
                {noiseSummary.coefficient_of_variation > 1.2 ? '⚠️ High variance' : '✓ Normal spread'}
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">Mean Residual</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
                {noiseSummary.mean_sensor_noise_var}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">Baseline noise</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">Noise Spread</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-white mt-0.5">
                {noiseSummary.noise_variance_std}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">Standard deviation</div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[9px] sm:text-[10px] uppercase font-mono text-slate-400">Inconsistency Score</div>
              <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400 mt-0.5">
                {noiseSummary.noise_inconsistency_score}/100
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400">Splicing anomaly</div>
            </div>
          </div>

          <div className="flex items-start space-x-2 p-2.5 sm:p-3 rounded-xl bg-navy-950/40 border border-slate-800/60 text-[11px] sm:text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            <p>
              When a subject is cut from an image shot under different lighting and pasted, high-frequency residuals display distinct boundary lines in the variance matrix.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
