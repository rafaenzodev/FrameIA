import React from 'react';
import {
  Code2,
  FolderArchive,
  Palette,
  Layout,
  Workflow,
  Sparkles,
  Download,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { FrameItem, VideoMeta } from '../types';

interface WebsiteExportSectionProps {
  frames: FrameItem[];
  selectedFramesCount: number;
  videoMeta: VideoMeta;
  isDownloadingZip: boolean;
  onExportReferences: () => void;
}

export const WebsiteExportSection: React.FC<WebsiteExportSectionProps> = ({
  frames,
  selectedFramesCount,
  videoMeta,
  isDownloadingZip,
  onExportReferences,
}) => {
  return (
    <section className="mt-14 mb-16 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/90 to-neutral-950 border border-neutral-800 p-6 md:p-10 shadow-2xl relative overflow-hidden">
      {/* Decorative gradient flare */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-xs">
          <Workflow className="w-3.5 h-3.5 text-indigo-400" />
          <span>Fluxo de Design & Desenvolvimento</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
          Pronto para criar seu site?
        </h3>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Use os frames extraídos como referência visual para recriar o layout,
          animações, seções e estilo do site com máxima fidelidade e velocidade.
        </p>

        {/* Primary CTA button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onExportReferences}
            disabled={frames.length === 0 || isDownloadingZip}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm md:text-base font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/40 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-40"
          >
            {isDownloadingZip ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Empacotando referências...</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-5 h-5" />
                <span>
                  EXPORTAR REFERÊNCIAS ({selectedFramesCount > 0 ? selectedFramesCount : frames.length} FRAMES)
                </span>
              </>
            )}
          </button>
        </div>

        {/* Actionable workflow cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-8">
          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Layout className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              1. Estrutura e Seções
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Mapeie a ordem dos componentes: Navbar fixa, Hero impactante, Bento grid de features, cards de depoimentos e rodapé.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-violet-950/70 border border-violet-800/60 flex items-center justify-center text-violet-400">
              <Palette className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              2. Design System & Cores
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Extraia a paleta de cores dominante, espaçamentos consistentes (8px, 16px, 24px) e curvas de arredondamento diretamente das imagens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800/80 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Code2 className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              3. Recriação em Código
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Construa o HTML/Tailwind lado a lado com os frames cronológicos para replicar microinterações e transições com precisão cirúrgica.
            </p>
          </div>
        </div>

        {/* ZIP Package Structure Preview */}
        <div className="mt-6 p-4 rounded-xl bg-neutral-950/90 border border-neutral-800 font-mono text-xs text-neutral-400 text-left">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80 text-neutral-300 font-semibold">
            <span>Organização do ZIP exportado:</span>
            <span className="text-indigo-400">frames-do-video.zip</span>
          </div>
          <div className="pt-2 text-neutral-400 space-y-0.5">
            <p className="text-neutral-300">frames-do-video/</p>
            <p className="pl-4 text-neutral-400">├── frame-001.png</p>
            <p className="pl-4 text-neutral-400">├── frame-002.png</p>
            <p className="pl-4 text-neutral-400">├── frame-003.png</p>
            <p className="pl-4 text-neutral-400">├── ...</p>
            <p className="pl-4 text-indigo-300">└── README.txt (Metadados, resolução e guia de uso)</p>
          </div>
        </div>
      </div>
    </section>
  );
};
