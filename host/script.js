import * as config from "../config.js";

//const serverUrl = "ws://" + config.serverIp + ":" + config.hostWsPort;
const serverUrl = "ws://localhost:" + config.hostWsPort;
const websocket = new WebSocket(serverUrl);


var domUsersList = document.getElementById("users-list");
var domSubmissionsList = document.getElementById("submissions-list");

document.addEventListener("DOMContentLoaded", () => {
    domUsersList = document.getElementById("users-list");
    domSubmissionsList = document.getElementById("submissions-list");
});

websocket.onopen = () => window.resetLobby('buzzer');

var lobbyMode;

const messageHandlers = new Map([
    ["submission", data => {
        let user = data.user;
        let answer = data.answer;
        handleSubmission(user, answer);
    }],
    ["mode-change", data => {

    }],
    ["users-change", data => {
        if (domUsersList.children.length > data.users.length) {
            showToast('user left');
        } else if (domUsersList.children.length < data.users.length) {
            showToast('user joined');
        }
        updateUsers(data.users);
    }]
]);

window.setBuzzerLock = function (bool) {
    wsSend('set-buzzer-lock', { locked: bool });
}

window.resetLobby = function (mode) {
    lobbyMode = mode;
    switch (mode) {
        case 'buzzer':
            document.getElementById('map-answer-container').setAttribute('hidden', '');
            break;
        case 'map':
            document.getElementById('map-answer-container').removeAttribute('hidden');
            window.resetMap();
            break;
        case 'text':
            document.getElementById('map-answer-container').setAttribute('hidden', '');
            break;
        default:
            break;
    }
    showToast("buzzers reset to " + mode + " mode");
    wsSend('reset-buzzers', { mode: mode });
    domSubmissionsList.innerHTML = "";
}

function handleSubmission(user, answer) {
    switch (lobbyMode) {
        case 'buzzer':
            domSubmissionsList.innerHTML +=
                `<li> ${user} </li>`;
            break;
        case 'text':
            domSubmissionsList.innerHTML +=
                `<li> ${user}: ${answer} </li>`;
            break;
        case 'map':
            if (answer.lat && answer.lng) {
                window.addMarker(answer, user);
            }
            break;
        default:
            break;
    }
}

function updateUsers(users) {
    domUsersList.innerHTML = "";
    for (const user of users) {
        domUsersList.innerHTML +=
            `<li> ${user} </li>`;
    }
}

function showToast(text, isError, isPersistent) {
    let toast = document.createElement('li');
    if (isError) {
        toast.classList.add('error');
    }
    toast.textContent = text;
    if (!isPersistent) {
        setTimeout(() => {
            document.getElementById("toasts").removeChild(toast);
        }, 3000);
    }
    document.getElementById("toasts").appendChild(toast);
}

websocket.addEventListener('message', e => {
    const data = JSON.parse(e.data);

    if (Object.keys(data).length > 1) {
        console.log('==> ' + data._msgType, data);
    } else {
        console.log('==> ' + data._msgType);
    }

    let func = messageHandlers.get(data._msgType);
    if (func) {
        func(data);
    } else {
        console.log("no function defined for", data._msgType);
    }
})

websocket.addEventListener('close', _ => {
    showToast('connection to server lost - please reload the page', true, true);
});

function wsSend(msgType, data) {
    if (!data) {
        data = {};
    }
    data['_msgType'] = msgType;
    console.log('<== ' + msgType, data);
    if (websocket.readyState !== websocket.OPEN) {
        showToast('connection not open', true);
        return;
    }
    try {
        websocket.send(JSON.stringify(data));
    } catch (error) {
        showToast('failed to send message ' + msgType, true);
    }
}


window.wsSend = wsSend;
