import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, Download, Eye, FileText, Flame, Waves, Radio, 
  Camera, Award, Search, ShieldCheck, Clock, Save, Edit3, CheckCircle2, AlertTriangle, ExternalLink, Printer
} from 'lucide-react';
import { Case, ForensicResult } from '../types';
import { RiskMeter } from '../components/RiskMeter';
import { VerifiedFactsCard } from '../components/VerifiedFactsCard';
import { ElaViewer } from '../components/ElaViewer';
import { FftViewer } from '../components/FftViewer';
import { NoiseViewer } from '../components/NoiseViewer';
import { ExifDossier } from '../components/ExifDossier';
import { C2paDossier } from '../components/C2paDossier';
import { CandidateMatches } from '../components/CandidateMatches';
import { CustodyTimeline } from '../components/CustodyTimeline';
import { getApiBaseUrl, resolveAssetUrl } from '../services/api';
import { getLocalCaseById, saveLocalCase } from '../services/browserForensics';

interface CaseDetailProps {
  caseId: string;
  onBack: () => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ caseId, onBack }) => {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Investigator notes state
  const [notes, setNotes] = useState<string>('');
  const [caseStatus, setCaseStatus] = useState<string>('Under Investigation');
  const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const fetchCaseDetails = async () => {
    const base = getApiBaseUrl();
    try {
      const res = await fetch(`${base}/api/cases/${caseId}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const data = await res.json();
          setCaseData(data.case);
          setNotes(data.case.notes || '');
          setCaseStatus(data.case.status || 'Under Investigation');
          return;
        }
      }
    } catch (err) {
      // Fallback
    }

    // Try local storage
    const local = getLocalCaseById(caseId);
    if (local) {
      setCaseData(local);
      setNotes(local.notes || '');
      setCaseStatus(local.status || 'Under Investigation');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [caseId]);

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    const base = getApiBaseUrl();
    try {
      const formData = new FormData();
      formData.append('notes', notes);
      formData.append('status', caseStatus);
      const res = await fetch(`${base}/api/cases/${caseId}`, {
        method: 'PATCH',
        body: formData,
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      // Save locally
      if (caseData) {
        const updated = { ...caseData, notes, status: caseStatus, updated_at: new Date().toISOString() };
        saveLocalCase(updated);
        setCaseData(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleRecomputeEla = async (quality: number, scale: number) => {
    if (!caseData || !caseData.evidence || caseData.evidence.length === 0) return;
    const evidence = caseData.evidence[0];
    const base = getApiBaseUrl();
    
    try {
      const formData = new FormData();
      formData.append('storage_rel_path', evidence.storage_rel_path);
      formData.append('quality', quality.toString());
      formData.append('scale_factor', scale.toString());

      const res = await fetch(`${base}/api/forensics/recompute-ela`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (caseData.forensic_results && caseData.forensic_results.length > 0) {
          const updated = { ...caseData };
          updated.forensic_results![0].ela_summary = data.ela;
          setCaseData(updated);
        }
      }
    } catch {
      // Local recompute adjustment
      if (caseData.forensic_results && caseData.forensic_results.length > 0) {
        const updated = { ...caseData };
        updated.forensic_results![0].ela_summary.quality_evaluated = quality;
        updated.forensic_results![0].ela_summary.scale_factor = scale;
        setCaseData(updated);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400 font-mono text-xs">
        Loading digital forensics lab environment...
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-white font-bold text-sm">Case Not Found</h3>
        <button onClick={onBack} className="text-xs text-cyan-400 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const forensicResult: ForensicResult | undefined = caseData.forensic_results?.[0];
  const evidenceItem = caseData.evidence?.[0];
  const originalImageUrl = evidenceItem ? resolveAssetUrl(evidenceItem.storage_rel_path) : '';
  const base = getApiBaseUrl();

  const tabs = [
    { id: 'overview', label: 'Executive Synthesis', icon: ShieldCheck },
    { id: 'ela', label: 'Error Level Analysis', icon: Flame },
    { id: 'fft', label: '2D FFT Spectrum', icon: Waves },
    { id: 'noise', label: 'Sensor Noise', icon: Radio },
    { id: 'exif', label: 'EXIF & GPS Dossier', icon: Camera },
    { id: 'c2pa', label: 'C2PA Provenance', icon: Award },
    { id: 'candidates', label: 'Reverse Matches', icon: Search },
    { id: 'custody', label: 'Chain of Custody', icon: Clock },
    { id: 'report', label: 'Courtroom PDF Report', icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb & Case Dossier Header */}
      <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
            <a
              href={`${base}/api/reports/${caseData.id}/pdf`}
              download
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs tracking-wide shadow-md shadow-cyan-500/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF Report</span>
            </a>
            <a
              href={`${base}/api/reports/${caseData.id}/preview`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </a>
          </div>
        </div>

        {/* Title, Case Number & Examiner Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                {caseData.case_number}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 border border-slate-700">
                PRIORITY: {caseData.priority.toUpperCase()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {caseData.title}
            </h1>
            <div className="text-xs text-slate-400 font-mono flex flex-wrap gap-4 pt-1">
              <span>Examiner: <strong className="text-slate-200">{caseData.examiner}</strong></span>
              <span>Opened: <strong className="text-slate-200">{new Date(caseData.created_at).toLocaleString()}</strong></span>
              {evidenceItem && (
                <span>SHA-256: <strong className="text-cyan-400">{evidenceItem.sha256_hash.slice(0, 16)}...</strong></span>
              )}
            </div>
          </div>

          {/* Status selector */}
          <div className="flex items-center space-x-2 bg-navy-950 p-2 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400">Status:</span>
            <select
              value={caseStatus}
              onChange={(e) => setCaseStatus(e.target.value)}
              className="bg-navy-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Under Investigation">Under Investigation</option>
              <option value="Evidence Verified">Evidence Verified</option>
              <option value="Tampering Confirmed">Tampering Confirmed</option>
              <option value="Closed - Inconclusive">Closed - Inconclusive</option>
            </select>
          </div>
        </div>

      </div>

      {/* Forensic Laboratory Workspace Tabs */}
      <div className="border-b border-slate-800 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-2 min-w-max pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Contents */}
      {forensicResult ? (
        <div className="space-y-6">
          
          {/* TAB 1: EXECUTIVE SYNTHESIS & OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <RiskMeter
                score={forensicResult.risk_score}
                level={forensicResult.risk_level}
                verdict={forensicResult.summary_verdict}
                confidence={forensicResult.confidence_rating}
                redFlags={forensicResult.red_flags}
              />

              <VerifiedFactsCard
                verifiedFacts={forensicResult.verified_facts}
                estimates={forensicResult.estimates}
              />

              {/* Legal Non-Accusatory Disclaimer Box */}
              <div className="p-4 rounded-xl bg-navy-950/70 border border-slate-800/80 text-xs text-slate-400 leading-relaxed">
                <span className="font-bold text-slate-300 block mb-1">
                  LEGAL & FORENSIC METHODOLOGY PRINCIPLE:
                </span>
                {forensicResult.legal_disclaimer}
              </div>
            </div>
          )}

          {/* TAB 2: ERROR LEVEL ANALYSIS */}
          {activeTab === 'ela' && (
            <ElaViewer
              originalImageUrl={originalImageUrl}
              elaSummary={forensicResult.ela_summary}
              storageRelPath={forensicResult.storage_rel_path}
              onRecomputeEla={handleRecomputeEla}
            />
          )}

          {/* TAB 3: 2D FFT FREQUENCY SPECTRUM */}
          {activeTab === 'fft' && (
            <FftViewer fftSummary={forensicResult.fft_summary} />
          )}

          {/* TAB 4: SENSOR NOISE */}
          {activeTab === 'noise' && (
            <NoiseViewer noiseSummary={forensicResult.noise_summary} />
          )}

          {/* TAB 5: EXIF & GPS DOSSIER */}
          {activeTab === 'exif' && (
            <ExifDossier metadata={forensicResult.metadata_summary} />
          )}

          {/* TAB 6: C2PA PROVENANCE */}
          {activeTab === 'c2pa' && (
            <C2paDossier c2pa={forensicResult.c2pa_summary} />
          )}

          {/* TAB 7: REVERSE MATCHES & CANDIDATE SOURCES */}
          {activeTab === 'candidates' && (
            <CandidateMatches
              originalImageUrl={originalImageUrl}
              candidates={forensicResult.candidate_matches || []}
            />
          )}

          {/* TAB 8: CHAIN OF CUSTODY & INVESTIGATOR NOTES */}
          {activeTab === 'custody' && (
            <div className="space-y-6">
              <CustodyTimeline logs={caseData.custody_logs || []} />

              {/* Investigator Notes Editor */}
              <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <Edit3 className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Investigator Observations & Case Log
                    </h3>
                  </div>
                  {saveSuccess && (
                    <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Notes Saved Successfully</span>
                    </span>
                  )}
                </div>

                <textarea
                  rows={5}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record formal forensic observations, witness accounts, or case findings here..."
                  className="w-full bg-navy-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSavingNotes}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs tracking-wide transition-colors disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingNotes ? 'Saving...' : 'Update Case Notes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: COURTROOM-READY PDF REPORT */}
          {activeTab === 'report' && (
            <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">Courtroom-Grade Forensic Evidence Report</h3>
                  <p className="text-xs text-slate-400">
                    Includes complete chain of custody, high-res embedded heatmaps, verified facts, and legal notices.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Report</span>
                  </button>
                  <a
                    href={`${base}/api/reports/${caseData.id}/pdf`}
                    download
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Formal PDF</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF Viewer */}
              <div className="h-[750px] w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                <iframe
                  src={`${base}/api/reports/${caseData.id}/preview`}
                  title="Forensic PDF Preview"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-navy-900 border border-slate-800 rounded-2xl space-y-3">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Evidence Ingested in this Case</h3>
          <p className="text-xs text-slate-500">
            Please ingest an evidence image to populate forensic analysis layers.
          </p>
        </div>
      )}

    </div>
  );
};
