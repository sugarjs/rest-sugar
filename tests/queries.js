var assert = require('assert');

var request = require('request');
var sugar = require('object-sugar');

var utils = require('./utils');


function get(r) {
    return function(cb) {
        request.get({url: r, json: true}, function(err, d, body) {
            if(err) return console.error(err);

            assert.equal(body.length, 0);

            cb(err, d, body);
        });
    };
}
exports.get = get;

function getViaId(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
            request.get({url: r + '/' + body._id, json: true}, function(err, d, b) {
                if(err) return console.error(err);

                assert.equal(body._id, b._id);
                assert.equal(body.name, b.name);

                cb(err, d, body);
            });
        });
    };
}
exports.getViaId = getViaId;

function create(r) {
    return function(cb) {
        var name = 'Joe';

        request.post({url: r, json: {name: name}}, function(err, d, body) {
            if(err) return console.error(err);

            assert.equal(body.name, name);

            cb(err, d, body);
        });
    };
}
exports.create = create;

function createViaGet(r) {
    return function(cb) {
        var name = 'Jack';

        request.get({url: r, qs: {name: name, method: 'post'}, json: true}, function(err, d, body)   {
            if(err) return console.error(err);

            assert.equal(body.name, name);

            cb(err, d, body);
        });
    };
}
exports.createViaGet = createViaGet;

function createViaId(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
            request.post({url: r + '/' + body._id}, function(err, d, body) {
                if(err) return console.error(err);

                assert.equal(d.statusCode, 403);

                cb(err, d, body);
            });
        });
    };
}
exports.createViaId = createViaId;

function update(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
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
exports.update = update;

function updateViaGet(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
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
exports.updateViaGet = updateViaGet;

function updateViaId(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
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
exports.updateViaId = updateViaId;

function remove(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
            var id = body._id;

            request.del({url: r, json: {_id: id}}, function(err, d, body) {
                if(err) return console.error(err);

                utils.assertCount(r, 0, cb);
            });
        });
    };
}
exports.remove = remove;

function removeViaGet(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
            var id = body._id;

            request.get({url: r, qs: {_id: id}, method: 'delete'}, function(err, d, body) {
                if(err) return console.error(err);

                utils.assertCount(r, 0, cb);
            });
        });
    };
}
exports.removeViaGet = removeViaGet;

function removeViaId(r) {
    return function(cb) {
        create(r)(function(err, d, body) {
            var id = body._id;

            request.del({url: r + '/' + id}, function(err, d, body) {
                if(err) return console.error(err);

                utils.assertCount(r, 0, cb);
            });
        });
    };
}
exports.removeViaId = removeViaId;
