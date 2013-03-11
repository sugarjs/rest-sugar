#!/usr/bin/env node
var assert = require('assert');

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
    }, sugar); // TODO: add auth and success cbs

    start();
    app.listen(port, function(err) {
        if(err) return console.error(err);

        request.get(resource, function(err, d) {
            if(err) return console.error(err);

            var name = 'Joe';

            assert.equal(JSON.parse(d.body).length, 0);

            request.post({url: resource, json: {name: name}}, function(err, r, body) {
                if(err) return console.error(err);

                assert.equal(body.name, name);

                finish();
            });
       });
    });
}

function start() {
    console.log('Running tests!');
}

function finish() {
    console.log('Tests finished!');
    process.exit();
}
