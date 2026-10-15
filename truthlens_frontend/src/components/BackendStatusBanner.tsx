import React, { useState, useEffect } from 'react';
import { Server, CheckCircle2, AlertCircle, Settings, RefreshCw, X, Link, Cpu } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';

interface BackendStatusBannerProps {
  onEngineChange?: () => void;
}

export const BackendStatusBanner: React.FC<BackendStatusBannerProps> = ({ onEngineChange }) => {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [latency, setLatency] = useState<number | undefined>(undefined);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [apiUrlInput, setApiUrlInput] = useState<string>('');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const health = await checkBackendHealth();
      setIsOnline(health.online);
      setLatency(health.latencyMs);
      if (health.online) {
        setTestResult({
          success: true,
          message: `Connected successfully! Latency: ${health.latencyMs}ms. OpenCV & ReportLab active.`
        });
      } else {
        setTestResult({
          success: false,
          message: "Could not reach backend API at this URL. Make sure CORS is allowed and the server is running."
        });
      }
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    setApiUrlInput(getApiBaseUrl());
    testConnection();
  }, []);

  const handleSave = async () => {
    setApiBaseUrl(apiUrlInput);
    await testConnection();
    if (onEngineChange) onEngineChange();
  };

  return (
    <>
      {/* Banner / Status Indicator */}
      <div className="bg-navy-900/90 border-b border-slate-800/80 px-4 py-2 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>FastAPI Backend Online</span>
              {latency && <span className="text-slate-500">({latency}ms)</span>}
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>In-Browser Client Forensic Engine Active (Zero-Setup Mode)</span>
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setApiUrlInput(getApiBaseUrl());
            setShowModal(true);
          }}
          className="flex items-center space-x-1 text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-3 h-3 text-cyan-400" />
          <span>API Settings</span>
        </button>
      </div>

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm">
          <div className="bg-navy-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-white font-bold text-sm">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>TruthLens Backend API Configuration</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When deployed to Vercel or cloud hosts, you can connect your deployed FastAPI backend (e.g. on Render, Railway, Fly.io, or localhost). If no cloud backend is specified, TruthLens automatically uses its built-in client-side engine!
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Backend API Base URL:
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="e.g. https://truthlens-api.onrender.com or http://127.0.0.1:8000"
                  value={apiUrlInput}
                  onChange={(e) => setApiUrlInput(e.target.value)}
                  className="flex-1 bg-navy-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={testConnection}
                  disabled={isTesting}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Leave blank to use default relative paths or in-browser fallback.
              </div>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl text-xs font-mono flex items-start space-x-2 border ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs transition-colors"
              >
                Save & Apply
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
