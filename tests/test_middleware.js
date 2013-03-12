var async = require('async');
var request = require('request');
var sugar = require('object-sugar');

var rest = require('../lib/rest-sugar');
var serve = require('./serve');
var conf = require('./conf');
var models = require('./models');
var utils = require('./utils');
var queries = require('./queries');


function tests(done) {
    var port = conf.port + 1;
    var resource = conf.host + ':' + port + conf.prefix + 'authors';
    var app = serve(conf);
    var api = rest.init(app, conf.prefix, {
        authors: models.Author
    }, sugar);

    api.pre(function() {
        api.use(rest.only('GET'));
        api.use(function(req, res, next) {
            next();
        });
    });

    api.post(function() {
        api.use(function(data, next) {
            next();
        });
    });

    // TODO: figure out how to spawn servers and close them. alternatively
    // move this handling to higher level
    app.listen(port, function(err) {
        if(err) return console.error(err);

        utils.runTests([
            queries.get(resource),
            queries.create(resource, utils.forbidden)
        ], done);
    });
}
module.exports = tests;
