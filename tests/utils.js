var assert = require('assert');

var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var models = require('./models');


function start() {
    console.log('Running tests!');
}
exports.start = start;

function finish() {
    console.log('Tests finished!');
    process.exit();
}
exports.finish = finish;

function assertCount(r, c, cb) {
    request.get({url: r + '/count', json: true}, function(err, d, body) {
        if(err) return console.error(err);

        assert.equal(body, c);

        cb(err, d, body);
    });
}
exports.assertCount = assertCount;

function runTests(tests, done) {
    async.series(setup(tests, removeData), done);
}
exports.runTests = runTests;

function setup(tests, fn) {
    return tests.map(function(t) {
        return fn(t);
    });
}

// TODO: make this generic
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
