var ctrl = require('./controllers/github');

module.exports = function(app) {
    app.get('/:user', ctrl.getRepo);
    app.get('/:user/:repo', ctrl.getCommits);
};