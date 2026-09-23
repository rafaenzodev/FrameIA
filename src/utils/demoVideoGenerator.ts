/**
 * Generates a realistic 6-second animated WebM video of a website being scrolled,
 * completely locally inside the browser using HTML5 Canvas and MediaRecorder.
 * This ensures the user can test FrameSite AI immediately even without a video on hand.
 */
export async function generateDemoWebsiteVideo(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const stream = canvas.captureStream(30); // 30 fps
  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 3000000,
  });

  const chunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<File>((resolve, reject) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], 'demo-website-showcase.webm', {
        type: 'video/webm',
        lastModified: Date.now(),
      });
      resolve(file);
    };

    mediaRecorder.onerror = (e) => reject(e);

    mediaRecorder.start();

    const totalDurationMs = 6000;
    const startTime = performance.now();

    function drawFrame(now: number) {
      if (!ctx) return;
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / totalDurationMs);

      // Scroll offset curve: smoothly scroll down through the site sections
      // 0 to 0.15: Hero
      // 0.15 to 0.45: Scroll to Features
      // 0.45 to 0.75: Scroll to Pricing / Testimonials
      // 0.75 to 1.0: Scroll to Footer & Final CTA
      const totalPageHeight = 2400;
      const maxScroll = totalPageHeight - 720;
      const scrollY = Math.sin(progress * Math.PI * 0.9) * maxScroll;

      ctx.save();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1280, 720);

      // Translate viewport by scroll
      ctx.translate(0, -scrollY);

      // 1. TOP HEADER (Sticky in mind, or scrolled)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, 1280, 80);
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(60, 40, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('Horizon Studio', 90, 47);

      ctx.font = '500 15px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('Features', 700, 46);
      ctx.fillText('Showcase', 820, 46);
      ctx.fillText('Pricing', 940, 46);
      ctx.fillText('Docs', 1040, 46);

      ctx.fillStyle = '#4f46e5';
      ctx.roundRect ? ctx.roundRect(1120, 24, 110, 36, 6) : ctx.fillRect(1120, 24, 110, 36);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('Get Started', 1135, 47);

      // 2. HERO SECTION (Y: 80 - 680)
      const gradient = ctx.createLinearGradient(0, 80, 0, 680);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(1, '#1e1b4b');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 80, 1280, 600);

      // Hero tag
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(480, 140, 320, 34, 17) : ctx.fillRect(480, 140, 320, 34);
      ctx.fill();
      ctx.fillStyle = '#a5b4fc';
      ctx.font = '600 13px sans-serif';
      ctx.fillText('✨ NEXT GENERATION WEB INTERFACES', 505, 162);

      // Hero Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 54px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Turn Creative Concepts', 640, 240);
      ctx.fillText('Into High-Impact Digital Products', 640, 310);

      // Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '400 20px sans-serif';
      ctx.fillText('Architected for developers, crafted for designers, tested by millions.', 640, 370);

      // Hero Buttons
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(500, 430, 170, 52, 10) : ctx.fillRect(500, 430, 170, 52);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Start Free Trial', 585, 462);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(690, 430, 160, 52, 10) : ctx.strokeRect(690, 430, 160, 52);
      ctx.stroke();
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('Book Demo →', 770, 462);

      // Mock Product Dashboard Preview Card
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(240, 520, 800, 340, 16) : ctx.fillRect(240, 520, 800, 340);
      ctx.fill();
      ctx.stroke();

      // Dashboard inner UI
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(260, 540, 760, 40);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath(); ctx.arc(280, 560, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#eab308';
      ctx.beginPath(); ctx.arc(296, 560, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath(); ctx.arc(312, 560, 5, 0, Math.PI * 2); ctx.fill();

      // Dashboard stats
      ctx.fillStyle = '#334155';
      ctx.fillRect(260, 600, 230, 200);
      ctx.fillRect(510, 600, 230, 200);
      ctx.fillRect(760, 600, 260, 200);

      // 3. SECTION 2: BENTO FEATURES (Y: 900 - 1500)
      ctx.textAlign = 'left';
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('MODERN ARCHITECTURE', 140, 940);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('Engineered For Extreme Responsiveness', 140, 985);

      // Feature Card 1
      ctx.fillStyle = '#18181b';
      ctx.strokeStyle = '#27272a';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(140, 1020, 480, 240, 12) : ctx.fillRect(140, 1020, 480, 240);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4f46e5';
      ctx.fillRect(170, 1050, 48, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Instant Frame Sync', 170, 1130);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '15px sans-serif';
      ctx.fillText('Synchronize animations across browsers with zero layout shift.', 170, 1165);

      // Feature Card 2
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(660, 1020, 480, 240, 12) : ctx.fillRect(660, 1020, 480, 240);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(690, 1050, 48, 48);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('Vector Asset Extraction', 690, 1130);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '15px sans-serif';
      ctx.fillText('Export component layouts directly into Figma-compatible assets.', 690, 1165);

      // 4. SECTION 3: PRICING & CALL TO ACTION (Y: 1520 - 2100)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a855f7';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('PLANS & ACCESS', 640, 1560);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('Straightforward pricing for creative teams', 640, 1610);

      // Plan 1: Starter
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(240, 1660, 360, 320, 12) : ctx.fillRect(240, 1660, 360, 320);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Designer Pro', 420, 1720);
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('$29', 420, 1780);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('per member / month', 420, 1815);

      // Plan 2: Enterprise
      ctx.fillStyle = '#1e1b4b';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(680, 1660, 360, 320, 12) : ctx.fillRect(680, 1660, 360, 320);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('Studio Enterprise', 860, 1720);
      ctx.font = 'bold 42px sans-serif';
      ctx.fillText('$79', 860, 1780);
      ctx.font = '14px sans-serif';
      ctx.fillStyle = '#c7d2fe';
      ctx.fillText('unlimited collaborators', 860, 1815);

      // 5. FOOTER (Y: 2150 - 2400)
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 2150, 1280, 250);
      ctx.fillStyle = '#71717a';
      ctx.font = '14px sans-serif';
      ctx.fillText('© 2026 Horizon Studio Inc. All rights reserved. Built with precision.', 640, 2280);

      // Draw an animated mouse cursor moving on screen
      const cursorX = 640 + Math.cos(progress * Math.PI * 4) * 200;
      const cursorY = scrollY + 360 + Math.sin(progress * Math.PI * 3) * 100;
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cursorX, cursorY);
      ctx.lineTo(cursorX + 16, cursorY + 16);
      ctx.lineTo(cursorX + 8, cursorY + 16);
      ctx.lineTo(cursorX + 14, cursorY + 28);
      ctx.lineTo(cursorX + 10, cursorY + 30);
      ctx.lineTo(cursorX + 4, cursorY + 18);
      ctx.lineTo(cursorX, cursorY + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.restore();

      if (progress < 1) {
        requestAnimationFrame(drawFrame);
      } else {
        setTimeout(() => {
          mediaRecorder.stop();
        }, 100);
      }
    }

    requestAnimationFrame(drawFrame);
  });
}
