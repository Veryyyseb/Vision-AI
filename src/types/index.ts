export interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  color: string;
}

export interface AnalysisResult {
  id: string;
  imageUrl: string;
  imageName: string;
  timestamp: Date;
  detections: Detection[];
  processingTime: number;
  imageWidth: number;
  imageHeight: number;
}

export interface DashboardStats {
  totalAnalyses: number;
  totalDetections: number;
  avgConfidence: number;
  avgProcessingTime: number;
}

export type ActiveView = 'dashboard' | 'analyze' | 'history' | 'settings';
