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

    remove: async (settings, e, index) => {
        let conf = await settings.get('mailcord')

        let newsettings = conf.slice(index, 1)
        await settings.set('mailcord', newsettings)
    }
}