import React, { useState } from 'react';
import { Search, ExternalLink, GitCompare, Layers, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { CandidateMatch } from '../types';
import { SplitSlider } from './SplitSlider';
import { DifferenceHeatmap } from './DifferenceHeatmap';

interface CandidateMatchesProps {
  originalImageUrl: string;
  candidates: CandidateMatch[];
}

export const CandidateMatches: React.FC<CandidateMatchesProps> = ({
  originalImageUrl,
  candidates
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMatch | null>(
    candidates.length > 0 ? candidates[0] : null
  );
  const [comparisonMode, setComparisonMode] = useState<'split' | 'heatmap'>('split');

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Source Discovery & Reverse Image Matches</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              REFERENCE INDEX & PERCEPTUAL MATCHING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Identifies source candidates, original wire images, or known doctored variations via multi-hash distance & visual feature matching.
          </p>
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-cyan-400">{Math.min(3, candidates.length)}</strong> candidate matches
        </div>
      </div>

      {candidates.length > 0 ? (
        <div className="space-y-6">
          
          {/* Candidate Cards Grid (Up to 3) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {candidates.slice(0, 3).map((cand, idx) => {
              const isSelected = selectedCandidate?.id === cand.id;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                      : 'bg-navy-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Candidate Thumbnail */}
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-navy-900 border border-slate-800 mb-3">
                    <img
                      src={cand.thumbnail_url}
                      alt={cand.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-navy-950/90 text-cyan-400 border border-cyan-500/30">
                      {cand.similarity_percentage}% MATCH
                    </div>
                  </div>

                  {/* Title and Category */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold truncate">
                        {cand.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {cand.source_domain}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1">
                      {cand.title}
                    </h4>

                    {/* Similarity Measurements */}
                    <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono text-slate-400">
                      <div className="bg-navy-900/80 p-1.5 rounded border border-slate-800 text-center">
                        <span className="block text-slate-500 text-[9px]">pHash Dist</span>
                        <strong className="text-cyan-300">{cand.phash_distance}</strong>
                      </div>
                      <div className="bg-navy-900/80 p-1.5 rounded border border-slate-800 text-center">
                        <span className="block text-slate-500 text-[9px]">SSIM</span>
                        <strong className="text-amber-300">{cand.ssim}</strong>
                      </div>
                      <div className="bg-navy-900/80 p-1.5 rounded border border-slate-800 text-center">
                        <span className="block text-slate-500 text-[9px]">Features</span>
                        <strong className="text-violet-300">{cand.feature_matches}</strong>
                      </div>
                    </div>

                    {/* Source Link */}
                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={cand.source_url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                      >
                        <span className="truncate max-w-[150px]">Source Wire</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                      
                      {isSelected && (
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">
                          ACTIVE INSPECTION
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Comparison Studio for Selected Candidate */}
          {selectedCandidate && (
            <div className="space-y-4 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                    <GitCompare className="w-4 h-4 text-cyan-400" />
                    <span>Visual Comparison: Ingested Image vs. Candidate Source</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Comparing with candidate: <strong className="text-cyan-300">{selectedCandidate.title}</strong> ({selectedCandidate.relationship})
                  </p>
                </div>

                {/* Split vs Heatmap toggle */}
                <div className="flex items-center space-x-1 bg-navy-950 p-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setComparisonMode('split')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      comparisonMode === 'split'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Swipe Split Slider
                  </button>
                  <button
                    onClick={() => setComparisonMode('heatmap')}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      comparisonMode === 'heatmap'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Difference Heatmap
                  </button>
                </div>
              </div>

              {comparisonMode === 'split' ? (
                <SplitSlider
                  leftImage={originalImageUrl}
                  rightImage={selectedCandidate.thumbnail_url}
                  leftLabel="Ingested Evidence Image"
                  rightLabel={`Candidate: ${selectedCandidate.title}`}
                  heightClass="h-[460px]"
                />
              ) : (
                <DifferenceHeatmap
                  originalImage={originalImageUrl}
                  diffArtifactUrl={selectedCandidate.diff_artifact_rel_path ? `/vault/${selectedCandidate.diff_artifact_rel_path}` : null}
                  candidateImage={selectedCandidate.thumbnail_url}
                  candidateTitle={selectedCandidate.title}
                  similarityPct={selectedCandidate.similarity_percentage}
                  ssim={selectedCandidate.ssim}
                />
              )}

            </div>
          )}

        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-navy-950/50 rounded-xl border border-slate-800 space-y-2">
          <Search className="w-8 h-8 text-slate-500 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No Matching Candidates Found</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The perceptual hash distance between the uploaded image and the reference corpus exceeds standard match thresholds.
          </p>
        </div>
      )}

    </div>
  );
};
