#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');
var rest = require('../../lib/rest-sugar');
var models = require('./models');

main();

function main() {
    mongoose.connect('mongodb://localhost/mongoosedemo');

    var app = express.createServer();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    rest.init(app, '/api/v1/', {
        'libraries': models.Library,
        'tags': models.Tag
    }, sugar, rest.auth.key('apikey', 'demo', function(req) {
        return req.method == 'GET';
    }));

    console.log('Surf to localhost:8000');
    app.listen(8000);
}

