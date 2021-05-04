const { app, Menu, Tray, BrowserWindow, globalShortcut, clipboard, ipcMain, nativeImage, TouchBarLabel } = require('electron')
const crypto = require('crypto-js')
const phin = require('phin')
const settings = require('electron-settings');
const fs = require('fs')
//window variables
let settingsWin = null
let setupWin = null
let tray = null

let listeners = {}

const template = require('./util/template.js');
const { notif } = require('./util/notifications')

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
    if (!listeners.setup) listeners.setup = ipcMain.on('mailcord:setup', (...args) => require('./util/listener.js').setup(settings, setupWin, ...args))
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
        settingsWin.webContents.send('mailcord:init', await settings.get('mailcord'), adetails );
        settingsWin.moveTop();
        settingsWin.show();
        if (process.platform === 'darwin') app.dock.show();
    });

    settingsWin.on('closed', () => {
        settingsWin = null
    })
    if (!listeners.remove) listeners.remove = ipcMain.on('mailcord:remove', (...args) => require('./util/listener.js').remove(settings, settingsWin, startNotifier, adetails, ...args))
    if (!listeners.add) listeners.add = ipcMain.on('mailcord:add', (...args) => require('./util/listener.js').add(settings, settingsWin, startNotifier, adetails, ...args))
    if (!listeners.edit) listeners.edit = ipcMain.on('mailcord:edit', (...args) => require('./util/listener.js').edit(settings, settingsWin, startNotifier, adetails, ...args))

}

const n = require('mail-notifier')
let accs = {}
let adetails = {}
async function startup() {
    openSettings()
    tray = new Tray(__dirname + '/assets/icons/icon512.png')
    tray.setToolTip('Mailcord')
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open Settings', click: openSettings },
        { type: 'separator' },
        { label: 'Quit', role: 'quit' }
    ])
    tray.setContextMenu(contextMenu)
    let conf = await settings.get('mailcord')
    startNotifier(conf)
}

async function startNotifier(accounts) {
    Object.keys(accs).forEach(key => {
        accs[key].stop()
    })

    accounts.forEach((account, index) => {
        adetails[account.email] = {}
        adetails[account.email].status = 'unknown'
        let info = {
            user: account.email,
            password: account.password,
            host: account.host,
            port: account.port,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            markSeen: account.seen
        }

        accs[account.email] = n(info)
        accs[account.email].on('connected', () => {
            adetails[account.email].status = true
            settingsWin.webContents.send('mailcord:status', account.email, true)
            notif('Email Connected', `Notifier for ${account.email} has successfully connected`)
        })
        accs[account.email].on('mail', async (mail) => {
            let embed = {
                'title': `New Email (${account.code}) | From **${mail.from[0].name}** (${mail.from[0].address})`,
                'url': `https://mail.google.com/mail/`,
                'description': `__**${mail.subject}**__\n\n${mail.text}`,
                'timestamp': new Date()
            }
            let lastemail = account.last
            if (lastemail.text === mail.text) return
            if (new Date(lastemail.receivedDate).getTime() >= new Date(mail.receivedDate).getTime()) return
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
        //accs[account.email].on('end', () => accs[account.email].start())
        accs[account.email].on('error', (e) => {
            adetails[account.email].status = false
            settingsWin.webContents.send('mailcord:status', account.email, false)
            notif('Error', e.message)
        })
        accs[account.email].start()
    })
}


// process.platform === 'darwin' (mac)

app.on('window-all-closed', (event) => {
    event.preventDefault();
    if (process.platform === 'darwin') app.dock.hide();
});