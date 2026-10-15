import React from 'react';
import { CheckCircle2, Cpu, ShieldCheck, HelpCircle, ExternalLink, Sparkles } from 'lucide-react';
import { VerifiedFact, ForensicEstimate } from '../types';

interface VerifiedFactsCardProps {
  verifiedFacts: VerifiedFact[];
  estimates: ForensicEstimate[];
}

export const VerifiedFactsCard: React.FC<VerifiedFactsCardProps> = ({
  verifiedFacts = [],
  estimates = []
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Panel 1: Verified Cryptographic & Header Facts */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Verified Facts</h3>
              <p className="text-[11px] text-slate-400 font-mono">Deterministic Cryptographic & Header Truths</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            {verifiedFacts.length} CONFIRMED
          </span>
        </div>

        <div className="space-y-3">
          {verifiedFacts.map((vf, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-navy-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                  {vf.category}
                </span>
                <span className="flex items-center space-x-1 text-[10px] font-mono text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{vf.status}</span>
                </span>
              </div>
              <p className="text-xs text-slate-200 font-mono break-all leading-relaxed">
                {vf.fact}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Panel 2: Forensic Estimates & Statistical Heuristics */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Forensic Estimates</h3>
              <p className="text-[11px] text-slate-400 font-mono">Algorithmic & Statistical Heuristic Models</p>
            </div>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            {estimates.length} EVALUATED
          </span>
        </div>

        <div className="space-y-3">
          {estimates.map((est, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-navy-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-violet-300">
                  {est.layer}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Confidence: <strong className="text-cyan-400">{est.confidence}</strong>
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mb-1">
                {est.estimate}
              </p>
              <p className="text-[11px] text-slate-400 italic">
                {est.interpretation}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
