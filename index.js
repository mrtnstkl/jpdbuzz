import * as client from './client.js'
import * as config from './config.js';
import * as host from './host.js'
import * as httpserver from './httpserver.js'



(() => {

    client.start(config.clientWsPort);
    httpserver.startClient(config.clientHttpPort);

    host.start(config.hostWsPort);
    httpserver.startHost(config.hostHttpPort);

    console.log(
        `Host inteface hosted on http://localhost:${config.hostHttpPort} \n` +
        `Client inteface hosted on http://${config.serverIp}:${config.clientHttpPort} \n` +
        `Make sure that ports ${config.clientHttpPort} and ${config.clientWsPort} are forwarded. \n`
    );
})();