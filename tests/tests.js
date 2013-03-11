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

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    rest.init(app, prefix, {
        authors: models.Author
    }, sugar, function(err, ok) {
        // TODO: perhaps treat this as a middleware instead and provide "next"?
        return function(req, res) {
            ok(req, res);
        };
    }, function(req, res, body) {

    });

    start();
    app.listen(port, function(err) {
        if(err) return console.error(err);

        async.series(setup([
            getResource(resource),
            postResource(resource),
            postResourceViaGet(resource)
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

            cb();
        });
    };
}

function postResource(r) {
    return function(cb) {
        var name = 'Joe';

        request.post({url: r, json: {name: name}}, function(err, r, body) {
            if(err) return console.error(err);

            assert.equal(body.name, name);

            cb();
        });
    };
}

function postResourceViaGet(r) {
    return function(cb) {
        var name = 'Jack';

        request.get({url: r, qs: {name: name, method: 'post'}, json: true}, function(err, r, body) {
            if(err) return console.error(err);

            assert.equal(body.name, name);

            cb();
        });
    };
}

function start() {
    console.log('Running tests!');
}

function finish() {
    console.log('Tests finished!');
    process.exit();
}
