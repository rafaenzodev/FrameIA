import React, { useState, useRef, useEffect } from 'react';
import {
  Header,
} from './components/Header';
import { UploadZone } from './components/UploadZone';
import { VideoPlayer } from './components/VideoPlayer';
import { CaptureControls } from './components/CaptureControls';
import { FrameGallery } from './components/FrameGallery';
import { LightboxModal } from './components/LightboxModal';
import { WebsiteExportSection } from './components/WebsiteExportSection';
import { HowItWorksModal } from './components/HowItWorksModal';
import {
  VideoMeta,
  FrameItem,
  CaptureConfig,
  ExtractionProgress,
} from './types';
import { extractFramesFromVideo } from './utils/frameExtractor';
import {
  exportFramesToZip,
  downloadSingleFrame,
} from './utils/zipExport';
import {
  Film,
  Sparkles,
  Layers,
  Zap,
  ArrowRight,
  AlertCircle,
  FolderArchive,
} from 'lucide-react';

export default function App() {
  // State
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const [captureConfig, setCaptureConfig] = useState<CaptureConfig>({
    interval: 2,
    startTime: 0,
    endTime: 30,
    format: 'png',
    quality: 0.92,
    includeTimestampInFilename: false,
  });

  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    isProcessing: false,
    currentFrame: 0,
    totalFrames: 0,
    percentage: 0,
    statusMessage: '',
    isComplete: false,
    error: null,
  });

  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [lightboxFrame, setLightboxFrame] = useState<FrameItem | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // Handle video selection (file upload or generated demo)
  const handleVideoSelected = async (file: File) => {
    try {
      setIsLoadingVideo(true);
      setVideoError(null);

      // Revoke previous URL if any
      if (videoMeta?.url) {
        URL.revokeObjectURL(videoMeta.url);
      }

      const url = URL.createObjectURL(file);

      // Temporary video to inspect metadata
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.preload = 'metadata';

      await new Promise<void>((resolve, reject) => {
        tempVideo.onloadedmetadata = () => resolve();
        tempVideo.onerror = () => {
          reject(
            new Error(
              'Não foi possível processar este vídeo. Tente utilizar MP4, MOV ou WEBM.'
            )
          );
        };
      });

      const duration = tempVideo.duration || 10;
      const width = tempVideo.videoWidth || 1920;
      const height = tempVideo.videoHeight || 1080;

      const meta: VideoMeta = {
        file,
        name: file.name,
        size: file.size,
        duration,
        width,
        height,
        aspectRatio: `${width}:${height}`,
        url,
        isDemo: file.name.includes('demo-website'),
      };

      setVideoMeta(meta);

      // Initialize capture defaults based on video length
      setCaptureConfig((prev) => ({
        ...prev,
        startTime: 0,
        endTime: Math.min(duration, Math.max(5, Math.floor(duration))),
        interval: duration > 60 ? 5 : 2,
      }));

      // Reset previous extraction state
      setFrames([]);
      setExtractionProgress({
        isProcessing: false,
        currentFrame: 0,
        totalFrames: 0,
        percentage: 0,
        statusMessage: '',
        isComplete: false,
        error: null,
      });
    } catch (err: any) {
      console.error(err);
      setVideoError(
        err.message ||
          'Não foi possível carregar o vídeo. Verifique se o formato é suportado pelo seu navegador.'
      );
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Start Frame Extraction
  const handleStartExtraction = async () => {
    if (!videoMeta) return;

    abortControllerRef.current = new AbortController();

    try {
      setFrames([]);
      setExtractionProgress({
        isProcessing: true,
        currentFrame: 0,
        totalFrames: 0,
        percentage: 0,
        statusMessage: 'Iniciando decodificação do vídeo...',
        isComplete: false,
        error: null,
      });

      const extractedFrames = await extractFramesFromVideo(
        videoMeta.url,
        captureConfig,
        {
          onProgress: (p) => {
            setExtractionProgress(p);
          },
          onFrameCaptured: (newFrame) => {
            setFrames((prev) => [...prev, newFrame]);
          },
        },
        abortControllerRef.current.signal
      );

      setFrames(extractedFrames);

      // Smooth scroll to frames gallery after finishing
      setTimeout(() => {
        galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      console.error(err);
      setExtractionProgress((prev) => ({
        ...prev,
        isProcessing: false,
        error: err.message || 'Erro durante a extração dos frames.',
      }));
    }
  };

  // Cancel Extraction
  const handleCancelExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Toggle selection for a single frame
  const handleToggleSelect = (id: string) => {
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  };

  // Select all or deselect all
  const handleSelectAll = (select: boolean) => {
    setFrames((prev) => prev.map((f) => ({ ...f, selected: select })));
  };

  // Download a single frame
  const handleDownloadSingle = (frame: FrameItem) => {
    downloadSingleFrame(
      frame,
      captureConfig.format,
      captureConfig.includeTimestampInFilename
    );
  };

  // Download selected frames (as ZIP if > 1, or single if 1)
  const handleDownloadSelected = async () => {
    if (!videoMeta) return;
    const selectedFrames = frames.filter((f) => f.selected);

    if (selectedFrames.length === 0) return;

    if (selectedFrames.length === 1) {
      handleDownloadSingle(selectedFrames[0]);
      return;
    }

    try {
      setIsDownloadingZip(true);
      setZipProgress(0);

      await exportFramesToZip({
        frames: selectedFrames,
        videoMeta,
        interval: captureConfig.interval,
        format: captureConfig.format,
        includeTimestampInFilename: captureConfig.includeTimestampInFilename,
        zipFileName: 'frames-selecionados.zip',
        onProgress: (p) => setZipProgress(p),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Download all frames as ZIP
  const handleDownloadAll = async () => {
    if (!videoMeta || frames.length === 0) return;

    try {
      setIsDownloadingZip(true);
      setZipProgress(0);

      await exportFramesToZip({
        frames,
        videoMeta,
        interval: captureConfig.interval,
        format: captureConfig.format,
        includeTimestampInFilename: captureConfig.includeTimestampInFilename,
        zipFileName: 'frames-do-video.zip',
        onProgress: (p) => setZipProgress(p),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Clear project
  const handleConfirmClear = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (videoMeta?.url) {
      URL.revokeObjectURL(videoMeta.url);
    }
    frames.forEach((f) => URL.revokeObjectURL(f.dataUrl));

    setVideoMeta(null);
    setFrames([]);
    setLightboxFrame(null);
    setShowClearConfirm(false);
    setVideoError(null);
  };

  const selectedCount = frames.filter((f) => f.selected).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Header */}
      <Header
        hasActiveProject={videoMeta !== null}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onClearProject={() => setShowClearConfirm(true)}
      />

      {/* Main App Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* State 1: No Video Loaded (Hero & Upload) */}
        {!videoMeta && (
          <div className="space-y-8 animate-fadeIn">
            {/* Value Proposition Hero */}
            <div className="text-center max-w-3xl mx-auto pt-6 pb-2 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900 border border-neutral-800 text-neutral-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Extrator Visual de Alta Fidelidade para Web Designers</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Transforme gravações de vídeo em referências visuais para sites.
              </h1>

              <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                Extraia frames cronológicos e nítidos de sites navegados em vídeo.
                Ideal para inspecionar layouts, grids, microinterações e recriar interfaces no Figma ou código.
              </p>
            </div>

            {/* Upload Zone */}
            <UploadZone
              onVideoSelected={handleVideoSelected}
              isLoadingDemo={isLoadingVideo}
              setIsLoadingDemo={setIsLoadingVideo}
            />

            {/* Error banner if any */}
            {videoError && (
              <div className="max-w-xl mx-auto p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{videoError}</span>
              </div>
            )}

            {/* Quick 3-Step Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-6 text-neutral-300">
              <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                  <Film className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">Controle de Intervalo</h4>
                <p className="text-xs text-neutral-400">
                  Escolha capturar a cada 0.5s, 1s, 2s ou defina segundos customizados com precisão de timestamp.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/50 flex items-center justify-center text-violet-400">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">Qualidade Original</h4>
                <p className="text-xs text-neutral-400">
                  Captura renderizada via Canvas nativo na resolução original do vídeo em formato PNG ou JPG.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800/70 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
                  <FolderArchive className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-semibold text-white">Download em ZIP com README</h4>
                <p className="text-xs text-neutral-400">
                  Exportação organizada em lote contendo metadados, ordem cronológica e dicas de recriação.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* State 2: Video Loaded (Editor Workspace) */}
        {videoMeta && (
          <div className="space-y-8 animate-fadeIn">
            {/* Desktop: 2-Column Layout (Video on left, Controls on right)
                Mobile: Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Video Player & Timeline (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <VideoPlayer
                  videoMeta={videoMeta}
                  captureStart={captureConfig.startTime}
                  captureEnd={captureConfig.endTime}
                  onSetCaptureStart={(t) =>
                    setCaptureConfig((prev) => ({
                      ...prev,
                      startTime: Math.min(t, prev.endTime - 0.1),
                    }))
                  }
                  onSetCaptureEnd={(t) =>
                    setCaptureConfig((prev) => ({
                      ...prev,
                      endTime: Math.max(t, prev.startTime + 0.1),
                    }))
                  }
                />
              </div>

              {/* Right Column: Capture Controls (5 cols) */}
              <div className="lg:col-span-5">
                <CaptureControls
                  videoMeta={videoMeta}
                  config={captureConfig}
                  onChangeConfig={setCaptureConfig}
                  progress={extractionProgress}
                  onStartExtraction={handleStartExtraction}
                  onCancelExtraction={handleCancelExtraction}
                />
              </div>
            </div>

            {/* Anchor for automatic smooth scrolling */}
            <div ref={galleryRef} />

            {/* Frame Gallery (When frames are extracted) */}
            {frames.length > 0 && (
              <>
                <FrameGallery
                  frames={frames}
                  videoMeta={videoMeta}
                  interval={captureConfig.interval}
                  format={captureConfig.format}
                  includeTimestampInFilename={captureConfig.includeTimestampInFilename}
                  isDownloadingZip={isDownloadingZip}
                  zipProgress={zipProgress}
                  onToggleSelect={handleToggleSelect}
                  onSelectAll={handleSelectAll}
                  onOpenLightbox={(f) => setLightboxFrame(f)}
                  onDownloadSingle={handleDownloadSingle}
                  onDownloadSelected={handleDownloadSelected}
                  onDownloadAll={handleDownloadAll}
                />

                {/* Section "Pronto para criar seu site?" */}
                <WebsiteExportSection
                  frames={frames}
                  selectedFramesCount={selectedCount}
                  videoMeta={videoMeta}
                  isDownloadingZip={isDownloadingZip}
                  onExportReferences={
                    selectedCount > 0 ? handleDownloadSelected : handleDownloadAll
                  }
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-6 text-xs text-neutral-500 text-center mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong className="text-neutral-400">FrameSite AI</strong> — Transforme vídeos em referências visuais para seus sites.
          </p>
          <p className="text-neutral-600">
            Processamento 100% local no navegador. Nenhum vídeo enviado a servidores.
          </p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxFrame && (
        <LightboxModal
          frames={frames}
          currentFrame={lightboxFrame}
          format={captureConfig.format}
          includeTimestampInFilename={captureConfig.includeTimestampInFilename}
          onClose={() => setLightboxFrame(null)}
          onNavigate={(f) => setLightboxFrame(f)}
          onDownloadSingle={handleDownloadSingle}
        />
      )}

      {/* How it works modal */}
      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
      />

      {/* Confirm Clear Project Modal */}
      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-white">Limpar projeto atual?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Isso removerá o vídeo carregado e todos os frames gerados até o momento.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-500 transition-colors cursor-pointer"
              >
                Limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
