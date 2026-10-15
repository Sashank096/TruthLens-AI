import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, FileText, Activity, PlusCircle, 
  Search, ArrowRight, ExternalLink, HardDrive, Cpu, CheckCircle2 
} from 'lucide-react';
import { Case } from '../types';
import { getApiBaseUrl } from '../services/api';
import { getLocalCases } from '../services/browserForensics';

interface DashboardProps {
  onSelectCase: (caseId: string) => void;
  onNewCase: () => void;
  onQuickScan: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onSelectCase,
  onNewCase,
  onQuickScan
}) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCases = async () => {
    const base = getApiBaseUrl();
    let combinedCases: Case[] = [...getLocalCases()];

    try {
      const res = await fetch(`${base}/api/cases`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          const serverCases: Case[] = data.cases || [];
          
          // Merge avoiding duplicates
          const serverIds = new Set(serverCases.map(c => c.id));
          const uniqueLocals = combinedCases.filter(c => !serverIds.has(c.id));
          combinedCases = [...serverCases, ...uniqueLocals];
        }
      }
    } catch (err) {
      // Backend offline, fallback to local cases
    } finally {
      setCases(combinedCases);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const totalCases = cases.length;
  const highRiskCases = cases.filter(c => (c.latest_risk_score || 0) >= 60).length;
  const totalEvidence = cases.reduce((acc, c) => acc + (c.evidence_count || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Hero Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-slate-800 p-8 shadow-2xl overflow-hidden cyber-grid">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -bottom-20 w-80 h-80 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>AI-POWERED DIGITAL FORENSICS PLATFORM</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Investigate the image. <br className="hidden sm:block" />
            Discover the evidence. <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">Verify the source.</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            TruthLens AI provides multi-layer digital forensics: Error Level Analysis, 2D FFT frequency decomposition, sensor noise variance, C2PA Content Credentials provenance, and perceptual reverse image search into one unified, courtroom-ready investigation workflow.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onNewCase}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Initiate Investigation Case</span>
            </button>

            <button
              onClick={onQuickScan}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-navy-950 hover:bg-slate-800/80 text-slate-200 border border-slate-700/80 font-semibold text-xs tracking-wide transition-all"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Fast Triage Quick-Scan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Active Cases</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{totalCases}</div>
          <div className="text-[11px] text-slate-500 mt-1">Total open case dossiers</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Preserved Evidence</span>
            <HardDrive className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-2">{totalEvidence}</div>
          <div className="text-[11px] text-slate-500 mt-1">SHA-256 hashed items in vault</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">High-Risk Detections</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-2">{highRiskCases}</div>
          <div className="text-[11px] text-slate-500 mt-1">Cases with manipulation indicators</div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-mono uppercase tracking-wider">Forensic Suite</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">7 Layers</div>
          <div className="text-[11px] text-slate-500 mt-1">ELA, FFT, Noise, C2PA, EXIF, Hash</div>
        </div>

      </div>

      {/* Recent Cases Table */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        <div className="p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Investigation Cases</h3>
            <p className="text-xs text-slate-400">
              Select any active case to view its forensic workspace, heatmaps, and evidence logs.
            </p>
          </div>

          <button
            onClick={onNewCase}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 font-mono text-xs">
            Loading investigation cases...
          </div>
        ) : cases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-navy-950/80 text-slate-400 font-mono uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Case Number & Title</th>
                  <th className="px-5 py-3.5">Lead Examiner</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Evidence Items</th>
                  <th className="px-5 py-3.5">Latest Risk Evaluation</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {cases.map((c) => {
                  const score = c.latest_risk_score ?? null;
                  let scoreBadge = "bg-slate-800 text-slate-400 border-slate-700";
                  if (score !== null) {
                    if (score >= 70) scoreBadge = "bg-red-500/10 text-red-400 border-red-500/30";
                    else if (score >= 45) scoreBadge = "bg-amber-500/10 text-amber-400 border-amber-500/30";
                    else if (score >= 20) scoreBadge = "bg-blue-500/10 text-blue-400 border-blue-500/30";
                    else scoreBadge = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
                  }

                  return (
                    <tr
                      key={c.id}
                      onClick={() => onSelectCase(c.id)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono text-[11px] text-cyan-400 font-bold">{c.case_number}</div>
                        <div className="text-white font-medium text-xs mt-0.5">{c.title}</div>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {c.examiner}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                          c.priority === 'Critical' || c.priority === 'High'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}>
                          {c.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-300">
                        {c.evidence_count || 0} file(s)
                      </td>

                      <td className="px-5 py-4">
                        {score !== null ? (
                          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold border ${scoreBadge}`}>
                            <span>{score.toFixed(1)}/100</span>
                            <span className="text-[10px] opacity-80">({c.latest_risk_level || 'Evaluated'})</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] italic">Pending Ingestion</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCase(c.id);
                          }}
                          className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-colors inline-flex items-center space-x-1"
                        >
                          <span>Open Lab</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-semibold text-white">No Forensic Cases Created Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Initiate your first investigation case to upload evidence, preserve SHA-256 hashes, and run automated multi-layer analysis.
            </p>
            <button
              onClick={onNewCase}
              className="mt-2 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create First Case</span>
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
