/**
 * Formats seconds into MM:SS format (e.g. 01:25) or HH:MM:SS if over 1 hour
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSeconds = Math.floor(seconds);
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats seconds into MM:SS.ms format for high precision video scrubbers
 */
export function formatTimeWithSubseconds(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00.0';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const tenths = Math.floor((seconds % 1) * 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
}

/**
 * Formats seconds into filename safe string (e.g. 01m24s)
 */
export function formatFileSafeTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}m${secs.toString().padStart(2, '0')}s`;
}

/**
 * Parses MM:SS or integer seconds into total seconds
 */
export function parseTimeString(timeStr: string): number | null {
  if (!timeStr || !timeStr.trim()) return null;
  const parts = timeStr.trim().split(':');
  if (parts.length === 1) {
    const s = parseFloat(parts[0]);
    return isNaN(s) ? null : Math.max(0, s);
  }
  if (parts.length === 2) {
    const mins = parseFloat(parts[0]);
    const secs = parseFloat(parts[1]);
    if (isNaN(mins) || isNaN(secs)) return null;
    return Math.max(0, mins * 60 + secs);
  }
  if (parts.length === 3) {
    const hrs = parseFloat(parts[0]);
    const mins = parseFloat(parts[1]);
    const secs = parseFloat(parts[2]);
    if (isNaN(hrs) || isNaN(mins) || isNaN(secs)) return null;
    return Math.max(0, hrs * 3600 + mins * 60 + secs);
  }
  return null;
}

/**
 * Formats file size in bytes to human readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Generates standardized frame file name
 * e.g. frame-001.png or frame-001-00m02s.png
 */
export function generateFrameFileName(
  index: number,
  timestamp: number,
  format: 'png' | 'jpeg',
  includeTimestamp: boolean
): string {
  const paddedIndex = index.toString().padStart(3, '0');
  const ext = format === 'jpeg' ? 'jpg' : 'png';
  if (includeTimestamp) {
    const safeTime = formatFileSafeTime(timestamp);
    return `frame-${paddedIndex}-${safeTime}.${ext}`;
  }
  return `frame-${paddedIndex}.${ext}`;
}
