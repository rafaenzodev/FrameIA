import React from 'react';
import { HelpCircle, Trash2, ShieldCheck, Film } from 'lucide-react';

interface HeaderProps {
  hasActiveProject: boolean;
  onOpenHowItWorks: () => void;
  onClearProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasActiveProject,
  onOpenHowItWorks,
  onClearProject,
}) => {
  return (
    <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm shadow-indigo-500/20 shrink-0">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                FrameSite AI
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded font-mono">
                <ShieldCheck className="w-3 h-3" />
                Local & Seguro
              </span>
            </div>
            <p className="text-xs text-neutral-400 truncate max-w-md hidden md:block">
              Transforme vídeos em referências visuais para seus sites.
            </p>
          </div>
        </div>

        {/* Right action buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenHowItWorks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Como funciona</span>
          </button>

          {hasActiveProject && (
            <button
              type="button"
              onClick={onClearProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400/90 bg-red-950/20 border border-red-900/40 hover:bg-red-900/30 hover:text-red-300 transition-all cursor-pointer"
              title="Limpar vídeo e frames"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar projeto</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
