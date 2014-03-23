var express = require('express');
var path = require('path');

module.exports = app = express();

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

require('./helpers/locals')(app);

require('./router')(app);

process.on('uncaughtException', function(err) {
    console.log('Caught exception: ' + err);
});