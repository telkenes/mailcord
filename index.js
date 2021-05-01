const { app, Menu, Tray, BrowserWindow, globalShortcut, clipboard, ipcMain, nativeImage, TouchBarLabel } = require('electron')
const crypto = require('crypto-js')
const phin = require('phin')
const settings = require('electron-settings');

//window variables
let settingsWin = null
let setupWin = null
let tray = null

const template = require('./util/template.js');

app.on('ready', async (event) => {
    // await settings.unset('mailcord')
    let config = await settings.has('mailcord')
    if (!config) openSetup()
    else startup()
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
})

async function openSetup() {
    if (setupWin) return setupWin.show()
    setupWin = new BrowserWindow({
        show: true,
        title: "Mailcord - Setup",
        width: 600,
        height: 500,
        resizeable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    setupWin.loadURL(`file://${__dirname}/static/setup.html`)

    setupWin.on('closed', async () => {
        setupWin = null
        let config = await settings.has('mailcord')
        if (!config) app.quit()
        else startup()
    })
    ipcMain.on('mailcord:setup', (...args) => require('./util/listener.js').setup(settings, setupWin, ...args))
}

async function openSettings() {
    if (settingsWin) return settingsWin.show()
    settingsWin = new BrowserWindow({
        show: true,
        title: "Mailcord - Settings",
        width: 600,
        height: 500,
        resizeable: false,
        maximizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    settingsWin.loadURL(`file://${__dirname}/static/settings.html`)

    settingsWin.webContents.on('dom-ready', async () => {
        console.log('ready!')
        settingsWin.webContents.send('mailcord:init', await settings.get('mailcord'));
        settingsWin.moveTop();
        settingsWin.show();
        if (process.platform === 'darwin') app.dock.show();
      });

    settingsWin.on('closed', () => {
        settingsWin = null
    })   
}

const n = require('mail-notifier')
async function startup() {
    openSettings()
    tray = new Tray(__dirname + '/assets/icons/icon512.png')
    tray.setToolTip('Mailcord')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Settings', click: openSettings},
        { type: 'separator'},
        { label: 'Quit', role: 'quit' }
      ])
    tray.setContextMenu(contextMenu)
    let conf = await settings.get('mailcord')
    conf.forEach((account, index) => {
        let info = {
            user: account.email,
            password: account.password,
            host: account.host,
            port: account.port,
            tls: true,
            tlsOptions: { rejectUnauthorized: TouchBarLabel },
            markSeen: account.seen
        }

        let notifier = n(info)
        notifier.on('connected', () => { })
        notifier.on('mail', async (mail) => {
            let embed = {
                'title': `New Email (${account.code}) | From **${mail.from[0].name}** (${mail.from[0].address})`,
                'url': `https://mail.google.com/mail/`,
                'description': `__**${mail.subject}**__\n\n${mail.text}`,
                'timestamp': new Date()
            }
            let lastemail = account.last
            if (lastemail.text === mail.text) return
            if (new Date(lastemail.receivedDate).getTime() >= new Date(mail.receivedDate).getTime()) return
            settings.set(`mailcord[${index}].last`, mail)
            
            phin({
                url: account.webhook,
                method: 'POST',
                data: {
                    'embeds': [
                        embed
                    ]
                }
            })
        })
        notifier.on('end', () => notifier.start())
        notifier.on('error', (e) => console.log(e))
        notifier.start()
    })
}



// process.platform === 'darwin' (mac)

app.on('window-all-closed', (event) => {
    event.preventDefault();
    if (process.platform === 'darwin') app.dock.hide();
});