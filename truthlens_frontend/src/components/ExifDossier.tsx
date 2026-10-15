import React, { useState } from 'react';
import { Camera, MapPin, AlertTriangle, CheckCircle, Search, ExternalLink, HardDrive, Info } from 'lucide-react';
import { MetadataSummary } from '../types';

interface ExifDossierProps {
  metadata: MetadataSummary;
}

export const ExifDossier: React.FC<ExifDossierProps> = ({ metadata }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const rawTags = Object.entries(metadata?.raw_tags || {});
  const filteredTags = rawTags.filter(([key, val]) =>
    key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(val).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-wide">Image Metadata & EXIF Dossier</h3>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
              CONTAINER FORENSICS
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Extracts camera sensor specifications, exposure settings, GPS coordinates, and embedded editing software markers.
          </p>
        </div>

        {/* Stripped or Present Badge */}
        <div>
          {metadata.metadata_stripped ? (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Metadata Stripped / Social Scrubbed</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Camera EXIF Header Intact</span>
            </span>
          )}
        </div>
      </div>

      {/* Primary Hardware & Software Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Camera Hardware Card */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Camera className="w-4 h-4" />
            <span>Camera Hardware</span>
          </div>
          <div className="text-sm font-bold text-white">
            {metadata.camera_make || metadata.camera_model ? (
              `${metadata.camera_make || ''} ${metadata.camera_model || ''}`.trim()
            ) : (
              <span className="text-slate-500 italic">No hardware tags found</span>
            )}
          </div>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Lens: <strong className="text-slate-200">{metadata.lens_model || 'Standard / Unlisted'}</strong></div>
            <div>Date/Time: <strong className="text-slate-200">{metadata.datetime_original || 'N/A'}</strong></div>
          </div>
        </div>

        {/* Exposure Settings Card */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-violet-400">
            <HardDrive className="w-4 h-4" />
            <span>Exposure Optics</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
            <div className="p-2 rounded bg-navy-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Aperture</span>
              <strong>{metadata.f_number || 'N/A'}</strong>
            </div>
            <div className="p-2 rounded bg-navy-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Shutter</span>
              <strong>{metadata.exposure_time || 'N/A'}</strong>
            </div>
            <div className="p-2 rounded bg-navy-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Sensitivity</span>
              <strong>{metadata.iso_speed || 'N/A'}</strong>
            </div>
            <div className="p-2 rounded bg-navy-900 border border-slate-800">
              <span className="text-slate-500 text-[10px] block">Focal Length</span>
              <strong>{metadata.focal_length || 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Software / Geospatial Card */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-slate-800 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-amber-400">
            <MapPin className="w-4 h-4" />
            <span>Software & Geospatial</span>
          </div>
          
          {/* Software Signature */}
          <div className="text-xs">
            {metadata.editing_software_detected ? (
              <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300">
                <span className="text-[10px] block font-mono text-red-400 font-bold uppercase">Software Signature Detected</span>
                <strong>{metadata.editing_software_name}</strong>
              </div>
            ) : (
              <div className="p-2 rounded bg-navy-900 border border-slate-800 text-slate-400">
                <span>No editing software signature in container headers</span>
              </div>
            )}
          </div>

          {/* GPS Coordinates */}
          <div className="text-xs font-mono pt-1">
            {metadata.gps ? (
              <a
                href={metadata.gps.maps_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors"
              >
                <span>GPS: {metadata.gps.latitude.toFixed(4)}, {metadata.gps.longitude.toFixed(4)}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            ) : (
              <div className="text-slate-500 text-xs italic">No embedded GPS coordinates</div>
            )}
          </div>
        </div>

      </div>

      {/* Searchable Raw Tags Table */}
      <div className="bg-navy-950/80 rounded-xl border border-slate-800 overflow-hidden">
        <div className="p-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-white flex items-center space-x-2">
            <span>Raw EXIF / TIFF Tag Register</span>
            <span className="text-slate-500 font-mono text-[11px]">({rawTags.length} tags)</span>
          </span>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tag name or value..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 font-mono text-xs">
          {filteredTags.length > 0 ? (
            filteredTags.map(([tagKey, tagVal], idx) => (
              <div key={idx} className="px-4 py-2 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <span className="text-cyan-400 font-medium shrink-0 pr-4">{tagKey}</span>
                <span className="text-slate-300 truncate text-right max-w-md">{String(tagVal)}</span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 italic">
              {rawTags.length === 0 ? "No raw EXIF tags present in this image." : "No tags match your search term."}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
