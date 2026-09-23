import React from 'react';
import {
  Clock,
  Layers,
  Sparkles,
  Sliders,
  Settings2,
  CheckCircle2,
  XCircle,
  FileImage,
  Play,
  RotateCcw,
} from 'lucide-react';
import { CaptureConfig, ExtractionProgress, VideoMeta } from '../types';
import { formatTime, parseTimeString } from '../utils/formatters';

interface CaptureControlsProps {
  videoMeta: VideoMeta;
  config: CaptureConfig;
  onChangeConfig: (newConfig: CaptureConfig) => void;
  progress: ExtractionProgress;
  onStartExtraction: () => void;
  onCancelExtraction: () => void;
}

export const CaptureControls: React.FC<CaptureControlsProps> = ({
  videoMeta,
  config,
  onChangeConfig,
  progress,
  onStartExtraction,
  onCancelExtraction,
}) => {
  const presets = [
    { label: '0,5 s', value: 0.5 },
    { label: '1 s', value: 1 },
    { label: '2 s', value: 2 },
    { label: '3 s', value: 3 },
    { label: '5 s', value: 5 },
    { label: '10 s', value: 10 },
  ];

  const duration = videoMeta.duration || 0;
  const captureDuration = Math.max(0, config.endTime - config.startTime);
  const estimatedFrames =
    config.interval > 0 ? Math.max(1, Math.floor(captureDuration / config.interval) + 1) : 0;

  const handlePresetSelect = (value: number) => {
    onChangeConfig({ ...config, interval: value });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      onChangeConfig({ ...config, interval: val });
    }
  };

  const handleStartTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseTimeString(e.target.value);
    if (parsed !== null) {
      const validStart = Math.min(Math.max(0, parsed), config.endTime - 0.1);
      onChangeConfig({ ...config, startTime: validStart });
    }
  };

  const handleEndTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseTimeString(e.target.value);
    if (parsed !== null) {
      const validEnd = Math.max(Math.min(duration, parsed), config.startTime + 0.1);
      onChangeConfig({ ...config, endTime: validEnd });
    }
  };

  const handleResetTimes = () => {
    onChangeConfig({
      ...config,
      startTime: 0,
      endTime: duration,
    });
  };

  const isCustomPreset = !presets.some((p) => p.value === config.interval);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 md:p-6 shadow-xl flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        {/* Section Header */}
        <div className="border-b border-neutral-800/80 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-white text-base">Editor de Captura</h3>
          </div>
          <span className="text-xs text-neutral-400 font-mono">
            {formatTime(captureDuration)} de corte
          </span>
        </div>

        {/* Interval Control */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Intervalo entre frames
            </label>
            <span className="text-xs text-indigo-400 font-medium">
              1 frame a cada {config.interval}s
            </span>
          </div>

          {/* Presets Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {presets.map((p) => {
              const isSelected = config.interval === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePresetSelect(p.value)}
                  disabled={progress.isProcessing}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                      : 'bg-neutral-800/70 text-neutral-300 hover:bg-neutral-800 hover:text-white border border-neutral-750'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
            <div
              className={`py-1.5 px-2 rounded-lg text-xs font-medium text-center border transition-all ${
                isCustomPreset
                  ? 'bg-indigo-950/60 border-indigo-600 text-indigo-300'
                  : 'bg-neutral-800/40 border-neutral-800 text-neutral-400'
              }`}
            >
              Custom
            </div>
          </div>

          {/* Manual input */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs">
            <span className="text-neutral-400">Capturar 1 frame a cada</span>
            <input
              type="number"
              min="0.1"
              max="60"
              step="0.5"
              value={config.interval}
              onChange={handleIntervalChange}
              disabled={progress.isProcessing}
              className="w-18 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-md text-white font-mono text-center focus:outline-none focus:border-indigo-500 tabular-nums"
            />
            <span className="text-neutral-400">segundos</span>
          </div>
        </div>

        {/* Start & End Times */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Trecho de Captura
            </label>
            <button
              type="button"
              onClick={handleResetTimes}
              disabled={progress.isProcessing}
              className="text-[11px] text-neutral-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Vídeo completo</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Start Time */}
            <div className="space-y-1.5">
              <span className="text-xs text-neutral-400">Início da captura</span>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={formatTime(config.startTime)}
                  key={`start_${config.startTime}`}
                  onBlur={handleStartTimeBlur}
                  disabled={progress.isProcessing}
                  placeholder="00:00"
                  className="w-full px-3 py-2 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500 tabular-nums"
                />
              </div>
            </div>

            {/* End Time */}
            <div className="space-y-1.5">
              <span className="text-xs text-neutral-400">Fim da captura</span>
              <div className="relative">
                <input
                  type="text"
                  defaultValue={formatTime(config.endTime)}
                  key={`end_${config.endTime}`}
                  onBlur={handleEndTimeBlur}
                  disabled={progress.isProcessing}
                  placeholder="00:30"
                  className="w-full px-3 py-2 bg-neutral-950/70 border border-neutral-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-indigo-500 tabular-nums"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Format and Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Format selector */}
          <div className="space-y-1.5">
            <span className="text-xs text-neutral-400">Formato das Imagens</span>
            <div className="flex rounded-xl bg-neutral-950/70 p-1 border border-neutral-800">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, format: 'png' })}
                disabled={progress.isProcessing}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  config.format === 'png'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                PNG (Sem perdas)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, format: 'jpeg' })}
                disabled={progress.isProcessing}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  config.format === 'jpeg'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                JPG (Mais leve)
              </button>
            </div>
          </div>

          {/* Timestamp in filename checkbox */}
          <div className="space-y-1.5">
            <span className="text-xs text-neutral-400">Nomeação dos Arquivos</span>
            <label className="flex items-center gap-2 px-3 py-2 bg-neutral-950/70 border border-neutral-800 rounded-xl text-xs text-neutral-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.includeTimestampInFilename}
                onChange={(e) =>
                  onChangeConfig({
                    ...config,
                    includeTimestampInFilename: e.target.checked,
                  })
                }
                disabled={progress.isProcessing}
                className="accent-indigo-600 rounded"
              />
              <span>Incluir timestamp (ex: frame-001-00m02s)</span>
            </label>
          </div>
        </div>

        {/* Estimated Frames Notification Box */}
        <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-900/60 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-indigo-200">
                Serão gerados aproximadamente{' '}
                <span className="font-bold text-white font-mono tabular-nums">
                  {estimatedFrames}
                </span>{' '}
                frames.
              </p>
              <p className="text-[11px] text-indigo-300/70">
                Cálculo em tempo real para o trecho selecionado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Action Button & Progress */}
      <div className="pt-2 border-t border-neutral-800/80 space-y-3">
        {progress.isProcessing ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-indigo-300 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                {progress.statusMessage || 'Gerando frames...'}
              </span>
              <span className="font-mono text-neutral-400 tabular-nums">
                {progress.currentFrame} / {progress.totalFrames} ({progress.percentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-150"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onCancelExtraction}
              className="w-full py-2 px-4 rounded-xl text-xs font-medium text-neutral-400 bg-neutral-800/80 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Interromper extração</span>
            </button>
          </div>
        ) : (
          <div>
            <button
              type="button"
              onClick={onStartExtraction}
              className="w-full py-3.5 px-6 rounded-xl text-sm font-bold tracking-wide uppercase text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] shadow-lg shadow-indigo-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>GERAR FRAMES</span>
            </button>

            {progress.isComplete && !progress.error && (
              <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Frames gerados com sucesso!</span>
              </div>
            )}

            {progress.error && (
              <div className="mt-2.5 text-xs text-red-400 text-center">
                {progress.error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
