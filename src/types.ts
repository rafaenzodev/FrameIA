export interface VideoMeta {
  file: File | null;
  name: string;
  size: number;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  url: string;
  isDemo?: boolean;
}

export interface FrameItem {
  id: string;
  index: number;
  timestamp: number;
  timeFormatted: string;
  fileSafeTimestamp: string;
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  selected: boolean;
}

export interface CaptureConfig {
  interval: number; // in seconds
  startTime: number; // in seconds
  endTime: number; // in seconds
  format: 'png' | 'jpeg';
  quality: number; // 0.1 to 1.0 (for jpeg)
  includeTimestampInFilename: boolean;
}

export interface ExtractionProgress {
  isProcessing: boolean;
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  statusMessage: string;
  isComplete: boolean;
  error?: string | null;
}
