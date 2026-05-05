import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import AnalyzeView from './components/AnalyzeView';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import type { ActiveView, AnalysisResult, DashboardStats } from './types';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const handleResult = useCallback((result: AnalysisResult) => {
    setHistory((prev) => [result, ...prev]);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const stats: DashboardStats = (() => {
    const totalAnalyses = history.length;
    const allDetections = history.flatMap((r) => r.detections);
    const totalDetections = allDetections.length;
    const avgConfidence =
      totalDetections > 0
        ? allDetections.reduce((s, d) => s + d.confidence, 0) / totalDetections
        : 0;
    const avgProcessingTime =
      totalAnalyses > 0
        ? history.reduce((s, r) => s + r.processingTime, 0) / totalAnalyses
        : 0;
    return { totalAnalyses, totalDetections, avgConfidence, avgProcessingTime };
  })();

  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeView={activeView} />
        <main className="flex-1 overflow-y-auto p-6">
          {activeView === 'dashboard' && (
            <DashboardView
              history={history}
              stats={stats}
              onNavigate={setActiveView}
            />
          )}
          {activeView === 'analyze' && (
            <AnalyzeView onResult={handleResult} />
          )}
          {activeView === 'history' && (
            <HistoryView
              history={history}
              onDelete={handleDelete}
              onNavigate={setActiveView}
            />
          )}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}
