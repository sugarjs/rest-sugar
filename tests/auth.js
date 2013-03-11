#!/usr/bin/env node
var assert = require('assert');

var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var rest = require('../lib/rest-sugar');
var serve = require('./serve');
var conf = require('./conf');
var models = require('./models');
var utils = require('./utils');

main();

function main() {
    var resource = conf.host + ':' + conf.port + conf.prefix + 'authors';
    var app = serve(conf);
    var api = rest.init(app, conf.prefix, {
        authors: models.Author
    }, sugar);

    api.pre(function() {
        // TODO
    });

    api.post(function() {
        // TODO
    });

    utils.start();

    app.listen(conf.port, function(err) {
        if(err) return console.error(err);

        // TODO: define some basic tests for auth
        utils.finish();
    });
}
