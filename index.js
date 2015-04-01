var _ = require('underscore'),
    spawn = require('child_process').spawn,
    Stream = require('stream'),
    fs = require('fs');

var split = function (str) {
    var parts = str.match(/(("|').*?("|')|[^("|')\s]+)(?=\s*|\s*$)+/g);

    for (var i = 0; i < parts.length; i++) {
        parts[i] = parts[i].replace(/('|")/g, '');
    }

    return parts;
}

module.exports = function () {
    var inStream;
    var executions = [];

    var process = function () {
        _.each(executions, function (execution) {
            var parts = split(execution.command);

            execution.spawner = function (_inStream) {
                var child = spawn(parts.shift(), parts);

                var stream = new Stream();

                child.stderr.on('data', stream.emit.bind(stream, 'error'));
                child.stdout.on('data', stream.emit.bind(stream, 'data'));
                child.stdout.on('end', stream.emit.bind(stream, 'end'));
                child.on('error', stream.emit.bind(stream, 'error'));

                if (_inStream) {
                    _inStream.pipe(child.stdin);
                }

                return stream;
            }
        });
    }

    return {
        in: function (stream) {
            if (!stream || !(
                stream instanceof Stream.Stream &&
                typeof (stream._read === 'function')&&
                typeof (stream._readableState === 'object')
                )
            ) {
                throw 'The argument to in() should be a readable stream';
            }
            inStream = stream;
            return this;
        },
        read: function (file) {
            if (!(typeof file == 'string' || file instanceof String)) {
               throw 'The argument to read() should be a string';
            }
            inStream = fs.createReadStream(file);
            return this;
        },
        execute: function (command) {
            if (!(typeof command == 'string' || command instanceof String)) {
                throw 'The argument to execute() should be a string';
            }

            executions.push({command: command});
            return this;
        },
        write: function (file) {
            if (!(typeof file == 'string' || file instanceof String)) {
                throw 'The argument to write() should be a string';
            }
            process();

            var outStream = inStream;

            while (executions.length > 0) {
                var command = executions.shift();
                outStream = command.spawner(outStream);
            }

            if (file) {
                outStream.pipe(fs.createWriteStream(file));
            } else {
                return outStream;
            }
        },
        stream: function () {
            process();

            var outStream = inStream;

            while (executions.length > 0) {
                var command = executions.shift();
                outStream = command.spawner(outStream);
            }

            return outStream;
        }
    }
}