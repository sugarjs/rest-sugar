#!/usr/bin/env node
var express = require('express');
var mongoose = require('mongoose');
var sugar = require('mongoose-sugar');

var rest = require('../../');
var models = require('./models');


main();

function main() {
    mongoose.connect('mongodb://localhost/mongoosedemo', function(err) {
        if(err) return console.error(err, 'Remember to run mongod!');

        serve();
    });
}

function serve() {
    var port = 8000;
    var prefix = '/api/v1';
    var app = express();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    var api = rest(app, '/api/v1/', {
        'libraries': models.Library,
        'tags': models.Tag
    }, sugar);

    app.listen(port, function(err) {
        if(err) return console.error(err);

        console.log('Surf to localhost:' + port + prefix);
    });
}

