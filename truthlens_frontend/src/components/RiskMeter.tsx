import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, ShieldCheck, Info } from 'lucide-react';

interface RiskMeterProps {
  score: number;
  level: string;
  verdict: string;
  confidence: string;
  redFlags: string[];
}

export const RiskMeter: React.FC<RiskMeterProps> = ({
  score,
  level,
  verdict,
  confidence,
  redFlags
}) => {
  // Determine color theme based on score
  let strokeColor = "#10b981"; // Emerald
  let badgeBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  let Icon = ShieldCheck;

  if (score >= 70) {
    strokeColor = "#ef4444"; // Crimson
    badgeBg = "bg-red-500/10 text-red-400 border-red-500/30";
    Icon = ShieldAlert;
  } else if (score >= 45) {
    strokeColor = "#f59e0b"; // Amber
    badgeBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
    Icon = AlertTriangle;
  } else if (score >= 20) {
    strokeColor = "#3b82f6"; // Blue
    badgeBg = "bg-blue-500/10 text-blue-400 border-blue-500/30";
    Icon = Info;
  }

  // Circular progress calculation
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-navy-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Background ambient glow */}
      <div 
        className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: strokeColor }}
      />

      <div className="flex flex-col md:flex-row items-center gap-6">
        
        {/* Radial Gauge */}
        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
            {/* Background Track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="stroke-slate-800"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Progress Arc */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke={strokeColor}
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tighter">
              {score.toFixed(1)}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
              Risk Score
            </span>
          </div>
        </div>

        {/* Text Verdict & Details */}
        <div className="flex-1 space-y-3 text-center md:text-left">
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeBg}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{level}</span>
            </span>

            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-navy-950 text-slate-400 border border-slate-800">
              Confidence: <strong className="text-slate-200">{confidence}</strong>
            </span>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {verdict}
          </p>

          {/* Red flags list */}
          {redFlags && redFlags.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-1.5 font-semibold">
                Detected Forensic Red Flags ({redFlags.length})
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 shrink-0 font-bold">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
