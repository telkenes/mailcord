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
    add: async (settings, e, config) => {
        let conf = await settings.get('mailcord')

        let newsettings = conf.push({
            email: config.email,
            password: config.password,
            host: config.host,
            port: config.port,
            seen: config.seen,
            code: config.code,
            webhook: config.webhook,
            last: {}
        })
        await settings.set('mailcord', newsettings)
    },

    remove: async (settings, settingsWin, e, index) => {
        console.log('listener go brrr')
        let conf = await settings.get('mailcord')

        conf.splice(index, 1)
        console.log(conf)
        await settings.set('mailcord', conf)
        settingsWin.webContents.send('mailcord:init', conf)
    }
}