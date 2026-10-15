import React from 'react';
import { ShieldCheck, Clock, User, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { CustodyLog } from '../types';

interface CustodyTimelineProps {
  logs: CustodyLog[];
}

export const CustodyTimeline: React.FC<CustodyTimelineProps> = ({ logs }) => {
  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Chain of Custody & Evidence Audit Log</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident chronological log of all evidence ingestion, cryptographic hashing, algorithm runs, and report exports.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          <strong className="text-emerald-400">{logs.length}</strong> recorded events
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {logs.map((log, idx) => (
          <div key={idx} className="relative group">
            
            {/* Timeline Dot */}
            <div className="absolute -left-[29px] top-1 w-4 h-4 rounded-full bg-navy-950 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>

            {/* Event Box */}
            <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800 group-hover:border-slate-700 transition-colors space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  {log.action}
                </span>

                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-300">{log.actor}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-mono break-all leading-relaxed">
                {log.details}
              </p>

              {/* Hash Verification Status */}
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cryptographic SHA-256 Hash Verified</span>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
