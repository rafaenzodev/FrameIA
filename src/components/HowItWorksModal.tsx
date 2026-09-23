import React from 'react';
import {
  X,
  Upload,
  Sliders,
  Sparkles,
  CheckSquare,
  Download,
  Figma,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Envie o vídeo do site',
      desc: 'Faça upload de uma gravação de tela de navegação em MP4, MOV ou WebM. Você também pode experimentar o vídeo de demonstração integrado.',
      icon: Upload,
    },
    {
      num: '02',
      title: 'Configure o intervalo e corte',
      desc: 'Defina a cada quantos segundos você deseja uma captura (ex: 1 frame a cada 2s) e marque o início e fim exatos usando a timeline.',
      icon: Sliders,
    },
    {
      num: '03',
      title: 'Gere os frames em alta qualidade',
      desc: 'O motor no navegador extrai os frames através da Canvas API mantendo 100% da resolução original do vídeo sem compactação destrutiva.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'Selecione e baixe em ZIP',
      desc: 'Marque os frames mais relevantes e baixe tudo de uma vez em um arquivo ZIP organizado com documentação README.txt pronta para o Figma ou código.',
      icon: Download,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none"
      onClick={onClose}
    >
      <div
        className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative overflow-hidden text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Como funciona o FrameSite AI
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              O fluxo ideal para transformar gravações de tela em guias de recriação de páginas web.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-mono text-xs font-bold text-neutral-500">
                    PASSO {step.num}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Security & Privacy highlights */}
        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/40 flex items-start gap-3 text-xs text-indigo-200">
          <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white">Privacidade e Performance Local</p>
            <p className="text-neutral-400 mt-0.5">
              Seus vídeos nunca saem da sua máquina. O processamento ocorre diretamente no seu navegador
              utilizando Web APIs e aceleração de hardware nativa.
            </p>
          </div>
        </div>

        {/* Footer close */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            Entendido, vamos começar
          </button>
        </div>
      </div>
    </div>
  );
};
