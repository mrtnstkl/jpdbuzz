const serverWsPort = 8088; // host websocket port 

const serverUrl = "ws://localhost:" + serverWsPort;
const websocket = new WebSocket(serverUrl);

var domUsersList = document.getElementById("users-list");
var domSubmissionsList = document.getElementById("submissions-list");

document.addEventListener("DOMContentLoaded", () => {
    domUsersList = document.getElementById("users-list");
    domSubmissionsList = document.getElementById("submissions-list");
});


var mode;

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
    switch (mode) {
        case 'buzzer':

            break;
        case 'map':

            break;
        case 'text':

            break;
        default:
            break;
    }
    showToast("buzzers reset to " + mode + " mode");
    wsSend('reset-buzzers', { mode: mode });
    domSubmissionsList.innerHTML = "";
}

function handleSubmission(user, answer) {
    if (answer) {
        domSubmissionsList.innerHTML +=
            `<li> ${user}: ${answer} </li>`;
    } else {
        domSubmissionsList.innerHTML +=
            `<li> ${user} </li>`;
    }

}

function updateUsers(users) {
    domUsersList.innerHTML = "";
    for (const user of users) {
        domUsersList.innerHTML +=
            `<li> ${user} </li>`;
    }
}

function showToast(text) {
    let toast = document.createElement('li');
    toast.textContent = text;
    setTimeout(() => {
        document.getElementById("toasts").removeChild(toast);
    }, 3000);
    document.getElementById("toasts").appendChild(toast);
}

// react to receiving a message from the server
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

// react to losing connection to the server
websocket.addEventListener('close', _ => {
});

/**
 * Sends a websocket message to the server.
 * 
 * @param {string} msgType type of message to send (eg. 'lobby-join')
 * @param {Object} data data to be sent with the message 
 */
function wsSend(msgType, data) {
    if (!data) {
        data = {};
    }
    data['_msgType'] = msgType;
    console.log('<== ' + msgType, data);
    try {
        websocket.send(JSON.stringify(data));

    } catch (error) {

    }
}


window.wsSend = wsSend;
