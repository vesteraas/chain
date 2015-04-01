Many commands can be piped together on the command line, to accomplish a task that the single programs can't do alone.  There are several advantages to this.  For one, the generation of intermediate files between steps can be reduced, or even eliminated totally.

This is accomplished using standard streams.  Consult the wikipedia article for more details (http://en.wikipedia.org/wiki/Standard_streams).

chain is a module that simplifies the task of executing commands from node.  You can take the result of a command, a file, or a stream as the input.  You can write the output to a file, or return it as a stream.

Example:

```javascript
var chain = new Chain();

chain
    .execute("ls -l")
    .execute('grep "A"')
    .execute('sort')
    .write('./out.txt');
```

In the example above, we do the same as:

```bash
ls -l | grep "A" | sort > out.txt
```

A slightly modified example:

```javascript
var chain = new Chain();

var stream = chain
    .execute("ls -l")
    .execute('grep "A"')
    .execute('sort')
    .stream();
```

The difference here, is that we return a stream.  We could pipe it directly to the response object in a HTTP request:

```javascript
app.get('/', function (req, res) {
    var chain = new Chain();

    var stream = chain
        .execute("ls -l")
        .execute('grep "A"')
        .execute('sort')
        .stream();
    stream.pipe(res);
});
```

You can also use a file as the input:

```javascript
var chain = new Chain();

var stream = chain
    .read("./test.txt")
    .execute('grep "A"')
    .execute('sort')
    .write('./test2.txt');
```

Piping from request to response is also possible:

```javascript
app.get('/', function (req, res) {
    var chain = new Chain();

    var stream = chain
        .in(req)
        .execute("tr '[:lower:] '[:upper:]'")
        .stream();

    stream.pipe(res);
});
```
