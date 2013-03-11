var assert = require('assert');

var request = require('request');


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
