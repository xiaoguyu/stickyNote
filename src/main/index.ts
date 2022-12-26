import { app, Menu, Tray, shell, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { is } from '@electron-toolkit/utils';
import { WinStore, uuid } from './utils';

const Store = require('electron-store');
const run_path = path.join(path.resolve(__dirname, ''), '../../');

const store = new Store();
// 存储窗口的id与uid关系的map，key：id、value：uid
const winIdMap = new Map();
const WIN_ARR_KEY = 'winarr';

// 初始化方法
function init() {
  // 如果有记录，则恢复窗口
  const winArr: WinStore[] = store.get(WIN_ARR_KEY, []);
  for (const _win of winArr) {
    if (_win.flgView) {
      const _bounds = _win.bounds;
      createWindow(_bounds.width, _bounds.height, _bounds.x, _bounds.y, _win.uid);
    }
  }
}

// 创建一个新窗口
function createWindow(_width = 390, _height = 390, _x?: number, _y?: number, _uid?: string): void {
  const mainWindow = new BrowserWindow({
    width: _width,
    height: _height,
    x: _x,
    y: _y,
    show: false,
    frame: false, // 无窗体，无标题栏
    transparent: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  // 默认打开开发者工具
  mainWindow.webContents.openDevTools();

  // 窗口移动，重新记录位置
  mainWindow.on('move', (event) => {
    storeBounds(event.sender);
  });
  // 窗口修改大小，重新记录
  mainWindow.on('resize', (event) => {
    storeBounds(event.sender);
  });
  // 窗口关闭时，修改显示标志
  mainWindow.on('closed', (event) => {
    signView(event.sender);
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
    console.log('details.url', details.url);
    return { action: 'deny' };
  });

  // 热更新(HMR)判断加载url还是本地文件
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 保存窗口数据
  sotreWindow(mainWindow, _uid);
}

// 渲染内容
function editorContainer(_window: BrowserWindow, _uid: string) {
  const winArr: WinStore[] = store.get(WIN_ARR_KEY, []);
  for (const i in winArr) {
    const _win = winArr[i];
    if (_win.uid === _uid) {
      console.log('editor-container', _win.content);
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
  const winArr: WinStore[] = store.get(WIN_ARR_KEY, []);
  winArr.unshift(winAttr);
  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);
  // 保存映射关系
  winIdMap.set(_window.id + '', _uid);
}

// 记录窗口的位置和大小
function storeBounds(_window: BrowserWindow) {
  const uid = winIdMap.get(_window.id + '');
  const winArr: WinStore[] = store.get(WIN_ARR_KEY, []);
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
// 修改数据的显示标志位
function signView(_window: BrowserWindow) {
  const uid = winIdMap.get(_window.id + '');
  const winArr: WinStore[] = store.get(WIN_ARR_KEY, []);
  for (const i in winArr) {
    const _win = winArr[i];
    if (_win.uid === uid) {
      _win.flgView = false;
      winArr[i] = _win;
      break;
    }
  }
  // 保存窗口数据
  store.set(WIN_ARR_KEY, winArr);
}

// 设置窗口置顶
function handleSetOntop(event, flgTop: boolean) {
  const webContents = event.sender;
  const win = BrowserWindow.fromWebContents(webContents);
  win?.setAlwaysOnTop(flgTop);
}
// 创建新建窗口（由页面中的新增按钮触发）
function handleCreateTab() {
  createWindow();
}

app.whenReady().then(() => {
  // Set app user model id for windows
  // electronApp.setAppUserModelId('com.electron')
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
    { label: '历史便筏' },
    {
      label: '测试',
      click: () => {
        testFun();
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

  // createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on('window-all-closed', (event) => {
//   // 截获 close 默认行为(此处拦截没有窗口时退出软件)
//   event.preventDefault();
// });
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 测试方法
function testFun() {
  console.log(666);
}
