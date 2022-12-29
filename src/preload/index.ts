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
  // 设置窗口置顶
  setOntop: (flgTop: boolean) => ipcRenderer.send('set-optop', flgTop),
  // 新建窗口
  createTab: (uid?: string) => ipcRenderer.send('create-tab', uid),
  // 保存内容
  saveContent: (content: string) => ipcRenderer.send('save-content', content),
  // 打开历史页面
  openHistory: () => ipcRenderer.send('open-history'),
  /*** main->render ***/
  // 渲染内容
  onEditorContainer: (callback) => ipcRenderer.on('editor-container', callback),
  // 窗口获取、失去焦点事件
  getFocus: (callback) => ipcRenderer.on('get-focus', callback)
});
