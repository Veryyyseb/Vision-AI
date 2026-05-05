import { useState } from 'react';
import { Search, ScanSearch, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { formatTimestamp, formatConfidence, getConfidenceColor } from '../utils/analysis';

interface HistoryViewProps {
  history: AnalysisResult[];
  onDelete: (id: string) => void;
  onNavigate: (view: 'analyze') => void;
}

export default function HistoryView({ history, onDelete, onNavigate }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = history.filter((r) =>
    r.imageName.toLowerCase().includes(search.toLowerCase()) ||
    r.detections.some((d) => d.label.toLowerCase().includes(search.toLowerCase()))
  );

  if (history.length === 0) {
    return (
      <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-16 text-center">
        <ScanSearch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-white font-semibold mb-2">No history yet</h3>
        <p className="text-gray-400 text-sm mb-4">Start analyzing images to build your history</p>
        <button
          onClick={() => onNavigate('analyze')}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Analyze an Image
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by filename or label…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-500 outline-none"
        />
      </div>

      {/* Items */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 text-sm py-8">No results for "{search}"</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              {/* Header row */}
              <div className="flex items-center gap-3 p-4">
                <img
                  src={item.imageUrl}
                  alt={item.imageName}
                  className="w-12 h-12 rounded-lg object-cover bg-gray-800 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{item.imageName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatTimestamp(item.timestamp)} · {item.detections.length} objects · {(item.processingTime / 1000).toFixed(1)}s
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                  >
                    {expanded === item.id
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-gray-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === item.id && (
                <div className="border-t border-gray-800 px-4 pb-4 pt-3">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {item.detections.map((det) => (
                      <div key={det.id} className="bg-gray-800 rounded-lg p-2.5 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                          style={{ background: det.color }}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-white truncate">{det.label}</p>
                          <p className={`text-xs font-mono ${getConfidenceColor(det.confidence)}`}>
                            {formatConfidence(det.confidence)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-xs text-gray-500 text-right">
          Showing {filtered.length} of {history.length} analyses
        </p>
      )}
    </div>
  );
}
