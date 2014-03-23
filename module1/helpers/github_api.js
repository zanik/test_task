var https = require('https');
var store = require('redis').createClient();
var POSSIBLE_REQUESTS = 3;
var EXPIRE = 60*60*24;

module.exports = new GitHub();

function GitHub() {
    this._q = [];
    this._active = 0;
}

GitHub.prototype._request = function(options, callback) {
    var self = this;
    store.exists(options.path, function(err, exist) {
        if(err) {
            console.log('Ошибка чтения из кеша');
        }else if(exist) {
            store.get(options.path, function(err, val) {
                if(err) {
                    console.log('Ошибка чтения из кеша');
                    self._q.push({opt: options, cb: callback});
                    self._active < POSSIBLE_REQUESTS && self._execute();
                }else{
                    callback(null, JSON.parse(val));
                }
            });
            return;
        }
        self._q.push({opt: options, cb: callback});
        self._active < POSSIBLE_REQUESTS && self._execute();
    });
};

GitHub.prototype._execute = function() {
    while(this._active < POSSIBLE_REQUESTS && this._q.length) {
        this._active += 1;
        this._makeRequest(this._q.shift());
    }
};

GitHub.prototype._makeRequest = function(params) {
    var self = this;
    https
        .request(params.opt, function(response) {
            var data = '';
            response.on('data', function(chunk) {
                data += chunk;
            });
            response.on('end', function() {
                self._active -= 1;
                self._execute();
                if(~this.headers.status.search(200)) {
                    store.setex(params.opt.path, EXPIRE, data);
                    params.cb(null, JSON.parse(data));
                }else{
                    params.
                        cb(new Error(this.headers.status));
                }
            });
        })
        .on('error', function() {
            params.cb(new Error('Ошибка запроса'));
        })
        .end()
};

GitHub.prototype.repositories = function(user, callback) {
    var options = {
        method: 'GET',
        host: 'api.github.com',
        path: '/orgs/' + user + '/repos?type=public&per_page=100',
        headers: {
            'User-Agent': 'node_task'
        }
    };
    this._request(options, callback);
};

GitHub.prototype.commits = function(user, repo, callback) {
    var options = {
        method: 'GET',
        host: 'api.github.com',
        path: '/repos/'+ user + '/' + repo + '/commits?page=1&per_page=100',
        headers: {
            'User-Agent': 'node_task'
        }
    };
    this._request(options, callback);
};