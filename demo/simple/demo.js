#!/usr/bin/env node
var express = require('express');
var sugar = require('object-sugar');

var rest = require('../../lib/rest-sugar');
var models = require('./models');


main();

function main() {
    var port = 8000;
    var prefix = '/api/v1';
    var auth = {name: 'apikey', value: 'secret'};
    var app = express();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    var api = rest.init(app, prefix, {
        'libraries': models.Library,
        'tags': models.Tag
    }, sugar);

    api.pre(function() {
        api.use(rest.keyAuth(auth));
    });

    app.listen(port, function(err) {
        if(err) return console.error(err);

        console.log('Surf to localhost:' + port + prefix + '?' + auth.name + '=' + auth.value);
    });
}
