const { ipcMain } = require("electron")

module.exports = {
    setup: async (settings, setupWin, e, config) => {
        let emails = [
            {
                email: config.email,
                password: config.password,
                host: config.host,
                port: config.port,
                seen: config.seen,
                code: config.code,
                webhook: config.webhook,
                last: {}
            }
        ]
        await settings.set('mailcord', emails)
        setupWin.close()
    },
    add: async (settings, settingsWin, startNotifier, accs, e, config) => {
        let conf = await settings.get('mailcord')

        conf.push({
            email: config.email,
            password: config.password,
            host: config.host,
            port: config.port,
            seen: config.seen,
            code: config.code,
            webhook: config.webhook,
            last: {}
        })
        await settings.set('mailcord', conf)
        settingsWin.webContents.send('mailcord:init', conf, accs)
        startNotifier(conf)
    },
    edit: async (settings, settingsWin, startNotifier, accs, e, config) => {
        /*
            should receive data
            {
                i, email, password, host, port, seen, code, webhook
            }
        */

        let conf = await settings.get('mailcord')

        conf[config.i] = {
            email: config.email,
            password: config.password,
            host: config.host,
            port: config.port,
            seen: config.seen,
            code: config.code,
            webhook: config.webhook,
            last: {}
        }
        await settings.set('mailcord', conf)    
        settingsWin.webContents.send('mailcord:init', conf, accs)
        startNotifier(conf)
    },
    remove: async (settings, settingsWin, startNotifier, accs, e, index) => {
        let conf = await settings.get('mailcord')
        conf.splice(index, 1)
        await settings.set('mailcord', conf)
        settingsWin.webContents.send('mailcord:init', conf, accs)
        startNotifier(conf)
    }
}