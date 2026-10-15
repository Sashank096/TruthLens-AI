import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BackendStatusBanner } from './components/BackendStatusBanner';
import { Dashboard } from './pages/Dashboard';
import { NewInvestigation } from './pages/NewInvestigation';
import { CaseDetail } from './pages/CaseDetail';
import { QuickScan } from './pages/QuickScan';
import { ReferenceCorpus } from './pages/ReferenceCorpus';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Sync dark class to root document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#060a12';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f8fafc';
    }
  }, [isDark]);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('case-detail');
  };

  const handleCaseCreated = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('case-detail');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-navy-950 text-slate-100' : 'bg-slate-50 text-slate-900'} transition-colors`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
      />

      {/* Backend Engine Status Banner */}
      <BackendStatusBanner onEngineChange={() => setRefreshKey(prev => prev + 1)} />

      {/* Main Content Area */}
      <main className="pb-16" key={refreshKey}>
        {activeTab === 'dashboard' && (
          <Dashboard
            onSelectCase={handleSelectCase}
            onNewCase={() => setActiveTab('new-investigation')}
            onQuickScan={() => setActiveTab('quick-scan')}
          />
        )}

        {activeTab === 'new-investigation' && (
          <NewInvestigation
            onCaseCreated={handleCaseCreated}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'case-detail' && selectedCaseId && (
          <CaseDetail
            caseId={selectedCaseId}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'quick-scan' && (
          <QuickScan />
        )}

        {activeTab === 'reference-corpus' && (
          <ReferenceCorpus />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-navy-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            TRUTHLENS AI FORENSIC PLATFORM • DIGITAL EVIDENCE & AUTHENTICITY EVALUATION
          </div>
          <div className="text-[11px] text-slate-400">
            Assists investigations • Non-accusatory algorithmic analysis
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
