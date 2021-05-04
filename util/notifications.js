const { Notification } = require('electron');


const notif = (t, b) => new Notification({ title: t, body: b }).show();

module.exports = { notif };