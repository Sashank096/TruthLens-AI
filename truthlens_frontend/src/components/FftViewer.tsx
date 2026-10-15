import React from 'react';
import { Waves, Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { FftSummary } from '../types';

interface FftViewerProps {
  fftSummary: FftSummary;
}

export const FftViewer: React.FC<FftViewerProps> = ({ fftSummary }) => {
  const spectrogramUrl = `/vault/${fftSummary.fft_artifact_rel_path}`;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-bold text-white tracking-wide">2D Fast Fourier Transform (FFT)</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded">
              FREQUENCY DOMAIN SPECTRUM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reveals periodic resampling grids, scaling interpolation artifacts, and generative AI diffusion lattice harmonics.
          </p>
        </div>

        {/* Periodic Lattice Badge */}
        <div>
          {fftSummary.periodic_lattice_detected ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Periodic Lattice Detected</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Natural Continuous Spectrum</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Spectrogram Image & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        
        {/* Spectrogram Canvas/Image */}
        <div className="relative h-[360px] w-full bg-navy-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-2">
          <img
            src={spectrogramUrl}
            alt="2D FFT Spectrogram"
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          />
          <div className="absolute top-4 left-4 bg-navy-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] font-mono text-violet-300 border border-violet-500/30">
            Log Magnitude Power Spectrum
          </div>
        </div>

        {/* Forensic Evaluation Cards */}
        <div className="space-y-4">
          
          <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 space-y-2">
            <span className="text-[11px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
              Spectral Analysis Finding
            </span>
            <p className="text-sm font-medium text-slate-200">
              {fftSummary.finding_summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Spectral Spikes</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {fftSummary.spectral_spikes_detected}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Isolated frequency peaks</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">AC Mean Energy</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {fftSummary.ac_mean_energy}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">High/Mid frequency power</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">Spectral Dispersion</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {fftSummary.ac_spectral_variance}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Magnitude deviation</div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950/70 border border-slate-800">
              <div className="text-[10px] uppercase font-mono text-slate-400">FFT Anomaly Score</div>
              <div className="text-xl font-bold font-mono text-violet-400 mt-1">
                {fftSummary.fft_anomaly_score}/100
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Lattice probability rating</div>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-navy-950/40 border border-slate-800/60 text-xs text-slate-400">
            <Info className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <p>
              Natural optical camera sensors exhibit isotropic (radially uniform) energy decay ($1/f^\alpha$). Synthetic upscalers, latent diffusion grids, or affine resamplings generate sharp geometric spikes and starburst lattice patterns.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
