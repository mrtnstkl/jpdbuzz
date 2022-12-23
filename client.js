import { StringDecoder } from 'string_decoder';
import WebSocket, { WebSocketServer as WSWebSocketServer } from 'ws';
const WebSocketServer = WebSocket.Server || WSWebSocketServer;
import * as host from "./host.js";

const decoder = new StringDecoder('utf8');


var clients = new Set;
export var names = new Set;
export var points = new Map // maps names to points
var clientNames = new Map; // maps websockets to names


var messageHandlers = new Map([

    ["request-join", (data, ws) => {
        if (typeof data?.name != 'string' || names.has(data.name)) {
            sendToClient(ws, 'error-name-in-use');
            return;
        }
        if (!(data.name.length > 0)) {
            sendToClient(ws, 'error-name-too-short');
            return;
        }
        clients.add(ws);
        names.add(data.name);
        points.set(data.name, 0);
        clientNames.set(ws, data.name);
        console.log(data.name + " joined");
        // accept join request
        sendToClient(ws, 'join-accept', { lobbyMode: host.lobbyMode });
        // notify host of user change
        host.sendToHost('users-change', { users: Array.from(points, ([name, points]) => ({ name, points })) });
        // notify clients of user change
        broadcast('users-change', { users: Array.from(points, ([name, points]) => ({ name, points })) });
        console.log(points);
    }],

    ["submission", (data, ws) => {
        if (!clientNames.has(ws)) {
            return;
        }
        // notify host of submission
        host.sendToHost('submission', {
            user: clientNames.get(ws),
            answer: data.answer
        });
        // notify clients of submission
        broadcast('submission', {
            user: clientNames.get(ws)
        });
    }],

]);



/**
 * Starts the socket for communicating with the frontend. Should be called once on program initialization.
 */
export function start(port) {
    var server = new WebSocketServer({ port: port });
    server.on("connection", ws => {

        console.log("client connected");

        ws.on("message", data_buf => {
            var data;
            try {
                data = JSON.parse(decoder.write(data_buf));
            } catch (error) {
                return;
            }
            let func = messageHandlers.get(data._msgType);
            if (func) {
                func(data, ws);
                console.log(" = client =>", data._msgType);
            } else {
                console.log("no function defined for", data._msgType);
            }
        });

        ws.on("close", () => {
            names.delete(clientNames.get(ws));
            points.delete(clientNames.get(ws));
            clientNames.delete(ws);
            clients.delete(ws);
            console.log("client disconnected");
            host.sendToHost('users-change', { users: Array.from(points, ([name, points]) => ({ name, points })) });
            broadcast('users-change', { users: Array.from(points, ([name, points]) => ({ name, points })) });
        });
    });
}

function sendToClient(ws, msgType, data) {
    if (!(data instanceof Object)) {
        data = {};
    }
    data['_msgType'] = msgType;
    ws?.send(JSON.stringify(data));
}

export function broadcast(msgType, data) {
    if (!(data instanceof Object)) {
        data = {};
    }
    data['_msgType'] = msgType;
    clients.forEach(ws => ws?.send(JSON.stringify(data)));
}


