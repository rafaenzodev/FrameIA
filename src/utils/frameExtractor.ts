import { CaptureConfig, FrameItem, ExtractionProgress } from '../types';
import { formatTime, formatFileSafeTime } from './formatters';

export interface ExtractionCallbacks {
  onProgress: (progress: ExtractionProgress) => void;
  onFrameCaptured?: (frame: FrameItem) => void;
}

/**
 * Robustly seeks an HTML5 video element to a specific timestamp
 * and resolves when the frame is ready to be drawn.
 */
function seekVideoToTime(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    // Clamping to avoid exceeding duration
    const target = Math.max(0, Math.min(time, video.duration - 0.01));

    // If video is already near this time, resolve immediately
    if (Math.abs(video.currentTime - target) < 0.02) {
      resolve();
      return;
    }

    let isResolved = false;

    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      if (timeoutId) clearTimeout(timeoutId);
    };

    const onSeeked = () => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve();
      }
    };

    // Timeout safety fallback in case browser delays seeked event
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        cleanup();
        resolve();
      }
    }, 1200);

    video.addEventListener('seeked', onSeeked, { once: true });
    video.currentTime = target;
  });
}

/**
 * Extracts frames sequentially from an HTML5 video element using an offscreen canvas.
 */
export async function extractFramesFromVideo(
  videoSourceUrl: string,
  config: CaptureConfig,
  callbacks: ExtractionCallbacks,
  abortSignal?: AbortSignal
): Promise<FrameItem[]> {
  const { interval, startTime, endTime, format, quality } = config;

  // Create an offscreen video element for clean extraction without altering playback UI
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = videoSourceUrl;

  callbacks.onProgress({
    isProcessing: true,
    currentFrame: 0,
    totalFrames: 0,
    percentage: 0,
    statusMessage: 'Carregando vídeo e metadados...',
    isComplete: false,
  });

  // Wait for metadata
  await new Promise<void>((resolve, reject) => {
    if (video.readyState >= 1) {
      resolve();
    } else {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Falha ao decodificar os metadados do vídeo.'));
    }
  });

  const duration = video.duration || 0;
  const actualStart = Math.max(0, Math.min(startTime, duration));
  const actualEnd = Math.min(Math.max(actualStart + 0.1, endTime), duration);

  // Compute timestamp points
  const timestamps: number[] = [];
  const safeInterval = Math.max(0.1, interval);

  for (let t = actualStart; t <= actualEnd; t += safeInterval) {
    timestamps.push(t);
  }

  // Ensure at least one frame is captured if timestamps is empty
  if (timestamps.length === 0) {
    timestamps.push(actualStart);
  }

  const totalFrames = timestamps.length;
  const width = video.videoWidth || 1280;
  const height = video.videoHeight || 720;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');
  }

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const compressionQuality = format === 'jpeg' ? quality : undefined;
  const frames: FrameItem[] = [];

  for (let i = 0; i < timestamps.length; i++) {
    if (abortSignal?.aborted) {
      callbacks.onProgress({
        isProcessing: false,
        currentFrame: i,
        totalFrames,
        percentage: Math.round((i / totalFrames) * 100),
        statusMessage: 'Processamento cancelado pelo usuário.',
        isComplete: false,
      });
      break;
    }

    const t = timestamps[i];
    const frameNumber = i + 1;

    callbacks.onProgress({
      isProcessing: true,
      currentFrame: frameNumber,
      totalFrames,
      percentage: Math.round((i / totalFrames) * 100),
      statusMessage: `Capturando frame ${frameNumber} de ${totalFrames} (${formatTime(t)})...`,
      isComplete: false,
    });

    await seekVideoToTime(video, t);

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, width, height);

    // Convert to blob
    const blob = await new Promise<Blob>((res, rej) => {
      canvas.toBlob(
        (b) => {
          if (b) res(b);
          else rej(new Error('Erro ao converter frame em imagem.'));
        },
        mimeType,
        compressionQuality
      );
    });

    const dataUrl = URL.createObjectURL(blob);

    const frameItem: FrameItem = {
      id: `frame_${Date.now()}_${frameNumber}_${Math.random().toString(36).slice(2, 6)}`,
      index: frameNumber,
      timestamp: t,
      timeFormatted: formatTime(t),
      fileSafeTimestamp: formatFileSafeTime(t),
      dataUrl,
      blob,
      width,
      height,
      size: blob.size,
      selected: true, // Selected by default for quick export
    };

    frames.push(frameItem);
    if (callbacks.onFrameCaptured) {
      callbacks.onFrameCaptured(frameItem);
    }

    // Yield back to main thread briefly for responsive UI rendering
    await new Promise((r) => setTimeout(r, 8));
  }

  // Final completion
  callbacks.onProgress({
    isProcessing: false,
    currentFrame: frames.length,
    totalFrames,
    percentage: 100,
    statusMessage: 'Frames gerados com sucesso!',
    isComplete: true,
  });

  return frames;
}
