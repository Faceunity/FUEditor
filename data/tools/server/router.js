function route (pathname, handler, response, request) {
    console.log('about to route a request for ' + pathname);
    if (typeof handler[pathname] === 'function') {
        return handler[pathname](response, request);
    } else {
        console.log('no request handler found for ' + pathname);
        response.writeHead(404, {'Content-Type': 'text/html'});
        response.write('404 Not Found!');
        response.end();
    }
}

exports.route = route;
