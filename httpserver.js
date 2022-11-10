import http from 'http';
import url from 'url';
import fs from 'fs';

export function startHost(port) {
    let resources = new Map;
    const setResource = (path, filePath) => { resources.set(path, fs.readFileSync(filePath)) };

    setResource("/index.html", "./host/index.html")
    setResource("/script.js", "./host/script.js")
    setResource("/map.js", "./host/map.js")
    setResource("/style.css", "./style.css");
    setResource("/config.js", "./config.js");
    setResource("/buzzer.wav", "./buzzer.wav");

    createServer(resources).listen(port);
}

export function startClient(port) {
    let resources = new Map;
    const setResource = (path, filePath) => { resources.set(path, fs.readFileSync(filePath)) };

    setResource("/index.html", "./client/index.html")
    setResource("/script.js", "./client/script.js")
    setResource("/map.js", "./client/map.js")
    setResource("/mousetrap.min.js", "./client/mousetrap.min.js")
    setResource("/style.css", "./style.css");
    setResource("/config.js", "./config.js");
    setResource("/buzzer.wav", "./buzzer.wav");

    createServer(resources).listen(port);
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
