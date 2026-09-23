import React from 'react';
import {
  Download,
  CheckSquare,
  Square,
  Layers,
  Archive,
  Eye,
  Clock,
  Maximize,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { FrameItem, VideoMeta } from '../types';
import { FrameCard } from './FrameCard';
import { formatTime } from '../utils/formatters';

interface FrameGalleryProps {
  frames: FrameItem[];
  videoMeta: VideoMeta;
  interval: number;
  format: 'png' | 'jpeg';
  includeTimestampInFilename: boolean;
  isDownloadingZip: boolean;
  zipProgress: number;
  onToggleSelect: (id: string) => void;
  onSelectAll: (select: boolean) => void;
  onOpenLightbox: (frame: FrameItem) => void;
  onDownloadSingle: (frame: FrameItem) => void;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
}

export const FrameGallery: React.FC<FrameGalleryProps> = ({
  frames,
  videoMeta,
  interval,
  format,
  includeTimestampInFilename,
  isDownloadingZip,
  zipProgress,
  onToggleSelect,
  onSelectAll,
  onOpenLightbox,
  onDownloadSingle,
  onDownloadSelected,
  onDownloadAll,
}) => {
  const selectedCount = frames.filter((f) => f.selected).length;
  const allSelected = frames.length > 0 && selectedCount === frames.length;

  return (
    <section className="mt-10 pt-8 border-t border-neutral-800/80 space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Frames gerados
            </h2>
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
              {frames.length} frames
            </span>
          </div>
          <p className="text-xs md:text-sm text-neutral-400 mt-1">
            Selecione os momentos ideais para referenciar seções, componentes e animações no seu projeto web.
          </p>
        </div>

        {/* Key Metrics Pill cluster */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono text-neutral-400">
          <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-200 font-semibold">{frames.length} frames</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
            <Maximize className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-200">{videoMeta.width} × {videoMeta.height}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-200">{formatTime(videoMeta.duration)}</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-neutral-500" />
            <span className="text-neutral-200">1 frame a cada {interval}s</span>
          </div>
        </div>
      </div>

      {/* Action Control Bar */}
      <div className="p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 sticky top-18 z-30 backdrop-blur-md shadow-lg">
        {/* Left: Selection status & Select All button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onSelectAll(!allSelected)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-750 hover:text-white transition-colors cursor-pointer"
          >
            {allSelected ? (
              <>
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Desmarcar todos</span>
              </>
            ) : (
              <>
                <Square className="w-3.5 h-3.5 text-neutral-400" />
                <span>Selecionar todos</span>
              </>
            )}
          </button>

          <span className="text-xs font-mono text-neutral-300">
            <span className="font-semibold text-white">{selectedCount}</span>{' '}
            {selectedCount === 1 ? 'frame selecionado' : 'frames selecionados'}
          </span>
        </div>

        {/* Right: Download Actions */}
        <div className="flex items-center gap-2">
          {/* Download Selected */}
          <button
            type="button"
            onClick={onDownloadSelected}
            disabled={selectedCount === 0 || isDownloadingZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
            title="Baixar apenas os frames marcados com checkbox"
          >
            <Archive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Baixar selecionados ({selectedCount})</span>
          </button>

          {/* Download All as ZIP */}
          <button
            type="button"
            onClick={onDownloadAll}
            disabled={frames.length === 0 || isDownloadingZip}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            {isDownloadingZip ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Gerando ZIP ({zipProgress}%)...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar todos os frames (.ZIP)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Frame Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {frames.map((frame) => (
          <FrameCard
            key={frame.id}
            frame={frame}
            format={format}
            includeTimestampInFilename={includeTimestampInFilename}
            onToggleSelect={onToggleSelect}
            onOpenLightbox={onOpenLightbox}
            onDownloadSingle={onDownloadSingle}
          />
        ))}
      </div>
    </section>
  );
};
