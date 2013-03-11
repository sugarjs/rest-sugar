var async = require('async');
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

    app.listen(conf.port, function(err) {
        if(err) return console.error(err);

        async.series(setup([
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
        ], removeData), done);
    });
}
module.exports = tests;

// TODO: move to utils?
function setup(tests, fn) {
    return tests.map(function(t) {
        return fn(t);
    });
}

// TODO: move to utils?
function removeData(t) {
    return function(cb) {
        async.series([
            removeAuthors
        ], t.bind(undefined, cb));
    };
}

// TODO: move to utils? (make generic remove)
function removeAuthors(cb) {
    sugar.removeAll(models.Author, cb);
}
