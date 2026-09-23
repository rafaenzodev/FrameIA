import React from 'react';
import { Maximize2, Download, Check, Eye } from 'lucide-react';
import { FrameItem } from '../types';

interface FrameCardProps {
  frame: FrameItem;
  format: 'png' | 'jpeg';
  includeTimestampInFilename: boolean;
  onToggleSelect: (id: string) => void;
  onOpenLightbox: (frame: FrameItem) => void;
  onDownloadSingle: (frame: FrameItem) => void;
}

export const FrameCard: React.FC<FrameCardProps> = ({
  frame,
  format,
  includeTimestampInFilename,
  onToggleSelect,
  onOpenLightbox,
  onDownloadSingle,
}) => {
  const paddedIndex = frame.index.toString().padStart(2, '0');

  return (
    <div
      className={`group relative bg-neutral-900 rounded-xl overflow-hidden border transition-all duration-200 flex flex-col select-none ${
        frame.selected
          ? 'border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/50'
          : 'border-neutral-800 hover:border-neutral-700'
      }`}
    >
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video bg-neutral-950 overflow-hidden cursor-pointer"
        onClick={() => onOpenLightbox(frame)}
      >
        <img
          src={frame.dataUrl}
          alt={`Frame ${paddedIndex} em ${frame.timeFormatted}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Hover overlay with action buttons */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(frame);
            }}
            className="p-2 rounded-lg bg-neutral-800/90 text-white hover:bg-neutral-700 transition-colors shadow-md cursor-pointer"
            title="Visualizar em tamanho maior"
          >
            <Eye className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownloadSingle(frame);
            }}
            className="p-2 rounded-lg bg-neutral-800/90 text-white hover:bg-indigo-600 transition-colors shadow-md cursor-pointer"
            title="Baixar imagem individual"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Top-left Selection Checkbox */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(frame.id);
          }}
          className="absolute top-2 left-2 z-10 cursor-pointer"
        >
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
              frame.selected
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-black/60 border border-white/40 group-hover:border-white text-transparent'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>

        {/* Top-right Quick Zoom Affordance */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox(frame);
          }}
          className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white/80 hover:text-white hover:bg-black/90 transition-colors opacity-0 group-hover:opacity-100"
          title="Ampliar"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Frame metadata footer */}
      <div
        className="px-3 py-2 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs cursor-pointer"
        onClick={() => onToggleSelect(frame.id)}
      >
        <span className="font-semibold text-neutral-300 font-mono tracking-tight">
          FRAME {paddedIndex}
        </span>
        <span className="font-mono text-neutral-400 tabular-nums">
          {frame.timeFormatted}
        </span>
      </div>
    </div>
  );
};
