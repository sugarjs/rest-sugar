#!/usr/bin/env node
var async = require('async');

var utils = require('./utils');

// TODO: load these dynamically based on prefix
var testMiddleware = require('./test_middleware');
var testRest = require('./test_rest');


main();

function main() {
    utils.start();

    async.series([
        testMiddleware,
        testRest
    ], utils.finish);
}
