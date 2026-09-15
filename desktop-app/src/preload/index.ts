import { contextBridge, ipcRenderer } from 'electron';

export interface V6DesktopAPI {
  getCadWindows: () => Promise<Array<{ id: string; name: string; thumbnailDataUrl: string; isCadApp: boolean }>>;
  captureWindow: (sourceId: string) => Promise<string>;
  captureScreen: () => Promise<string>;
  copyImageToClipboard: (dataUrl: string) => Promise<boolean>;
  saveImageFile: (options: { dataUrl: string; defaultName?: string }) => Promise<boolean>;
  openExternalUrl: (url: string) => Promise<void>;
  onTriggerCapture: (callback: () => void) => () => void;
}

const api: V6DesktopAPI = {
  getCadWindows: () => ipcRenderer.invoke('get-cad-windows'),
  captureWindow: (sourceId: string) => ipcRenderer.invoke('capture-window', sourceId),
  captureScreen: () => ipcRenderer.invoke('capture-screen'),
  copyImageToClipboard: (dataUrl: string) => ipcRenderer.invoke('copy-image-to-clipboard', dataUrl),
  saveImageFile: (options) => ipcRenderer.invoke('save-image-file', options),
  openExternalUrl: (url: string) => ipcRenderer.invoke('open-external-url', url),
  onTriggerCapture: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('trigger-viewport-capture', handler);
    return () => {
      ipcRenderer.removeListener('trigger-viewport-capture', handler);
    };
  },
};

contextBridge.exposeInMainWorld('v6Desktop', api);
