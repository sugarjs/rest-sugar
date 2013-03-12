var assert = require('assert');

var sugar = require('object-sugar');

var rest = require('../lib/rest-sugar');
var serve = require('./serve');
var models = require('./models');
var conf = require('./conf');
var utils = require('./utils');
var queries = require('./queries');


function tests(done) {
    var resource = conf.host + ':' + conf.port + conf.prefix + 'authors';
    var app = serve(conf);
    var api = rest.init(app, conf.prefix, {
        authors: models.Author
    }, sugar);

    api.pre(function() {
        api.use(function(req, res, next) {
            assert.ok(['POST', 'GET', 'DELETE', 'PUT'].indexOf(req.method) >= 0);

            next();
        });
    });

    api.post(function() {
        api.use(function(req, res, next) {
            assert.ok(!req.query.method);

            next();
        });
    });

    app.listen(conf.port, function(err) {
        if(err) return console.error(err);

        utils.runTests([
            queries.get(resource),
            queries.getViaId(resource),
            queries.create(resource),
            queries.createViaGet(resource),
            queries.createViaId(resource),
            queries.update(resource),
            queries.updateViaGet(resource),
            queries.updateViaId(resource),
            queries.remove(resource),
            queries.removeViaGet(resource),
            queries.removeViaId(resource)
        ], done);
    });
}
module.exports = tests;
