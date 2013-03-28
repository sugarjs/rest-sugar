var assert = require('assert');

var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var rest = require('../rest-sugar');

var serve = require('./serve');
var conf = require('./conf');
var models = require('./models');
var utils = require('./utils');
var queries = require('./queries');


function tests(done) {
    var port = conf.port + 1;
    var resource = conf.host + ':' + port + conf.prefix + 'authors';
    var app = serve(conf);
    var api = rest(app, conf.prefix, {
        authors: models.Author
    }, sugar);
    var auth = {
        name: 'apikey',
        value: 'secret'
    };
    var authQuery = {};
    var preTriggered, postTriggered;

    authQuery[auth.name] = auth.value;

    api.pre(function() {
        //api.use(rest.only('GET'));
        api.use(rest.allow(['GET']));
        api.use(rest.keyAuth(auth));
        api.use(function(req, res, next) {
            preTriggered = true;

            next();
        });
    });

    api.post(function() {
        api.use(function(req, res, next, data) {
            postTriggered = true;

            // it should be possible to inject data to result
            data.test = 'test';

            next();
        });
    });

    // TODO: figure out how to spawn servers and close them. alternatively
    // move this handling to higher level
    app.listen(port, function(err) {
        if(err) return console.error(err);

        utils.runTests([
            queries.get(resource, {}, utils.forbidden),
            queries.get(resource, authQuery, function(err, d, body) {
                assert.equal(body.test, 'test');
            }),
            queries.create(resource, authQuery, utils.forbidden)
        ], function() {
            assert.ok(preTriggered);
            assert.ok(postTriggered);

            done();
        });
    });
}
module.exports = tests;
