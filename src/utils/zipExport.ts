import JSZip from 'jszip';
import { FrameItem, VideoMeta } from '../types';
import { generateFrameFileName, formatTime } from './formatters';

export interface ZipExportOptions {
  frames: FrameItem[];
  videoMeta: VideoMeta;
  interval: number;
  format: 'png' | 'jpeg';
  includeTimestampInFilename: boolean;
  zipFileName?: string;
  onProgress?: (percent: number) => void;
}

export async function exportFramesToZip(options: ZipExportOptions): Promise<void> {
  const {
    frames,
    videoMeta,
    interval,
    format,
    includeTimestampInFilename,
    zipFileName = 'frames-do-video.zip',
    onProgress,
  } = options;

  if (frames.length === 0) {
    throw new Error('Nenhum frame selecionado para download.');
  }

  const zip = new JSZip();
  const folder = zip.folder('frames-do-video');

  if (!folder) {
    throw new Error('Falha ao criar pasta dentro do ZIP.');
  }

  // 1. Add each selected frame to the folder
  frames.forEach((frame, idx) => {
    // Preserve sequence ordering: 1, 2, 3...
    const fileName = generateFrameFileName(
      idx + 1,
      frame.timestamp,
      format,
      includeTimestampInFilename
    );
    folder.file(fileName, frame.blob);
  });

  // 2. Generate README.txt with project documentation and web design tips
  const generationDate = new Date().toLocaleString('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const readmeContent = `===================================================================
FrameSite AI — Referências Visuais para Recriação de Sites
===================================================================

Este pacote contém os frames extraídos do vídeo para servir como
guia visual detalhado na recriação de layouts, seções e animações web.

DADOS DA EXTRAÇÃO:
- Nome do vídeo original: ${videoMeta.name}
- Duração total do vídeo: ${formatTime(videoMeta.duration)}
- Resolução nativa: ${videoMeta.width} × ${videoMeta.height} px
- Intervalo de captura: 1 frame a cada ${interval} segundo(s)
- Quantidade de frames exportados: ${frames.length}
- Formato das imagens: ${format.toUpperCase()}
- Data de geração: ${generationDate}

ESTRUTURA DO PACOTE:
frames-do-video/
${frames
  .slice(0, 5)
  .map(
    (f, i) =>
      `├── ${generateFrameFileName(i + 1, f.timestamp, format, includeTimestampInFilename)}  [${f.timeFormatted}]`
  )
  .join('\n')}
${frames.length > 5 ? `└── ... e mais ${frames.length - 5} frames cronológicos` : '└── (fim dos frames)'}

COMO USAR ESTES FRAMES NO SEU FLUXO DE DESENVOLVIMENTO:
1. FIGMA / SKETCH / PENPOT:
   Arraste os frames diretamente para o canvas do seu software de design.
   Use-os como referência lado a lado com seu novo layout.

2. MAPEAMENTO DE SEÇÕES:
   - Identifique cada seção da página (Navbar, Hero, Prova Social, Features, Preços, FAQ, Footer).
   - Analise os estados de scroll e momentos de transição entre seções.

3. PALETA DE CORES E TIPOGRAFIA:
   - Use a ferramenta conta-gotas (eyedropper) nos frames para extrair a paleta exata.
   - Observe a hierarquia de fontes, espaçamentos (padding/margin) e grids.

4. RECRIAÇÃO EM CÓDIGO (Tailwind CSS, React, Webflow, WordPress):
   - Mantenha a imagem aberta na tela secundária ou use overlay com opacidade 50%
     para comparar o alinhamento de containers (max-w, gaps, cantos arredondados).

Gerado por FrameSite AI.
Seu vídeo foi processado localmente no navegador com total privacidade.
`;

  folder.file('README.txt', readmeContent);

  // 3. Generate ZIP blob with progress updates
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  // 4. Trigger download in browser
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = zipFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Cleanup after a short delay
  setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 2000);
}

/**
 * Direct download for a single frame
 */
export function downloadSingleFrame(
  frame: FrameItem,
  format: 'png' | 'jpeg',
  includeTimestamp: boolean
): void {
  const fileName = generateFrameFileName(
    frame.index,
    frame.timestamp,
    format,
    includeTimestamp
  );
  const a = document.createElement('a');
  a.href = frame.dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
