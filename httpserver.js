import http from 'http';
import url from 'url';
import fs from 'fs';

export function startHost(port) {
    const hostPath = "./host"
    const hostFiles = [
        "/index.html", "/script.js", "/../style.css"
    ]
    let hostResources = new Map;
    for (const file of hostFiles) {
        hostResources.set(file, fs.readFileSync(hostPath + file))
    }
    hostResources.set("/style.css", fs.readFileSync(hostPath + "/../style.css"));
    hostResources.set("/config.js", fs.readFileSync(hostPath + "/../config.js"));
    createServer(hostResources).listen(port);
}
export function startClient(port) {
    const clientPath = "./client"
    const clientFiles = [
        "/index.html", "/script.js", "/location-picker/leaflet-locationpicker.css", "/location-picker/leaflet-locationpicker.js"
    ]
    let clientResources = new Map;
    for (const file of clientFiles) {
        clientResources.set(file, fs.readFileSync(clientPath + file))
    }
    clientResources.set("/style.css", fs.readFileSync(clientPath + "/../style.css"));
    clientResources.set("/config.js", fs.readFileSync(clientPath + "/../config.js"));
    createServer(clientResources).listen(port);
}

function createServer(resources) {

    return http.createServer(function (request, response) {
        const error = function (status = 500) {
            response.writeHead(status);
            response.end();
        }

        if (!request.url) {
            error(400);
            return;
        }
        let path = url.parse(request?.url).pathname;
        if (!path) {
            error(400);
            return;
        }

        if (path == "/") {
            path = "/index.html";
        }

        const data = resources.get(path);
        if (!data) {
            error(404);
            return;
        }

        if (path.substring(path.length - ".js".length) == ".js") {
            response.writeHead(200, {
                'Content-Type': 'application/javascript'
            });
        }
        else if (path.substring(path.length - ".css".length) == ".css") {
            response.writeHead(200, {
                'Content-Type': 'text/css'
            });
        }
        else if (path.substring(path.length - ".html".length) == ".html") {
            response.writeHead(200, {
                'Content-Type': 'text/html'
            });
        }
        response.write(data);
        response.end();
    });
}