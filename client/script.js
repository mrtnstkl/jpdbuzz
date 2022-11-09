const wsPort = 8086; // client websocket port 
const serverIp = '84.114.42.250'; // <-------- CHANGE THIS TO THE SERVERS IP !!!

const serverUrl = "ws://" + serverIp + ":" + wsPort;
const websocket = new WebSocket(serverUrl);


var domUsersList = document.getElementById("users-list");
var domSubmissionsList = document.getElementById("submissions-list");

document.addEventListener("DOMContentLoaded", () => {
    domUsersList = document.getElementById("users-list");
    domSubmissionsList = document.getElementById("submissions-list");
    window.dispatchEvent(new Event('resize'));
    console.log("foo");
});


var lobbyMode;

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
        document.getElementById('login-screen').setAttribute('hidden', 'true');
        document.getElementById('main-screen').removeAttribute('hidden');
        lobbyMode = data.lobbyMode;
        modeUpdate();
    }],

    ["submission", data => {
        domSubmissionsList.innerHTML +=
            `<li> ${data.user} </li>`;
    }],

    ["users-change", data => {
        updateUsers(data.users);
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
}

function unlockBuzzer() {
    document.getElementById('buzzer').removeAttribute("disabled");
    document.getElementById('iTextAnswer').removeAttribute("disabled");
    document.getElementById('map-answer-container').removeAttribute("disabled");
}
function lockBuzzer() {
    document.getElementById('buzzer').setAttribute('disabled', '');
    document.getElementById('iTextAnswer').setAttribute('disabled', '');
    document.getElementById('map-answer-container').setAttribute('disabled', '');
}

window.pressBuzzer = function () {
    lockBuzzer();
    let answer;
    switch (lobbyMode) {
        case 'text':
            answer = document.getElementById('iTextAnswer').value;
            break;
        case 'map':
            answer = document.getElementById('geoloc').value;
            break;

        default:
            break;
    }
    wsSend("submission", { answer: answer });
}

window.joinLobby = function (name) {
    wsSend("request-join", { name: name });
}


function updateUsers(users) {
    domUsersList.innerHTML = "";
    for (const user of users) {
        domUsersList.innerHTML +=
            `<li> ${user} </li>`;
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
