#!/usr/bin/env node
var async = require('async');

var utils = require('./utils');

// TODO: load these dynamically based on prefix
var testAuth = require('./test_auth');
var testRest = require('./test_rest');


main();

function main() {
    utils.start();

    async.series([
        testAuth,
        testRest
    ], utils.finish);
}
