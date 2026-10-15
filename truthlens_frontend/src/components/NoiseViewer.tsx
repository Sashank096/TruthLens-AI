import React from 'react';
import { Radio, AlertOctagon, CheckCircle2, Info } from 'lucide-react';
import { NoiseSummary } from '../types';

interface NoiseViewerProps {
  noiseSummary: NoiseSummary;
}

export const NoiseViewer: React.FC<NoiseViewerProps> = ({ noiseSummary }) => {
  const noiseMapUrl = `/vault/${noiseSummary.noise_artifact_rel_path}`;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Sensor Noise & PRNU Residual</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              HIGH-FREQUENCY LAPLACIAN
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Isolates high-frequency sensor noise across block regions to detect mixed-source compositing and localized retouching.
          </p>
        </div>

        {/* Splicing Status Badge */}
        <div>
          {noiseSummary.splicing_detected ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Noise Variance Discontinuity</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Consistent Single-Sensor Noise</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        
        {/* Noise Map Image */}
        <div className="relative h-[360px] w-full bg-navy-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
          <img
            src={noiseMapUrl}
            alt="Noise Variance Map"
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute top-4 left-4 bg-navy-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
            Viridis Colormap (Local Variance)
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="space-y-4">
          
          <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
              Sensor Noise Consistency Finding
            </span>
            <p className="text-sm font-medium text-slate-200">
              {noiseSummary.finding_summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Dispersion (CV)</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {noiseSummary.coefficient_of_variation}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {noiseSummary.coefficient_of_variation > 1.2 ? '⚠️ High variance' : '✓ Normal spread'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Mean Sensor Noise</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {noiseSummary.mean_sensor_noise_var}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Baseline residual power</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Noise Deviation</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {noiseSummary.noise_variance_std}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Regional standard dev</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Inconsistency Score</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {noiseSummary.noise_inconsistency_score}/100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Splicing anomaly score</div>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-navy-950/40 border border-slate-800/60 text-xs text-slate-400">
            <Info className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p>
              When a subject is cut from an image shot under low light and pasted onto a daylight background, or smoothed with an AI tool, the high-frequency residual displays abrupt boundary boundaries in the variance matrix.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
