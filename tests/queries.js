var assert = require('assert');

var request = require('request');
var sugar = require('object-sugar');
var merge = require('funkit').common.merge;

var utils = require('./utils');

// TODO: tidy up and make the API consistent


function getMeta(r, extra, check) {
    extra = extra || {};

    return function(cb) {
        request.get({url: r, json: true, qs: extra}, function(err, d, body) {
            if(err) return console.error(err);

            if(check) check(err, d, body);
            else assert.ok(body);

            cb(err, d, body);
        });
    };
}
exports.getMeta = getMeta;

function get(r, extra, check) {
    extra = extra || {};

    return function(cb) {
        request.get({url: r, json: true, qs: extra}, function(err, d, body) {
            if(err) return console.error(err);

            if(check) check(err, d, body);
            else assert.equal(body.length, 0);

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

function create(r, extra, check) {
    extra = extra || {};

    return function(cb) {
        var name = 'Joe';

        request.post({url: r, json: merge({name: name}, extra)}, function(err, d, body) {
            if(err) return console.error(err);

            if(check) check(err, d, body);
            else assert.equal(body.name, name);

            cb(err, d, body);
        });
    };
}
exports.create = create;

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
