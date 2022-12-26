import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: unknown;
    electronApi: {
      setOntop(boolean): void;
      createTab(): void;
      onEditorContainer(callback: (event: IpcRendererEvent, arg) => void): void;
    };
  }
}
