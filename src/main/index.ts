import { app, Menu, Tray, shell, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { is } from '@electron-toolkit/utils';

const run_path = path.join(path.resolve(__dirname, ''), '../../');

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 390,
    height: 390,
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

  mainWindow.on('ready-to-show', () => {
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

  // 托盘菜单
  const tray =
    process.platform == 'linux'
      ? new Tray(`${run_path}/assets/logo/logox32.png`)
      : new Tray(`${run_path}/assets/logo/logox16.png`);

  const contextMenu = Menu.buildFromTemplate([
    { label: '新建', click: createWindow },
    { label: '历史便筏' },
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

  createWindow();
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
