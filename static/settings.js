const electron = require('electron')
const { ipcRenderer } = electron


let showError = (message) => {
    document.getElementById('error').style.opacity = 1
    document.getElementById('error').innerHTML = `<div class="error danger">${message}</div>`
    setTimeout(() => {
        decreaseOp('error', 0.01, 1, () => { document.getElementById('error').innerHTML = '' })
    }, 2000)
}

ipcRenderer.on('mailcord:status', (e, email, status) => {
    document.getElementById(email).innerHTML = status ? `<i class="fa fa-check" aria-hidden="true"></i>` : `<i class="fa fa-times" aria-hidden="true"></i>`
})

ipcRenderer.on('mailcord:init', (e, accounts, accs) => {
    let acc = []
    accounts.forEach((account, i) => {
        acc.push(`
            <div id="acc${i}" class="accbutton">
            <span class="label" onclick="document.getElementById('account${i}').classList.toggle('visible');">${account.email} 
            <i class="fas fa-angle-down" aria-hidden="true"></i>
            <div id="${account.email}" class="status">
            ${ accs[account.email].status === 'unknown' ? `<i class="fas fa-circle-notch fa-spin"></i>`
                : accs[account.email].status === true ? `<i class="fa fa-check" aria-hidden="true"></i>` : `<i class="fa fa-times" aria-hidden="true"></i>`
            }
            </div>
            </span>
            </div>
            <div id="account${i}" class="acc">
			    <span class="label">User</span>
			    <input type="email" name="email" id="email" placeholder="hello@world.com" value="${account.email}">
			    <span class="label">Password</span>
			    <div class="pass">
				    <input type="password" name="password" id="password${i}" style="margin-bottom: 30px;" value="${account.password}">
				    <i class="far fa-eye" id="togglePassword" onclick="toggle(this, ${i})"></i>
			    </div>
                <span class="label">Host</span>
                <input name="host" id="host" placeholder="imap.gmail.com" value="${account.host}">
                <span class="label">Port</span>
                <input name="port" id="port" placeholder="993" value="${account.port}">
                <span class="label">Mark seen</span>
                <input type="checkbox" name="seen" id="seen"${account.seen ? 'checked' : ''}>
                <span class="label">Discord webhook link</span>
                <input name="webhook" id="webhook" placeholder="https://discord.com/api/webhooks/000000000000000000/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" value="${account.webhook}">
                <hr>
                <span class="label">Email Label</span>
                <input name="webhook" id="code" placeholder="Gmail [Main]" style="margin-bottom: 30px;" value="${account.code}">
                <div class="inline-btn" style="margin-bottom: 30px;">
				    <a id="s${i}" class="button" onclick="save(this)">Save</a> <a id="del${i}" class="button" onclick="del(this)">Delete</a>
			    </div>
            </div>
        `)
    })

    document.getElementById('accounts').innerHTML = acc.join("\n")
})

function toggle(item, i) {
    const password = document.querySelector('#password' + i);
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    item.classList.toggle('fa-eye-slash');
}

function save(element) {
    let i = Number(element.id.replace('s', ''))

    let newEmail = document.querySelector(`div#acc${i} span`).innerHTML === '-- New Mail --<i class="fas fa-angle-down" aria-hidden="true"></i>' ? true : false
    let email = document.querySelector(`div#account${i} #email`).value
    let password = document.querySelector(`div#account${i} #password`).value
    let host = document.querySelector(`div#account${i} #host`).value
    let port = document.querySelector(`div#account${i} #port`).value
    let seen = document.querySelector(`div#account${i} #seen`).checked
    let code = document.querySelector(`div#account${i} #code`).value
    let webhook = document.querySelector(`div#account${i} #webhook`).value
    if (!email || !password || !host || !port || !seen || !code || !webhook) return showError('Missing required fields')
    let eRegex = /.*@.*\.[a-z]*/gm
    if (!eRegex.test(email)) return showError('Email is not valid')
    if (!webhook.startsWith('https://discord.com/api/webhooks/')) return showError('Invalid discord webhook url')
    let data = {
        email: email,
        password: password,
        host: host,
        port: port,
        seen: seen,
        code: code,
        webhook: webhook
    }
    if (!newEmail) {
        data['i'] = i
        ipcRenderer.send('mailcord:edit', data)
    } else {
        ipcRenderer.send('mailcord:add', data)
    }
}

function del(element) {
    let i = Number(element.id.replace('del', ''))
    ipcRenderer.send('mailcord:remove', i)
}

document.getElementById('add').onclick = async () => {
    let i = document.querySelectorAll('.acc').length;
    let newacc = `
    <div id="acc${i}" class="accbutton">
    <span class="label" onclick="document.getElementById('account${i}').classList.toggle('visible');">-- New Mail --<i class="fas fa-angle-down" aria-hidden="true"></i></span>
    </div>
    <div id="account${i}" class="acc">
        <span class="label">User</span>
        <input type="email" name="email" id="email" placeholder="hello@world.com">
        <span class="label">Password</span>
        <div class="pass">
            <input type="password" name="password" id="password" style="margin-bottom: 30px;">
            <i class="far fa-eye" id="togglePassword"></i>
        </div>
        <span class="label">Host</span>
        <input name="host" id="host" placeholder="imap.gmail.com">
        <span class="label">Port</span>
        <input name="port" id="port" placeholder="993">
        <span class="label">Mark seen</span>
        <input type="checkbox" name="seen" id="seen">
        <span class="label">Discord webhook link</span>
        <input name="webhook" id="webhook" placeholder="https://discord.com/api/webhooks/000000000000000000/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa">
        <hr>
        <span class="label">Email Label</span>
        <input name="webhook" id="code" placeholder="Gmail [Main]" style="margin-bottom: 30px;">
        <div class="inline-btn" style="margin-bottom: 30px;">
            <a id="s${i}" class="button" onclick="save(this)">Save</a> <a id="del${i}" class="button" onclick="del(this)">Delete</a>
        </div>
    </div>
    `
    let accs = document.getElementById('accounts').innerHTML
    document.getElementById('accounts').innerHTML = accs + newacc
}


let decreaseOp = (id, decrease, interval, func) => {
    let op = 1
    let changeop = setInterval(() => {
        op -= decrease
        if (op < 0.1) {
            func()
            clearInterval(changeop)
        }
        document.getElementById(id).style.opacity = op
    }, interval)
}