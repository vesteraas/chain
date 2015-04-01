var Chain = require('../index');

var chain = new Chain();

var stream = chain
    .read("./test.txt")
    .execute('grep "A"')
    .execute('sort')
    .write('./test2.txt');
