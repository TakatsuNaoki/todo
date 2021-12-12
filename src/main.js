const {app, BrowserWindow} = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
	    width: 960, height: 600,
    title: 'TODOアプリ',
    webPreferences: {
	  //contextIsolation: true,
      //preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
	    mainWindow = null;
  });
}

app.on('ready', createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
	    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
	    createWindow();
  }
});