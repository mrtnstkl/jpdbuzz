import { StringDecoder } from 'string_decoder';
import WebSocket, { WebSocketServer as WSWebSocketServer } from 'ws';
const WebSocketServer = WebSocket.Server || WSWebSocketServer;
import * as client from './client.js'

const decoder = new StringDecoder('utf8');

var server;
var socket;

export var lobbyMode = 'buzzer';

var messageHandlers = new Map([

    ["reset-buzzers", data => {
        lobbyMode = data.mode;
        client.broadcast('reset-buzzers', { mode: data.mode, locked: false });
    }],

    ["set-buzzer-lock", data => {
        client.broadcast('set-buzzer-lock', { locked: data.locked });
    }],

    ["update-user-points", data => {
        for (let user of data.users) {
            client.points.set(user.name, user.points);
            client.broadcast('update-user-points', data);
        }
    }],

]);




/**
 * Starts the socket for communicating with the frontend. Should be called once on program initialization.
 */
export function start(port) {
    server = new WebSocketServer({ port: port });
    server.on("connection", ws => {
        if (socket != null) {
            socket?.close();
        }
        socket = ws;
        console.log("host connected");

        sendToHost('users-change', { users: Array.from(client.points, ([name, points]) => ({ name, points })) });
        client.broadcast('reset-buzzers', { mode: lobbyMode, locked: false });

        ws.on("message", data_buf => {
            var data;
            try {
                data = JSON.parse(decoder.write(data_buf));
            } catch (error) {
                return;
            }
            let func = messageHandlers.get(data._msgType);
            if (func) {
                func(data);
                console.log(" == host ==>", data._msgType);
            } else {
                console.log("no function defined for", data._msgType);
            }
        });
        ws.on("close", () => {
            socket = null;
            console.log("host disconnected");
        });
    });
}


export function sendToHost(msgType, data) {
    if (!(data instanceof Object)) {
        data = {};
    }
    data['_msgType'] = msgType;
    socket?.send(JSON.stringify(data));
}


