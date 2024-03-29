import * as config from "../config.js";

const serverUrl = "ws://" + window.location.hostname + ":" + config.clientWsPort;
const websocket = new WebSocket(serverUrl);


var domUsersList = document.getElementById("users-list");
var domSubmissionsList = document.getElementById("submissions-list");

document.addEventListener("DOMContentLoaded", () => {
    domUsersList = document.getElementById("users-list");
    domSubmissionsList = document.getElementById("submissions-list");
});

const buzzerAudio = new Audio('./../buzzer.wav');
buzzerAudio.loop = false;
buzzerAudio.volume = 0.5;

var lobbyMode;

var users = new Map; // maps usernames to points

const messageHandlers = new Map([
    ["reset-buzzers", data => {
        // update lobby mode
        lobbyMode = data.mode;
        modeUpdate();
        resetBuzzers();
        if (data.locked) {
            lockBuzzer();
        } else {
            unlockBuzzer();
        }
    }],

    ["join-accept", data => {
        document.getElementById('login-screen').setAttribute('hidden', '');
        document.getElementById('main-screen').removeAttribute('hidden');
        lobbyMode = data.lobbyMode;
        modeUpdate();
    }],

    ["submission", data => {
        if (lobbyMode == 'buzzer' && domSubmissionsList.children.length == 0) {
            buzzerAudio.play();
        }
        domSubmissionsList.innerHTML +=
            `<li> ${data.user} </li>`;
    }],

    ["users-change", data => {
        users.clear();
        for (const user of data.users) {
            users.set(user.name, user.points);
        }
        updateUsers();
    }],

    ["update-user-points", data => {
        for (const user of data.users) {
            users.set(user.name, user.points);
        }
        updateUsers();
    }],

    ["set-buzzer-lock", data => {
        if (data.locked) {
            lockBuzzer();
        } else {
            unlockBuzzer();
        }
    }],

]);

function resetBuzzers() {
    domSubmissionsList.innerHTML = "";
    document.getElementById('buzzer').removeAttribute("disabled");
    document.getElementById('iTextAnswer').value = "";
    document.getElementById('iTextAnswer').removeAttribute("disabled");
    window.resetMap();
}

window.buzzerLocked = false;

function unlockBuzzer() {
    window.buzzerLocked = false;
    document.getElementById('buzzer').removeAttribute("disabled");
    document.getElementById('iTextAnswer').removeAttribute("disabled");
    document.getElementById('map-answer-container').removeAttribute("disabled");
}
function lockBuzzer() {
    window.buzzerLocked = true;
    document.getElementById('buzzer').setAttribute('disabled', '');
    document.getElementById('iTextAnswer').setAttribute('disabled', '');
    document.getElementById('map-answer-container').setAttribute('disabled', '');
}

Mousetrap.bind("enter", pressBuzzer);
Mousetrap.bind("space", pressBuzzer);

function pressBuzzer() {
    if (window.buzzerLocked) {
        return;
    }
    let answer;
    switch (lobbyMode) {
        case 'text':
            answer = document.getElementById('iTextAnswer').value;
            if (answer == "") {
                return;
            }
            break;
        case 'map':
            answer = window.pinCoordinate;
            if (answer == null) {
                return;
            }
            break;
        default:
            break;
    }
    lockBuzzer();
    wsSend("submission", { answer: answer });
}

window.pressBuzzer = pressBuzzer;

window.joinLobby = function (name) {
    wsSend("request-join", { name: name });
}


function updateUsers() {
    domUsersList.innerHTML = "";
    for (const [name, points] of users.entries()) {
        domUsersList.innerHTML +=
            `<tr><td> ${name}: </td><td> ${points} </td></tr>`;
    }
}

function modeUpdate() {
    document.getElementById('buzzer').classList = [];
    switch (lobbyMode) {
        case 'buzzer':
            document.getElementById('text-answer-container').setAttribute('hidden', '');
            document.getElementById('map-answer-container').setAttribute('hidden', '');
            break;
        case 'text':
            document.getElementById('text-answer-container').removeAttribute('hidden');
            document.getElementById('map-answer-container').setAttribute('hidden', '');
            break;
        case 'map':
            document.getElementById('text-answer-container').setAttribute('hidden', '');
            document.getElementById('map-answer-container').removeAttribute('hidden');
            document.getElementById('buzzer').classList.add('map-buzzer');
            window.dispatchEvent(new Event('resize'));
            break;
        default:
            break;
    }
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
    document.getElementById('login-screen').setAttribute('hidden', '');
    document.getElementById('main-screen').setAttribute('hidden', '');
    alert("connection lost!\nplease reload the page");
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
