import React, { useState, useRef } from 'react';
import { UploadCloud, FileVideo, Sparkles, AlertCircle, Shield, Play } from 'lucide-react';
import { generateDemoWebsiteVideo } from '../utils/demoVideoGenerator';

interface UploadZoneProps {
  onVideoSelected: (file: File) => void;
  isLoadingDemo?: boolean;
  setIsLoadingDemo?: (loading: boolean) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onVideoSelected,
  isLoadingDemo = false,
  setIsLoadingDemo,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedExtensions = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v'];

  const validateAndProcess = (file: File) => {
    setErrorMessage(null);
    const fileName = file.name.toLowerCase();
    const isValidExt = acceptedExtensions.some((ext) => fileName.endsWith(ext));
    const isVideoMime = file.type.startsWith('video/') || isValidExt;

    if (!isVideoMime) {
      setErrorMessage(
        'Não foi possível processar este vídeo. Tente utilizar MP4, MOV ou WEBM.'
      );
      return;
    }

    onVideoSelected(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndProcess(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndProcess(file);
    }
  };

  const handleDemoVideo = async () => {
    try {
      setIsGeneratingDemo(true);
      if (setIsLoadingDemo) setIsLoadingDemo(true);
      setErrorMessage(null);
      const demoFile = await generateDemoWebsiteVideo();
      onVideoSelected(demoFile);
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao gerar vídeo de demonstração. Tente fazer o upload de um arquivo seu.');
    } finally {
      setIsGeneratingDemo(false);
      if (setIsLoadingDemo) setIsLoadingDemo(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Main Drag & Drop Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 md:p-14 text-center transition-all duration-300 ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
            : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,.mp4,.mov,.webm,.avi"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center justify-center">
          <div
            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-105 ${
              isDragOver
                ? 'bg-indigo-600/30 text-indigo-400'
                : 'bg-neutral-800/70 text-indigo-400 group-hover:bg-neutral-800'
            }`}
          >
            <UploadCloud className="w-8 h-8 md:w-10 md:h-10" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">
            Envie seu vídeo
          </h2>
          <p className="text-sm md:text-base text-neutral-400 max-w-md mb-5">
            Arraste seu vídeo para cá ou clique para selecionar do seu computador.
          </p>

          {/* Formats info */}
          <div className="flex items-center flex-wrap justify-center gap-2 text-xs text-neutral-400 mb-6">
            <span className="text-neutral-500 font-medium">Formatos aceitos:</span>
            <span className="font-mono text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">MP4</span>
            <span className="font-mono text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">MOV</span>
            <span className="font-mono text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">WEBM</span>
            <span className="font-mono text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded">AVI</span>
          </div>

          {/* Demo Button to test immediately */}
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="pt-2"
          >
            <button
              type="button"
              onClick={handleDemoVideo}
              disabled={isGeneratingDemo || isLoadingDemo}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/60 hover:text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isGeneratingDemo ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Gerando vídeo interativo de teste...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Não tem um vídeo agora? Testar com demonstração de site</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mt-4 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-200">{errorMessage}</p>
            <p className="text-xs text-red-400/80 mt-0.5">
              Certifique-se de que o formato do arquivo é suportado pelo seu navegador (preferencialmente MP4 com H.264 ou WebM).
            </p>
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-neutral-500 text-center">
        <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
        <span>
          Seu vídeo é processado localmente no navegador sempre que possível. Seus arquivos não são enviados para terceiros.
        </span>
      </div>
    </div>
  );
};
