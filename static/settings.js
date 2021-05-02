const electron = require('electron')
const { ipcRenderer } = electron


let showError = (message) => {
    document.getElementById('error').style.opacity = 1
    document.getElementById('error').innerHTML = `<div class="error danger">${message}</div>`
    setTimeout(() => {
        decreaseOp('error', 0.01, 1, () => { document.getElementById('error').innerHTML = '' })
    }, 2000)
}

ipcRenderer.on('mailcord:init', (e, accounts) => {
    console.log(accounts)
    let acc = []

    accounts.forEach((account, i) => {
        acc.push(`
            <div id="acc${i}" class="accbutton">
            <span class="label" onclick="document.getElementById('account${i}').classList.toggle('visible');">${account.email} 
            <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
            </div>
            <div id="account${i}" class="acc">
			    <span class="label">User</span>
			    <input type="email" name="email" id="email" placeholder="hello@world.com" value="${account.email}">
			    <span class="label">Password</span>
			    <div class="pass">
				    <input type="password" name="password" id="password" style="margin-bottom: 30px;" value="${account.password}">
				    <i class="far fa-eye" id="togglePassword"></i>
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
                <div class="inline-btn">
				    <a id="s${i}" class="button" onclick="save(this)">Save</a> <a id="del${i}" class="button" onclick="del(this)">Delete</a>
			    </div>
            </div>
        `)
    })

    document.getElementById('accounts').innerHTML = acc.join("\n")
})

function save(element) {
    let i = Number(element.id.replace('s', ''))
    console.log(i)
    let email = document.querySelector(`div#account${i} #email`).value
    console.log(email)
}

function del(element) {
    let i = Number(element.id.replace('del', ''))
    console.log(i)
    ipcRenderer.send('mailcord:remove', i)
}