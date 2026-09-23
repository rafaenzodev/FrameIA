import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  BookmarkPlus,
  Clock,
  HardDrive,
  Maximize,
  Sliders,
} from 'lucide-react';
import { VideoMeta } from '../types';
import { formatTime, formatTimeWithSubseconds, formatBytes } from '../utils/formatters';

interface VideoPlayerProps {
  videoMeta: VideoMeta;
  captureStart: number;
  captureEnd: number;
  onSetCaptureStart: (time: number) => void;
  onSetCaptureEnd: (time: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoMeta,
  captureStart,
  captureEnd,
  onSetCaptureStart,
  onSetCaptureEnd,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(videoMeta.duration || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!isDraggingProgress) {
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [isDraggingProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = Math.max(0, Math.min(video.currentTime + seconds, duration));
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickPos = (e.clientX - rect.left) / rect.width;
    const targetTime = Math.max(0, Math.min(clickPos * duration, duration));
    videoRef.current.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Timeline markers calculation
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const startPercent = duration > 0 ? (captureStart / duration) * 100 : 0;
  const endPercent = duration > 0 ? (captureEnd / duration) * 100 : 100;
  const rangeWidthPercent = Math.max(0, endPercent - startPercent);

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Video Viewport */}
      <div className="relative bg-black aspect-video flex items-center justify-center group overflow-hidden">
        <video
          ref={videoRef}
          src={videoMeta.url}
          className="w-full h-full object-contain cursor-pointer"
          onClick={togglePlay}
          playsInline
        />

        {/* Big play button overlay when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white flex items-center justify-center transition-all transform hover:scale-110 shadow-lg cursor-pointer backdrop-blur-sm"
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </button>
        )}

        {/* Current position watermark */}
        <div className="absolute top-3 left-3 bg-neutral-950/80 backdrop-blur-sm px-2.5 py-1 rounded text-xs font-mono text-neutral-300 pointer-events-none tabular-nums border border-neutral-800">
          {formatTimeWithSubseconds(currentTime)}
        </div>
      </div>

      {/* Timeline Scrubber with Range Window */}
      <div className="px-4 pt-3 pb-2 bg-neutral-900/90 border-t border-neutral-800">
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="relative h-6 flex items-center cursor-pointer group select-none"
        >
          {/* Track background */}
          <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden relative">
            {/* Capture Range Highlight (Start to End) */}
            <div
              className="absolute top-0 bottom-0 bg-indigo-500/25 border-l-2 border-r-2 border-indigo-400 z-10"
              style={{
                left: `${startPercent}%`,
                width: `${rangeWidthPercent}%`,
              }}
              title={`Intervalo de captura selecionado: ${formatTime(captureStart)} até ${formatTime(captureEnd)}`}
            />

            {/* Current Playback Progress Fill */}
            <div
              className="absolute top-0 bottom-0 bg-neutral-400/50 z-20"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Current playhead knob */}
          <div
            className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md z-30 transform -translate-x-1/2 pointer-events-none group-hover:scale-125 transition-transform"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Transport controls row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          {/* Left: Playback controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg text-neutral-200 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => seekRelative(-2)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Voltar 2 segundos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => seekRelative(2)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Avançar 2 segundos"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Time display */}
            <div className="font-mono text-neutral-300 ml-2 tabular-nums">
              <span className="text-white font-medium">{formatTime(currentTime)}</span>
              <span className="text-neutral-500 mx-1">/</span>
              <span className="text-neutral-400">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Center: Quick Range Sync buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSetCaptureStart(currentTime)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 hover:bg-indigo-900/50 hover:text-white transition-colors cursor-pointer"
              title="Define o início da captura no momento atual do vídeo"
            >
              <BookmarkPlus className="w-3 h-3 text-indigo-400" />
              <span>Marcar Início ({formatTime(currentTime)})</span>
            </button>

            <button
              type="button"
              onClick={() => onSetCaptureEnd(currentTime)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/60 hover:bg-indigo-900/50 hover:text-white transition-colors cursor-pointer"
              title="Define o fim da captura no momento atual do vídeo"
            >
              <BookmarkPlus className="w-3 h-3 text-indigo-400" />
              <span>Marcar Fim ({formatTime(currentTime)})</span>
            </button>
          </div>

          {/* Right: Volume & Fullscreen */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 accent-indigo-500 h-1 bg-neutral-700 rounded-lg cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Tela cheia"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Details Card Header */}
      <div className="px-4 py-3 bg-neutral-950 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-neutral-200 truncate">{videoMeta.name}</p>
        </div>

        <div className="flex items-center flex-wrap gap-3 font-mono text-neutral-400">
          <div className="flex items-center gap-1" title="Resolução do vídeo">
            <Maximize className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-300">{videoMeta.width} × {videoMeta.height}</span>
          </div>

          <div className="flex items-center gap-1" title="Duração total">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-300">{formatTime(videoMeta.duration)}</span>
          </div>

          <div className="flex items-center gap-1" title="Tamanho do arquivo">
            <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-300">{formatBytes(videoMeta.size)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
