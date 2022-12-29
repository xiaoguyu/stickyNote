import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  const WIN_ARR_KEY = 'winarr';

  interface Window {
    electron: ElectronAPI;
    api: unknown;
    electronApi: {
      /*** render->main ***/
      // 设置窗口置顶
      setOntop(boolean): void;
      // 新建窗口
      createTab(uid?: string): void;
      // 保存内容
      saveContent(string): void;
      // 打开历史页面
      openHistory(): void;
      /*** main->render ***/
      // 渲染内容
      onEditorContainer(callback: (event: IpcRendererEvent, arg) => void): void;

      /* history页面使用 */
      /*** render->main ***/
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        // any other methods you've defined...
      };
      // 右击菜单删除笔记
      closeTab(string): void;
      // 右击菜单（显示、关闭笔记）
      viewTab(flgView: boolean, uid: string): void;
      /*** main->render ***/
      rerender(callback: () => void): void;
    };
  }
}
