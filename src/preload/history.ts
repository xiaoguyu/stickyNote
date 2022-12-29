import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}

contextBridge.exposeInMainWorld('electronApi', {
  /*** render->main ***/
  // 新建窗口
  createTab: (uid?: string) => ipcRenderer.send('create-tab', uid),
  // 右击菜单关闭窗口
  closeTab: (uid: string) => ipcRenderer.send('close-tab', uid),
  // 右击菜单（显示、关闭笔记）
  viewTab: (flgView: boolean, uid: string) => ipcRenderer.send('view-tab', flgView, uid),
  // electron-store的api
  store: {
    get(key) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(property, val) {
      ipcRenderer.send('electron-store-set', property, val);
    }
    // Other method you want to add like has(), reset(), etc.
  },
  /*** main->render ***/
  rerender: (callback) => ipcRenderer.on('rerender', callback)
});
