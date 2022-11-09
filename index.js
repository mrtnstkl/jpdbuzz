import * as client from './client.js'
import * as config from './config.js';
import * as host from './host.js'
import * as httpserver from './httpserver.js'



(() => {

    client.start(config.clientWsPort);
    httpserver.startClient(config.clientHttpPort);

    host.start(config.hostWsPort);
    httpserver.startHost(config.hostHttpPort);

})();