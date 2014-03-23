var should = require('should');
var request = require('supertest');
var gitHub = require('../module1/helpers/github_api');
var store = require('redis').createClient();
var url = 'http://localhost:3000';


describe('module1', function() {
    describe('Тест страниц приложения', function() {
        it('/joyent', function(done) {
            request(url)
                .get('/joyent')
                .expect(200)
                .end(function(err, res) {
                    if(err) done(err);
                    res.should.have.ownProperty('text');
                    res.text.should.containEql('node' && 'libuv');
                    done();
                });
        });
        it('/joyent/node', function(done) {
            request(url)
                .get('/joyent/node')
                .expect(200)
                .end(function(err, res) {
                    if(err) done(err);
                    res.should.have.ownProperty('text');
                    res.text.should.containEql('218922995834555200000'); //число фибоначчи последнего 100-го коммита
                    done();
                });
        });
        it('Получено 100 последних коммитов и все они уникальные', function(done) {
            store.get('/repos/joyent/node/commits?page=1&per_page=100', function(err, val) {
                if(err) done(err);
                val = JSON.parse(val);
                var length = val.length;
                length.should.equal(100);
                for(var i = 0; i < length; i++) {
                    for(var j = 0; j < length; j++) {
                        if(j === i) continue;
                        if(val[i].sha === val[j].sha) done(new Error('Значение дублируется'));
                    }
                }
                done();
            });
        });
    });
    describe('тест кеша', function() {
        it('кеш роута /joyent', function(done) {
            store.exists('/orgs/joyent/repos?type=public&per_page=100', function(err, exist) {
                if(err) {
                    done(err);
                }else{
                    exist.should.be.ok;
                    done();
                }
            });
        });
    });
    describe('Запросы к API GitHub', function() {
        it('Не должно быть более 3-х одновременных запросов', function(done) {
            for(var i =0; i <= 30; i++) {
                (function(i){
                    gitHub.repositories('joyent' + i, function() {
                        console.log('Сработал запрос № ' + i);
                        gitHub._active.should.be.within(0,3);
                        if(i >= 30) done();
                    });
                })(i);
            }
        });
    });
});