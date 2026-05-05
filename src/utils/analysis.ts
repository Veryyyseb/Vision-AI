import type { Detection, AnalysisResult } from '../types';

const LABELS = [
  'Person', 'Car', 'Bicycle', 'Dog', 'Cat', 'Tree', 'Building',
  'Chair', 'Table', 'Laptop', 'Phone', 'Book', 'Cup', 'Bottle',
  'Traffic Light', 'Stop Sign', 'Bird', 'Backpack', 'Umbrella',
];

const COLORS = [
  '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function simulateAnalysis(
  imageUrl: string,
  imageName: string,
  width: number,
  height: number
): Promise<AnalysisResult> {
  return new Promise((resolve) => {
    const delay = randomBetween(800, 2000);
    setTimeout(() => {
      const count = Math.floor(randomBetween(2, 7));
      const detections: Detection[] = Array.from({ length: count }, (_, i) => {
        const bw = randomBetween(0.1, 0.35) * width;
        const bh = randomBetween(0.1, 0.35) * height;
        const bx = randomBetween(0, width - bw);
        const by = randomBetween(0, height - bh);
        return {
          id: generateId(),
          label: LABELS[Math.floor(Math.random() * LABELS.length)],
          confidence: randomBetween(0.55, 0.99),
          bbox: { x: bx, y: by, width: bw, height: bh },
          color: COLORS[i % COLORS.length],
        };
      });

      resolve({
        id: generateId(),
        imageUrl,
        imageName,
        timestamp: new Date(),
        detections,
        processingTime: delay,
        imageWidth: width,
        imageHeight: height,
      });
    }, delay);
  });
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatConfidence(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function getConfidenceColor(value: number): string {
  if (value >= 0.85) return 'text-green-400';
  if (value >= 0.7) return 'text-yellow-400';
  return 'text-red-400';
}
