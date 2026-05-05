import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { AnalysisResult, DashboardStats } from '../types';
import StatCard from './StatCard';
import { ScanSearch, Target, Zap, Clock } from 'lucide-react';
import { formatTimestamp, formatConfidence } from '../utils/analysis';

interface DashboardViewProps {
  history: AnalysisResult[];
  stats: DashboardStats;
  onNavigate: (view: 'analyze') => void;
}

export default function DashboardView({ history, stats, onNavigate }: DashboardViewProps) {
  const recentItems = history.slice(0, 5);

  const chartData = history.slice(-7).map((r) => ({
    name: r.imageName.length > 10 ? r.imageName.slice(0, 10) + '…' : r.imageName,
    detections: r.detections.length,
    confidence: Math.round(
      (r.detections.reduce((s, d) => s + d.confidence, 0) /
        Math.max(r.detections.length, 1)) *
        100
    ),
  }));

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Analyses"
          value={stats.totalAnalyses}
          subtitle="Images processed"
          icon={ScanSearch}
          color="text-violet-400"
          bgColor="bg-violet-500/10"
        />
        <StatCard
          title="Objects Detected"
          value={stats.totalDetections}
          subtitle="Across all images"
          icon={Target}
          color="text-blue-400"
          bgColor="bg-blue-500/10"
        />
        <StatCard
          title="Avg. Confidence"
          value={`${(stats.avgConfidence * 100).toFixed(1)}%`}
          subtitle="Detection accuracy"
          icon={Zap}
          color="text-green-400"
          bgColor="bg-green-500/10"
        />
        <StatCard
          title="Avg. Processing"
          value={`${(stats.avgProcessingTime / 1000).toFixed(1)}s`}
          subtitle="Per image"
          icon={Clock}
          color="text-yellow-400"
          bgColor="bg-yellow-500/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Detections per Analysis</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f3f4f6' }}
                  itemStyle={{ color: '#a78bfa' }}
                />
                <Bar dataKey="detections" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart onNavigate={onNavigate} />
          )}
        </div>

        {/* Recent activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Recent Activity</h2>
          {recentItems.length > 0 ? (
            <div className="space-y-3">
              {recentItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <img
                    src={item.imageUrl}
                    alt={item.imageName}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-white truncate">{item.imageName}</p>
                    <p className="text-xs text-gray-500">
                      {item.detections.length} objects · {formatTimestamp(item.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No analyses yet</p>
          )}
        </div>
      </div>

      {/* Label distribution */}
      {history.length > 0 && (
        <LabelDistribution history={history} />
      )}

      {history.length === 0 && (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-12 text-center">
          <ScanSearch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No data yet</h3>
          <p className="text-gray-400 text-sm mb-4">Analyze your first image to see stats here</p>
          <button
            onClick={() => onNavigate('analyze')}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Analyze an Image
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyChart({ onNavigate }: { onNavigate: (v: 'analyze') => void }) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center gap-2">
      <p className="text-gray-500 text-sm">No data to display</p>
      <button
        onClick={() => onNavigate('analyze')}
        className="text-violet-400 text-xs hover:text-violet-300 underline"
      >
        Analyze an image
      </button>
    </div>
  );
}

function LabelDistribution({ history }: { history: AnalysisResult[] }) {
  const counts: Record<string, number> = {};
  history.forEach((r) => r.detections.forEach((d) => { counts[d.label] = (counts[d.label] || 0) + 1; }));
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const max = sorted[0]?.[1] ?? 1;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Top Detected Labels</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {sorted.map(([label, count]) => (
          <div key={label} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-24 flex-shrink-0 truncate">{label}</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          Avg confidence: <span className="text-green-400 font-medium">
            {formatConfidence(
              history.flatMap((r) => r.detections).reduce((s, d) => s + d.confidence, 0) /
              Math.max(history.flatMap((r) => r.detections).length, 1)
            )}
          </span>
        </p>
      </div>
    </div>
  );
}
