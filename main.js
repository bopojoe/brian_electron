const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let configWindow;

const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
console.log('User Data Path:', app.getPath('userData'));
// Ensure the configuration file exists
if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ webhookUrl: "", buttons: [] }, null, 2));
}

// Read configuration
const loadConfig = () => {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
};

// Save configuration
const saveConfig = (config) => {
    console.log('Using configuration file at:', CONFIG_PATH);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
};

app.on('ready', () => {
    // Register handlers
    ipcMain.handle('get-config', () => {
        return loadConfig();
    });

    ipcMain.handle('save-config', (event, config) => {
        saveConfig(config);
    });

    ipcMain.handle('open-config-window', () => {
        if (configWindow) return;

        configWindow = new BrowserWindow({
            width: 400,
            height: 500,
            parent: mainWindow,
            modal: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
            },
        });

        configWindow.loadFile('config.html');
        configWindow.on('closed', () => {
            configWindow = null;
        });
    });


    ipcMain.handle('save-new-button', (event, button) => {
        const config = loadConfig();
        config.buttons.push(button);
        saveConfig(config);
        if (configWindow) configWindow.close();
        mainWindow.webContents.send('refresh-buttons');
        
    });


    ipcMain.handle('send-webhook', async (event, { webhookUrl, payload }) => {
        const axios = require('axios');
        try {
            const response = await axios.post(webhookUrl, payload);
            return { success: true, status: response.status };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // Create the main window
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadFile('index.html');
});
