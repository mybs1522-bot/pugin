import { desktopCapturer, screen } from 'electron';

export interface CaptureSourceInfo {
  id: string;
  name: string;
  thumbnailDataUrl: string;
  isCadApp: boolean;
}

// Known architectural & 3D software window titles/processes
const CAD_PATTERNS = [
  /3ds max/i,
  /revit/i,
  /rhino/i,
  /rhinoceros/i,
  /blender/i,
  /sketchup/i,
  /autocad/i,
  /archicad/i,
  /lumion/i,
  /enscape/i,
  /twinmotion/i,
  /cinema 4d/i,
  /maya/i,
  /d5 render/i,
  /vectorworks/i,
  /solidworks/i,
  /fusion 360/i,
];

export async function getCadWindows(): Promise<CaptureSourceInfo[]> {
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: { width: 640, height: 360 },
    fetchWindowIcons: true,
  });

  const results: CaptureSourceInfo[] = [];

  for (const source of sources) {
    const isCad = CAD_PATTERNS.some((pattern) => pattern.test(source.name));
    results.push({
      id: source.id,
      name: source.name,
      thumbnailDataUrl: source.thumbnail.toDataURL(),
      isCadApp: isCad,
    });
  }

  // Sort CAD apps first, then full screens, then other windows
  return results.sort((a, b) => {
    if (a.isCadApp && !b.isCadApp) return -1;
    if (!a.isCadApp && b.isCadApp) return 1;
    return a.name.localeCompare(b.name);
  });
}

export async function captureSourceById(sourceId: string): Promise<string> {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  // Request high-resolution capture (up to 4K)
  const sources = await desktopCapturer.getSources({
    types: ['window', 'screen'],
    thumbnailSize: {
      width: Math.min(3840, Math.round(width * 2)),
      height: Math.min(2160, Math.round(height * 2)),
    },
  });

  const target = sources.find((s) => s.id === sourceId);
  if (!target) {
    throw new Error(`Window source ${sourceId} not found.`);
  }

  return target.thumbnail.toDataURL();
}

export async function capturePrimaryScreen(): Promise<string> {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: {
      width: Math.min(3840, width * 2),
      height: Math.min(2160, height * 2),
    },
  });

  if (sources.length === 0) {
    throw new Error('No screen found to capture.');
  }

  return sources[0].thumbnail.toDataURL();
}
