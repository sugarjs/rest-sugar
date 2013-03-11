#!/usr/bin/env node
var assert = require('assert');

var async = require('async');
var express = require('express');
var request = require('request');
var sugar = require('object-sugar');

var rest = require('../lib/rest-sugar');
var models = require('./models');


main();

function main() {
    var host = 'http://localhost';
    var port = 3000;
    var prefix = '/api/';
    var resource = host + ':' + port + prefix + 'authors';
    var app = express();
    var api;

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    api = rest.init(app, prefix, {
        authors: models.Author
    }, sugar);

    api.pre(function() {
        api.use(function(req, res, next) {
            next();
        });
    });

    api.post(function() {
        api.use(function(data, next) {
            next();
        });
    });

    start();
    app.listen(port, function(err) {
        if(err) return console.error(err);

        async.series(setup([
            getResource(resource),
            getResourceViaId(resource),
            createResource(resource),
            createResourceViaGet(resource),
            createResourceViaId(resource),
            updateResource(resource),
            updateResourceViaGet(resource),
            updateResourceViaId(resource),
            removeResource(resource),
            removeResourceViaGet(resource),
            removeResourceViaId(resource)
        ], removeData), finish);
    });
}

function removeData(t) {
    return function(cb) {
        async.series([
            removeAuthors
        ], t.bind(undefined, cb));
    };
}

function removeAuthors(cb) {
    sugar.removeAll(models.Author, cb);
}

function setup(tests, fn) {
    return tests.map(function(t) {
        return fn(t);
    });
}

function getResource(r) {
    return function(cb) {
        request.get({url: r, json: true}, function(err, d, body) {
            if(err) return console.error(err);

            assert.equal(body.length, 0);

            cb(err, d, body);
        });
    };
}

function getResourceViaId(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            request.get({url: r + '/' + body._id, json: true}, function(err, d, b) {
                if(err) return console.error(err);

                assert.equal(body._id, b._id);
                assert.equal(body.name, b.name);

                cb(err, d, body);
            });
        });
    };
}

function createResource(r) {
    return function(cb) {
        var name = 'Joe';

        request.post({url: r, json: {name: name}}, function(err, d, body) {
            if(err) return console.error(err);

            assert.equal(body.name, name);

            cb(err, d, body);
        });
    };
}

function createResourceViaGet(r) {
    return function(cb) {
        var name = 'Jack';

        request.get({url: r, qs: {name: name, method: 'post'}, json: true}, function(err, d, body) {
            if(err) return console.error(err);

            assert.equal(body.name, name);

            cb(err, d, body);
        });
    };
}

function createResourceViaId(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            request.post({url: r + '/' + body._id}, function(err, d, body) {
                if(err) return console.error(err);

                assert.equal(d.statusCode, 403);

                cb(err, d, body);
            });
        });
    };
}

function updateResource(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            var id = body._id;
            var name = body.name + body.name;

            request.put({url: r, json: {_id: id, name: name}}, function(err, d, body) {
                if(err) return console.error(err);

                assert.equal(id, body._id);
                assert.equal(name, body.name);

                cb(err, d, body);
            });
        });
    };
}

function updateResourceViaGet(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            var id = body._id;
            var name = body.name + body.name;

            request.get({url: r, qs: {_id: id, name: name, method: 'put'}, json: true}, function(err, d, body) {
                if(err) return console.error(err);

                assert.equal(id, body._id);
                assert.equal(name, body.name);

                cb(err, d, body);
            });
        });
    };
}

function updateResourceViaId(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            var id = body._id;
            var name = body.name + body.name;

            request.put({url: r + '/' + id, json: {name: name}}, function(err, d, body) {
                if(err) return console.error(err);

                assert.equal(id, body._id);
                assert.equal(name, body.name);

                cb(err, d, body);
            });
        });
    };
}

function removeResource(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            var id = body._id;

            request.del({url: r, json: {_id: id}}, function(err, d, body) {
                if(err) return console.error(err);

                assertCount(r, 0, cb);
            });
        });
    };
}

function removeResourceViaGet(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            var id = body._id;

            request.get({url: r, qs: {_id: id}, method: 'delete'}, function(err, d, body) {
                if(err) return console.error(err);

                assertCount(r, 0, cb);
            });
        });
    };
}

function removeResourceViaId(r) {
    return function(cb) {
        createResource(r)(function(err, d, body) {
            var id = body._id;

            request.del({url: r + '/' + id}, function(err, d, body) {
                if(err) return console.error(err);

                assertCount(r, 0, cb);
           });
        });
    };
}

function assertCount(r, c, cb) {
    request.get({url: r + '/count', json: true}, function(err, d, body) {
        if(err) return console.error(err);

        assert.equal(body, c);

        cb(err, d, body);
    });
}

function start() {
    console.log('Running tests!');
}

function finish() {
    console.log('Tests finished!');
    process.exit();
}
