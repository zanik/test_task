var express = require('express');
var path = require('path');

module.exports = app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.locals.fib = function(n) {
    var f;
    var f0 = 0;
    var f1 = 1;
    if(n === 0) return f0;
    if(n === 1) return f1;
    for(var i = 1; i < n; i++) {
        f = f0 + f1;
        f0 = f1;
        f1 = f;
    }
    return f;
};

require('./router')(app);

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});