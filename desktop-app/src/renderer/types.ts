export interface CadWindowSource {
  id: string;
  name: string;
  thumbnailDataUrl: string;
  isCadApp: boolean;
}

export type SceneType = 'interior' | 'exterior';

export interface StyleOption {
  id: string;
  name: string;
  emoji: string;
  promptMod: string;
}

export interface LightingOption {
  id: string;
  name: string;
  emoji: string;
  promptMod: string;
}

export interface MaterialOption {
  id: string;
  name: string;
  promptMod: string;
}

declare global {
  interface Window {
    v6Desktop?: {
      getCadWindows: () => Promise<CadWindowSource[]>;
      captureWindow: (sourceId: string) => Promise<string>;
      captureScreen: () => Promise<string>;
      copyImageToClipboard: (dataUrl: string) => Promise<boolean>;
      saveImageFile: (options: { dataUrl: string; defaultName?: string }) => Promise<boolean>;
      openExternalUrl: (url: string) => Promise<void>;
      onTriggerCapture: (callback: () => void) => () => void;
    };
  }
}
