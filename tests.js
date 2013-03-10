#!/usr/bin/env node
var assert = require('assert');

var express = require('express');
var request = require('request');

var rest = require('./lib/rest-sugar');


main();

function main() {
    var port = 3000;
    var apiPrefix = '/api';
    var app = express();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    // TODO: set up dummy api

    app.listen(port, function(err) {
        if(err) return console.error(err);

        // TODO: test now
        process.exit();
    });
}
