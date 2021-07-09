const electron = require('electron');
const { app, Menu, BrowserWindow, ipcMain } = electron;
const path = require('path');
const url = require('url');

require('./utils/database.js');

let functions = {};

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        title: app.getName(),
        width: 1200,
        height: 800,
        minWidth: 1200,
        minHeight: 800,
        icon: './resources/icon.png',
        webPreferences: {
            contextIsolation: false,
            devTools: app.isPackaged ? false : true,
            preload: path.resolve(__dirname, 'preload.js'),
            webSecurity: false
        }
    });

    if (app.isPackaged) Menu.setApplicationMenu(null);

    loadPage();

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function loadPage() {
    if (app.isPackaged) {
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'build', 'index.html'),
            protocol: 'file:',
            slashes: true
        }));
    } else {
        const axios = require('axios');
        axios.get('http://localhost:3000').then(() => {
            mainWindow.loadURL('http://localhost:3000');
        }).catch(() => setTimeout(() => loadPage(), 1000));
    }
}

app.on('ready', () => {
    createWindow();

    require('./utils/functions.js')(functions, mainWindow);
});

app.on('window-all-closed', () => {
    app.quit();
});

ipcMain.on('function', (event, args) => {
    let func = args.shift();
    event.returnValue = functions[func](...args);
});

// ipcMain.on('asyncFunction', (event, args) => {
//     let func = args.shift();
//     let id = args.shift();

//     functions[func](...args).then(res => {
//         event.reply('asyncReply' + id, res);
//     }).catch(err => {
//         event.reply('asyncReplyError' + id, err.message);
//     });
// });

// const { dialog } = electron;
// const { autoUpdater } = require('electron-updater');
//
// app.on('ready', () => {
//     createWindow();
//
//     require('./utils/functions.js')(functions, mainWindow);
//
//     if (app.isPackaged) autoUpdater.checkForUpdates();
// });
//
// autoUpdater.on('error', err => {
//     dialog.showMessageBox({
//         type: 'error',
//         buttons: ['Ok'],
//         title: 'Update Error',
//         message: 'An error occurred while installing the update. Error message: ' + err
//     });
// });
//
// autoUpdater.on('checking-for-update', () => {
//     functions.sendToRenderer('showAlert', 'Checking for updates...');
// });
//
// autoUpdater.on('update-available', () => {
//     functions.sendToRenderer('showAlert', 'Update found. Downloading...');
// });
//
// autoUpdater.on('update-not-available', () => {
//     functions.sendToRenderer('showAlert', 'No update found. You are running the latest version!');
// });
//
// autoUpdater.on('download-progress', progress => {
//     functions.sendToRenderer('showAlert', `Downloading update: ${progress.percent.toString().split('.')[0]}%`);
// });
//
// autoUpdater.on('update-downloaded', () => {
//     let choice = dialog.showMessageBoxSync(mainWindow, {
//         type: 'info',
//         buttons: ['Restart', 'Later'],
//         title: 'Install Update',
//         message: 'An update has been downloaded. Restart now to apply the updates. You can also restart manually later.'
//     });
//     if (choice === 0) autoUpdater.quitAndInstall();
// });
//
// ipcMain.on('checkForUpdates', event => {
//     autoUpdater.checkForUpdates();
//     event.returnValue = true;
// });
