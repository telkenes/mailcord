const electron = require('electron')
const { ipcRenderer } = electron


let showError = (message) => {
    document.getElementById('error').style.opacity = 1
    document.getElementById('error').innerHTML = `<div class="error danger">${message}</div>`
    setTimeout(() => {
        decreaseOp('error', 0.01, 1, () => {document.getElementById('error').innerHTML = ''})
    }, 2000)
}

const togglePassword = document.querySelector('#togglePassword');
const password = document.querySelector('#password');

togglePassword.addEventListener('click', function (e) {
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('btn1').onclick = () => {
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    if (!email || !password) return showError('Missing email or password ')
    let eRegex = /.*@.*\.[a-z]*/gm
    if (!eRegex.test(email)) return showError('Email is not valid')

    let showPage2 = () => {
        document.getElementById('page1').style.display = 'none' 
        document.getElementById('page2').style.display = 'block'

        increaseOp('page2', 0.01, 1)
    }

    decreaseOp('page1', 0.01, 1, showPage2)
}

document.getElementById('btn2').onclick = () => {
    let hidePage2 = () => {
        document.getElementById('page2').style.display = 'none' 
        document.getElementById('page1').style.display = 'block'

        increaseOp('page1', 0.01, 1)
    }

    decreaseOp('page2', 0.01, 1, hidePage2)
}

document.getElementById('btn3').onclick = () => {
    let email = document.getElementById('email').value
    let password = document.getElementById('password').value
    let host = document.getElementById('host').value
    let port = document.getElementById('port').value
    let seen = document.getElementById('seen').checked
    let code = document.getElementById('code').value
    let webhook = document.getElementById('webhook').value
    if (!webhook.startsWith('https://discord.com/api/webhooks/')) return showError('Invalid discord webhook url')

    ipcRenderer.send('mailcord:setup', {
        email: email,
        password: password,
        host: host,
        port: port,
        seen: seen,
        code: code,
        webhook: webhook
    });
}

let increaseOp = (id, add, interval) => {
    let op = 0
    let changeop = setInterval(() => {
        op += add
        if (op > 1) clearInterval(changeop)
        document.getElementById(id).style.opacity = op
    }, interval)
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