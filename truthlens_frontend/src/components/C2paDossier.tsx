import React from 'react';
import { Award, CheckCircle2, AlertCircle, ShieldAlert, FileText, Info, HelpCircle } from 'lucide-react';
import { C2paSummary } from '../types';

interface C2paDossierProps {
  c2pa: C2paSummary;
}

export const C2paDossier: React.FC<C2paDossierProps> = ({ c2pa }) => {
  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-violet-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Content Authenticity & C2PA Provenance</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-violet-500/10 text-violet-400 border border-violet-500/30 rounded">
              CONTENT CREDENTIALS JUMBF
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Verifies cryptographic digital provenance manifests, claim generator signatures, and certified edit histories (C2PA / CAI).
          </p>
        </div>

        {/* Validation Status Badge */}
        <div>
          {c2pa?.c2pa_present ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{c2pa.status}</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>No C2PA Manifest Found</span>
            </span>
          )}
        </div>
      </div>

      {c2pa?.c2pa_present ? (
        /* Manifest Details */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Claim Generator</span>
              <div className="text-sm font-bold text-white">{c2pa.claim_generator || 'Unknown Tool'}</div>
              <div className="text-[11px] text-slate-500">Signing application identity</div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Certifying Authority</span>
              <div className="text-sm font-bold text-cyan-400">{c2pa.issuer || 'Trust Anchor / Self-Signed'}</div>
              <div className="text-[11px] text-slate-500">Digital certificate issuer</div>
            </div>

            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400">Manifest Timestamp</span>
              <div className="text-sm font-bold text-white">{c2pa.time || 'N/A'}</div>
              <div className="text-[11px] text-slate-500">Cryptographically bound time</div>
            </div>

          </div>

          {/* Edit Actions List */}
          {c2pa.actions && c2pa.actions.length > 0 && (
            <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold font-mono uppercase tracking-wider text-violet-400">
                Recorded Assertion Actions ({c2pa.actions.length})
              </span>
              <div className="space-y-2">
                {c2pa.actions.map((act, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-navy-900 border border-slate-800 text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-white capitalize">{act.action}</strong>
                      <span className="text-slate-400 ml-2">via {act.softwareAgent || 'Unknown Agent'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-violet-500/20 text-violet-300">
                      C2PA Assertion
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Transparent Fallback & Educational Guidance */
        <div className="p-5 rounded-xl bg-navy-950/60 border border-slate-800 space-y-3">
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Honest Evaluation & Actionable Fallback Note</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {c2pa.verified_fact_note}
          </p>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-800/80 space-y-1">
            <div className="font-semibold text-slate-300">Why are C2PA credentials absent?</div>
            <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
              <li>Most consumer smartphone cameras do not yet embed hardware C2PA signatures by default.</li>
              <li>Social media platforms (Twitter/X, WhatsApp, Instagram, Telegram) routinely strip all EXIF, XMP, and JUMBF metadata boxes during image compression.</li>
              <li>Absence of C2PA is <strong>normal baseline behavior</strong> and does not alone imply fraudulent tampering.</li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};
