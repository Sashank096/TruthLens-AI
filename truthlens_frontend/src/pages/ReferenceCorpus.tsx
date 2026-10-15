import React, { useEffect, useState } from 'react';
import { Database, ExternalLink, Calendar, Hash, ShieldCheck, AlertTriangle } from 'lucide-react';
import { getApiBaseUrl, resolveAssetUrl } from '../services/api';
import { BROWSER_BENCHMARKS } from '../services/browserForensics';

interface ReferenceBenchmark {
  id: string;
  filename: string;
  title: string;
  source_url: string;
  source_domain: string;
  publish_date: string;
  category: string;
  notes: string;
  type: string;
  image_url?: string;
}

export const ReferenceCorpus: React.FC = () => {
  const [items, setItems] = useState<ReferenceBenchmark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = getApiBaseUrl();
    fetch(`${base}/api/reference/list`, { signal: AbortSignal.timeout(5000) })
      .then(res => {
        if (!res.ok) throw new Error("Backend unavailable");
        return res.json();
      })
      .then(data => {
        if (data.items && data.items.length > 0) {
          setItems(data.items);
        } else {
          fallbackToBenchmarks();
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Failed to load reference corpus from backend, using benchmark index:", err);
        fallbackToBenchmarks();
        setLoading(false);
      });

    function fallbackToBenchmarks() {
      const benchmarkItems: ReferenceBenchmark[] = BROWSER_BENCHMARKS.map((b) => ({
        id: b.id,
        filename: b.id,
        title: b.title,
        source_url: b.source_url,
        source_domain: b.source_domain,
        publish_date: b.publish_date,
        category: b.category,
        notes: b.notes,
        type: b.category.toLowerCase().includes('original') ? 'original' : 'spliced',
        image_url: b.thumbnail_url
      }));
      setItems(benchmarkItems);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-2">
          <Database className="w-3.5 h-3.5" />
          <span>REFERENCE INDEX & EVIDENCE DATABASE</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Forensic Benchmark Index & Source Corpus
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Catalog of benchmark originals, known spliced press variations, and synthetic diffusion patterns used for perceptual reverse image discovery.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs">
          Loading reference index...
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-navy-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col hover:border-slate-700 transition-colors"
            >
              <div className="h-44 w-full bg-navy-950 relative border-b border-slate-800">
                <img
                  src={item.image_url ? item.image_url : resolveAssetUrl(`/api/reference/file/${item.filename}`)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  item.type === 'original'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : item.type === 'spliced'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                }`}>
                  {item.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-cyan-400 font-bold">{item.id}</div>
                  <h3 className="text-sm font-bold text-white line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.notes}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs font-mono text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Source:</span>
                    <span className="text-slate-200">{item.source_domain}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span>{new Date(item.publish_date).toLocaleDateString()}</span>
                  </div>
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between pt-1 text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>View Archival Wire</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 font-mono text-xs">
          No reference benchmark items cataloged.
        </div>
      )}

    </div>
  );
};
