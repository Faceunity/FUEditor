var http = require('http');
var url = require('url');



function start(route, handler) {
    function onRequest (request, response) {

        var pathname = url.parse(request.url).pathname;
        console.log("pathname",pathname);
        console.log("request.url",request.url);
        route (pathname, handler, response, request);
    }
    http.createServer(onRequest).listen(parseInt(handler.port));
    // http.createServer(onRequest).listen(3000);
    console.log('server is starting listen',handler.port);
}

exports.start = start;
