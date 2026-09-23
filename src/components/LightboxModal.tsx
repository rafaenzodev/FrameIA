import React, { useEffect, useState } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  Check,
  Maximize,
  Clock,
  HardDrive,
} from 'lucide-react';
import { FrameItem } from '../types';
import { formatBytes, generateFrameFileName } from '../utils/formatters';

interface LightboxModalProps {
  frames: FrameItem[];
  currentFrame: FrameItem | null;
  format: 'png' | 'jpeg';
  includeTimestampInFilename: boolean;
  onClose: () => void;
  onNavigate: (frame: FrameItem) => void;
  onDownloadSingle: (frame: FrameItem) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  frames,
  currentFrame,
  format,
  includeTimestampInFilename,
  onClose,
  onNavigate,
  onDownloadSingle,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!currentFrame) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFrame, frames]);

  if (!currentFrame) return null;

  const currentIndex = frames.findIndex((f) => f.id === currentFrame.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < frames.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      onNavigate(frames[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      onNavigate(frames[currentIndex + 1]);
    }
  };

  const handleCopyImage = async () => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        // Must be PNG for clipboard item
        let blobToCopy = currentFrame.blob;
        if (blobToCopy.type !== 'image/png') {
          // Convert to png blob
          const img = new Image();
          img.src = currentFrame.dataUrl;
          await img.decode();
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          blobToCopy = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), 'image/png')
          );
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blobToCopy }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Clipboard copy not supported or denied', err);
    }
  };

  const fileName = generateFrameFileName(
    currentFrame.index,
    currentFrame.timestamp,
    format,
    includeTimestampInFilename
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between select-none"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div
        className="px-6 py-4 flex items-center justify-between border-b border-neutral-800/80 bg-neutral-950/80"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          <span className="font-mono font-bold text-white tracking-wider text-sm">
            FRAME {currentFrame.index.toString().padStart(2, '0')}
          </span>
          <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              {currentFrame.timeFormatted}
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-neutral-500" />
              {currentFrame.width} × {currentFrame.height} px
            </span>
            <span aria-hidden="true" className="text-neutral-700">·</span>
            <span className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-neutral-500" />
              {formatBytes(currentFrame.size)}
            </span>
          </div>
        </div>

        {/* Actions & Close */}
        <div className="flex items-center gap-2">
          {/* Copy to Clipboard button (ideal for pasting into Figma) */}
          <button
            type="button"
            onClick={handleCopyImage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
            title="Copiar imagem para colar no Figma / Photoshop"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span className="hidden sm:inline">Copiar imagem</span>
              </>
            )}
          </button>

          {/* Download button */}
          <button
            type="button"
            onClick={() => onDownloadSingle(currentFrame)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar frame</span>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-2 cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Previous / Next Arrows */}
      <div
        className="flex-1 relative flex items-center justify-center p-4 md:p-8 overflow-hidden"
        onClick={onClose}
      >
        {/* Previous Button */}
        {hasPrevious && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-neutral-900/80 hover:bg-indigo-600 text-white flex items-center justify-center transition-all border border-neutral-700/60 shadow-lg cursor-pointer z-20 backdrop-blur-sm"
            title="Frame anterior (Seta esquerda)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <div
          className="relative max-w-full max-h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={currentFrame.dataUrl}
            alt={fileName}
            className="max-h-[82vh] max-w-[90vw] object-contain rounded-lg shadow-2xl border border-neutral-800"
          />
        </div>

        {/* Next Button */}
        {hasNext && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-neutral-900/80 hover:bg-indigo-600 text-white flex items-center justify-center transition-all border border-neutral-700/60 shadow-lg cursor-pointer z-20 backdrop-blur-sm"
            title="Próximo frame (Seta direita)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom info bar */}
      <div
        className="px-6 py-3 border-t border-neutral-800/80 bg-neutral-950/80 text-center text-xs text-neutral-400 font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        <span>{fileName}</span>
        <span className="mx-2 text-neutral-600">·</span>
        <span>
          {currentIndex + 1} de {frames.length} frames
        </span>
      </div>
    </div>
  );
};
