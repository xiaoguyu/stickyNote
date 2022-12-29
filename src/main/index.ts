import { app, Menu, Tray, shell, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { electronApp, is } from '@electron-toolkit/utils';
import { WinStore, uuid, WIN_ARR_KEY } from '../utils/utils';
import Store from 'electron-store';

const run_path = path.join(path.resolve(__dirname, ''), '../../');

const store = new Store();
Store.initRenderer();
// 存储窗口的id与uid关系的map，key：id、value：uid
const winIdMap = new Map();
// 历史记录窗口
let historyWindow: BrowserWindow;
// 用于标记需要销毁的页面的uid
let closeUid: string;

// 初始化方法
function init() {
  // 如果有记录，则恢复窗口
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  for (const _win of winArr) {
    if (_win.flgView) {
      const _bounds = _win.bounds;
      createWindow(_bounds.width, _bounds.height, _bounds.x, _bounds.y, _win.uid);
    }
  }
}

// 创建一个新窗口
function createWindow(_width = 300, _height = 300, _x?: number, _y?: number, _uid?: string): void {
  const mainWindow = new BrowserWindow({
    width: _width,
    height: _height,
    x: _x,
    y: _y,
    minWidth: 250,
    minHeight: 250,
    show: false,
    frame: false, // 无窗体，无标题栏
    transparent: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../assets/logo/logox128.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  // 默认打开开发者工具
  // mainWindow.webContents.openDevTools();

  // 窗口移动，重新记录位置
  mainWindow.on('move', (event) => {
    storeBounds(event.sender);
  });
  // 窗口修改大小，重新记录
  mainWindow.on('resize', (event) => {
    storeBounds(event.sender);
  });
  // 窗口关闭时，修改显示标志(这里不能用closed，因为mainWindow已经被销毁了，没有id)
  mainWindow.on('close', () => {
    mainClose(mainWindow);
  });

  mainWindow.on('ready-to-show', () => {
    // 渲染内容
    if (_uid) {
      editorContainer(mainWindow, _uid);
    }
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // 热更新(HMR)判断加载url还是本地文件
  renderer_path(mainWindow, 'index.html');

  // 保存窗口数据
  sotreWindow(mainWindow, _uid);

  // 重新渲染历史页面
  if (historyWindow && !historyWindow.isDestroyed()) {
    historyWindow.webContents.send('rerender');
  }
}

// 渲染内容
function editorContainer(_window: BrowserWindow, _uid: string) {
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  for (const i in winArr) {
    const _win = winArr[i];
    if (_win.uid === _uid) {
      _window.webContents.send('editor-container', _win.content);
      break;
    }
  }
}

// 保存窗口数据 + 渲染内容
function sotreWindow(_window: BrowserWindow, _uid?: string) {
  if (_uid) {
    // 保存映射关系
    winIdMap.set(_window.id + '', _uid);
    return;
  }

  _uid = uuid(8, 48);
  const winAttr = new WinStore(_uid, _window.getContentBounds(), true);
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  winArr.unshift(winAttr);
  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);
  // 保存映射关系
  winIdMap.set(_window.id + '', _uid);
}

// 记录窗口的位置和大小
function storeBounds(_window: BrowserWindow) {
  const uid = winIdMap.get(_window.id + '');
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  for (const i in winArr) {
    const _win = winArr[i];
    if (_win.uid === uid) {
      _win.bounds = _window.getContentBounds();
      winArr[i] = _win;
      break;
    }
  }
  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);
}
/*
 * 便筏窗口关闭，需要判断清除或者修改显示标志位
 */
function mainClose(_window: BrowserWindow) {
  const uid = winIdMap.get(_window.id + '');
  winIdMap.delete(_window.id + '');
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  for (let i = 0; i < winArr.length; i++) {
    const _win = winArr[i];
    if (_win.uid === uid) {
      if (_win.content && _win.uid != closeUid) {
        _win.flgView = false;
        winArr[i] = _win;
      } else {
        winArr.splice(i, 1);
      }
      break;
    }
  }

  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);

  // 重新渲染历史页面
  if (historyWindow && !historyWindow.isDestroyed()) {
    historyWindow.webContents.send('rerender');
  }
}
// 删除页面缓存数据(用于历史页面右键删除)
function mainDelete(uid: string) {
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  for (let i = 0; i < winArr.length; i++) {
    const _win = winArr[i];
    if (_win.uid === uid) {
      winArr.splice(i, 1);
      break;
    }
  }
  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);

  // 重新渲染历史页面
  if (historyWindow && !historyWindow.isDestroyed()) {
    historyWindow.webContents.send('rerender');
  }
}

// 设置窗口置顶
async function handleSetOntop(event, flgTop: boolean) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win?.setAlwaysOnTop(flgTop);
}
/*
 * 创建新建窗口（由页面中的新增按钮触发）
 * uid: 页面数据的uid
 */
async function handleCreateTab(_event, uid?: string) {
  // 如果有uid并且窗口已创建，则该窗口获取焦点，不创建新窗口
  let flgCreated = false;
  for (const [key, value] of winIdMap) {
    if (uid && value === uid) {
      const mainWindow = BrowserWindow.fromId(Number(key));
      if (mainWindow) {
        flgCreated = true;
        mainWindow.focus();
      }
      break;
    }
  }
  if (!flgCreated) {
    // 重新渲染主窗口
    const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
    for (const i in winArr) {
      const _win = winArr[i];
      if (_win.uid === uid) {
        const _bounds = _win.bounds;

        _win.flgView = true;
        winArr[i] = _win;
        // 保存窗口数据
        store.set(WIN_ARR_KEY, winArr);

        createWindow(_bounds.width, _bounds.height, _bounds.x, _bounds.y, _win.uid);
        return;
      }
    }
    createWindow();
  }
}
/*
 * 历史页面调用（显示、关闭主页面）
 * flgView: 是否显示
 * uid：页面的uid
 */
async function handleViewTab(_event, flgView: boolean, uid: string) {
  let mainWindow;
  for (const [key, value] of winIdMap) {
    if (uid && value === uid) {
      mainWindow = BrowserWindow.fromId(Number(key));
      break;
    }
  }

  if (flgView) {
    if (mainWindow) {
      mainWindow.focus();
    } else {
      // 重新渲染主窗口
      const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
      for (const i in winArr) {
        const _win = winArr[i];
        if (_win.uid === uid) {
          const _bounds = _win.bounds;

          _win.flgView = true;
          winArr[i] = _win;
          // 保存窗口数据
          store.set(WIN_ARR_KEY, winArr);

          createWindow(_bounds.width, _bounds.height, _bounds.x, _bounds.y, _win.uid);
          return;
        }
      }
    }
  } else {
    mainWindow?.close();
  }
}
// 保存render的内容
async function handleSaveContent(event, content: string) {
  const webContents = event.sender;
  const _win = BrowserWindow.fromWebContents(webContents);
  if (!_win) {
    return;
  }
  const uid = winIdMap.get(_win.id + '');
  const winArr: WinStore[] = <WinStore[]>store.get(WIN_ARR_KEY, []);
  for (const i in winArr) {
    const _win = winArr[i];
    if (_win.uid === uid) {
      _win.content = content;
      _win.updateTime = new Date();
      winArr[i] = _win;
      break;
    }
  }
  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);

  // 重新渲染历史页面
  if (historyWindow && !historyWindow.isDestroyed()) {
    historyWindow.webContents.send('rerender');
  }
}

// 打开历史页面
function showHistoryTab() {
  if (historyWindow && !historyWindow.isDestroyed()) {
    historyWindow.focus();
    return;
  }
  historyWindow = new BrowserWindow({
    width: 300,
    height: 500,
    minWidth: 350,
    show: false,
    frame: false, // 无窗体，无标题栏
    transparent: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, '../../assets/logo/logox128.png'),
    webPreferences: {
      preload: path.join(__dirname, '../preload/history.js'),
      sandbox: false
    }
  });

  // 默认打开开发者工具
  // historyWindow.webContents.openDevTools();

  historyWindow.on('ready-to-show', () => {
    historyWindow.show();
  });

  historyWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // 热更新(HMR)判断加载url还是本地文件
  renderer_path(historyWindow, 'history.html');
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.javaedit');
  // 初始化
  init();
  // 托盘菜单
  const tray =
    process.platform == 'linux'
      ? new Tray(`${run_path}/assets/logo/logox32.png`)
      : new Tray(`${run_path}/assets/logo/logox16.png`);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '新建',
      click: () => {
        createWindow();
      }
    },
    {
      label: '历史便筏',
      click: () => {
        showHistoryTab();
      }
    },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('这是一个便筏');
  tray.setContextMenu(contextMenu);

  ipcMain.on('set-optop', handleSetOntop);
  ipcMain.on('create-tab', handleCreateTab);
  // 保存render的内容
  ipcMain.on('save-content', handleSaveContent);
  // electron-store的api
  ipcMain.on('electron-store-get', async (event, val) => {
    event.returnValue = store.get(val);
  });
  ipcMain.on('electron-store-set', async (_event, key, val) => {
    store.set(key, val);
  });
  // 打开历史页面
  ipcMain.on('open-history', showHistoryTab);
  // 历史页面删除笔记
  ipcMain.on('close-tab', async (_event, uid) => {
    closeUid = uid;
    for (const [key, value] of winIdMap) {
      if (uid && value === uid) {
        const mainWindow = BrowserWindow.fromId(Number(key));
        mainWindow?.close();
        return;
      }
    }
    mainDelete(uid);
  });
  // 历史页面(显示、关闭笔记)
  ipcMain.on('view-tab', handleViewTab);

  // showHistoryTab();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', (event) => {
  // 截获 close 默认行为(此处拦截没有窗口时退出软件)
  event.preventDefault();
});
// app.on('window-all-closed', () => {
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

/** 加载网页 */
// 热更新(HMR)判断加载url还是本地文件
function renderer_path(
  window: BrowserWindow | Electron.WebContents,
  file_name: string,
  q?: Electron.LoadFileOptions
) {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/${file_name}`);
  } else {
    window.loadFile(path.join(__dirname, '../renderer', file_name), q);
  }
}
