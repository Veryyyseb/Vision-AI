import { useRef, useState, useCallback } from 'react';
import { Upload, X, Loader2, ScanSearch } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { simulateAnalysis, formatConfidence, getConfidenceColor } from '../utils/analysis';

interface AnalyzeViewProps {
  onResult: (result: AnalysisResult) => void;
}

type UploadState = 'idle' | 'loading' | 'done' | 'error';

export default function AnalyzeView({ onResult }: AnalyzeViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    setResult(null);
    setSelectedId(null);
    setUploadState('loading');

    const img = new Image();
    img.onload = async () => {
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      try {
        const res = await simulateAnalysis(url, file.name, img.naturalWidth, img.naturalHeight);
        setResult(res);
        setUploadState('done');
        onResult(res);
      } catch {
        setUploadState('error');
      }
    };
    img.src = url;
  }, [onResult]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    setPreview(null);
    setResult(null);
    setUploadState('idle');
    setSelectedId(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const selectedDetection = result?.detections.find((d) => d.id === selectedId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Upload / Preview */}
        <div className="xl:col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Image Input</h2>
            {preview && (
              <button onClick={clearImage} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {!preview ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`
                border-2 border-dashed rounded-xl cursor-pointer transition-colors
                flex flex-col items-center justify-center gap-3 p-12 min-h-60
                ${isDragging
                  ? 'border-violet-500 bg-violet-500/5'
                  : 'border-gray-700 hover:border-violet-600 hover:bg-gray-800/50'
                }
              `}
            >
              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">Drop an image here</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse — JPG, PNG, WebP, GIF</p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <ImageCanvas
                imageUrl={preview}
                result={result}
                selectedId={selectedId}
                canvasRef={canvasRef}
                imgSize={imgSize}
              />
              {uploadState === 'loading' && (
                <div className="absolute inset-0 bg-gray-950/60 rounded-lg flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                  <span className="text-sm text-white">Analyzing…</span>
                </div>
              )}
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>

        {/* Results panel */}
        <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-4">Detection Results</h2>

          {uploadState === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-10">
              <ScanSearch className="w-10 h-10 text-gray-700" />
              <p className="text-sm text-gray-500">Upload an image to start analysis</p>
            </div>
          )}

          {uploadState === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-sm text-gray-400">Processing image…</p>
              <p className="text-xs text-gray-600">{fileName}</p>
            </div>
          )}

          {uploadState === 'done' && result && (
            <>
              <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-400 truncate">{result.imageName}</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-300">
                    <span className="text-white font-medium">{result.detections.length}</span> objects found
                  </span>
                  <span className="text-xs text-gray-300">
                    <span className="text-white font-medium">{(result.processingTime / 1000).toFixed(1)}s</span> processing
                  </span>
                  <span className="text-xs text-gray-300">
                    {result.imageWidth}×{result.imageHeight}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-80 pr-0.5">
                {result.detections.map((det) => (
                  <button
                    key={det.id}
                    onClick={() => setSelectedId(det.id === selectedId ? null : det.id)}
                    className={`
                      w-full text-left p-3 rounded-lg border transition-colors
                      ${selectedId === det.id
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-gray-800 bg-gray-800/30 hover:border-gray-700'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ background: det.color }}
                      />
                      <span className="text-sm font-medium text-white flex-1">{det.label}</span>
                      <span className={`text-xs font-mono font-medium ${getConfidenceColor(det.confidence)}`}>
                        {formatConfidence(det.confidence)}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${det.confidence * 100}%`, background: det.color }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              {selectedDetection && (
                <div className="mt-3 pt-3 border-t border-gray-800">
                  <p className="text-xs text-gray-500 mb-1">Bounding Box</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {(['x', 'y', 'width', 'height'] as const).map((k) => (
                      <div key={k} className="flex justify-between bg-gray-800 rounded px-2 py-1">
                        <span className="text-gray-400">{k}</span>
                        <span className="text-white font-mono">
                          {Math.round(selectedDetection.bbox[k])}px
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {uploadState === 'error' && (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 py-10">
              <p className="text-sm text-red-400">Analysis failed. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ImageCanvasProps {
  imageUrl: string;
  result: AnalysisResult | null;
  selectedId: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imgSize: { w: number; h: number };
}

function ImageCanvas({ imageUrl, result, selectedId }: ImageCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(1);
  const [containerH, setContainerH] = useState(1);
  const [imgNatW, setImgNatW] = useState(1);
  const [imgNatH, setImgNatH] = useState(1);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgNatW(img.naturalWidth);
    setImgNatH(img.naturalHeight);
    setContainerW(img.clientWidth);
    setContainerH(img.clientHeight);
  };

  const scaleX = containerW / imgNatW;
  const scaleY = containerH / imgNatH;

  return (
    <div ref={containerRef} className="relative rounded-lg overflow-hidden bg-gray-800">
      <img
        src={imageUrl}
        alt="Analysis target"
        className="w-full h-auto max-h-96 object-contain"
        onLoad={onImgLoad}
      />
      {result && (
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 ${containerW} ${containerH}`}
          style={{ pointerEvents: 'none' }}
        >
          {result.detections.map((det) => {
            const isSelected = det.id === selectedId;
            const x = det.bbox.x * scaleX;
            const y = det.bbox.y * scaleY;
            const w = det.bbox.width * scaleX;
            const h = det.bbox.height * scaleY;
            return (
              <g key={det.id}>
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={h}
                  fill={det.color + (isSelected ? '33' : '1a')}
                  stroke={det.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  rx={3}
                />
                <rect
                  x={x}
                  y={y - 18}
                  width={det.label.length * 6.5 + 16}
                  height={16}
                  fill={det.color}
                  rx={3}
                />
                <text
                  x={x + 8}
                  y={y - 6}
                  fill="white"
                  fontSize={10}
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {det.label} {Math.round(det.confidence * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
