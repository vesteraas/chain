var express = require('express'),
    Chain = require('../index');

var app = express();
var server = app.listen(3000, '0.0.0.0');

app.post('/', function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });

    var chain = new Chain();

    var stream = chain
        .in(req)
        .execute("tr '[:lower:]' '[:upper:]'")
        .stream();

    stream.pipe(res);
});

server.listen(3000);

