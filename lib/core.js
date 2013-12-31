var async = require('async');
var is = require('annois');
var string = require('annostring');
var zip = require('annozip');



function init(app, prefix, apis, queries) {
    var handlers = {
        pre: [],
        post: []
    };
    var context;

    prefix = string.rtrim('/', prefix);

    app.get(prefix, initHandler('', handlers.pre, function(req, res) {
        var api = {};

        async.parallel(zip(apis).map(function(v) {
            return function(cb) {
                queries.getMeta(v[1], function(err, d) {
                    if(err) return console.error(err);

                    api[v[0]] = d;

                    cb();
                });
            };
        }), function() {
            res.json(api);
        });
    }));

    for(var k in apis) initAPI(app, prefix, k, apis[k], queries, handlers);

    return {
        use: function(fn) {
            handlers[context].push(fn);
        },
        pre: function(fn) {
            context = 'pre';
            fn();
        },
        post: function(fn) {
            context = 'post';
            fn();
        }
    };
}
module.exports = init;

function initAPI(app, prefix, resource, model, queries, handlers) {
    var operator = operate.bind(undefined, handlers.post);
    var groupOps = {
        get: function(req, res) {
            queries.getAll(model, req.query, operator(req, res));
        },
        put: function(req, res) {
            var data = is.defined(req.body)? req.body: req.query;

            queries.update(model, data._id, data, operator(req, res));
        },
        post: function(req, res) {
            queries.create(model, getParams(req), operator(req, res));
        },
        'delete': function(req, res) {
            queries.remove(model, req.body, operator(req, res));
        }
    };
    var name = prefix + '/' + resource;

    crud(app, name, initHandlers(resource, handlers.pre, groupOps));

    app.get(name + '/count', initHandler(resource, handlers.pre, function(req, res) {
        queries.count(model, operator(req, res));
    }));

    var excludeIdOps = ['post'];
    var idOps = {
        get: function(req, res) {
            queries.get(model, req.params.id, req.query.fields, operator(req, res));
        },
        put: function(req, res) {
            queries.update(model, req.params.id, getParams(req), operator(req, res));
        },
        post: function(req, res) {
            getOp(idOps, 'post', excludeIdOps)(req, res);
        },
        'delete': function(req, res) {
            queries.remove(model, req.params, operator(req, res));
        }
    };

    crud(app, name + '/:id', initHandlers(resource, handlers.pre, idOps));
}

function getParams(req) {
    return Object.keys(req.body).length? req.body: req.query;
}

function initHandlers(resource, preHandlers, o) {
    var ret = {};

    for(var k in o) ret[k] = initHandler(resource, preHandlers, o[k]);

    return ret;
}

function initHandler(resource, preHandlers, fn) {
    return function(req, res) {
        req.resource = resource;

        evaluateHandlers(preHandlers, req, res, function() {
            req.body = parseCommaLists(req.body);
            req.query = parseCommaLists(req.query);

            fn(req, res);
        });
    };
}

function operate(postHandlers, req, res) {
    return function(err, data) {
        if(err) {
            res.status(400);
            res.json(err);

            return;
        }

        evaluateHandlers(postHandlers, req, res, function() {
            res.json(data);
        }, data);
    };
}

function evaluateHandlers(handlers, req, res, done, data) {
    async.series(handlers.map(function(fn) {
        return function(cb) {
            fn(req, res, function(err) {
                cb(err, data);
            }, data);
        };
    }), done);
}

function getOp(verbs, method, exclude) {
    exclude = exclude || [];

    if(method in verbs && exclude.indexOf(method) < 0) return verbs[method];
    return notAllowed(verbs);
}

function parseCommaLists(o) {
    var ret = {};

    for(var k in o) {
        var v = o[k];

        if(k && is.string(v)) {
            var parts = v.split(',');

            ret[k] = parts.length > 1? parts: v;
        }
        else {
            ret[k] = v;
        }
    }

    return ret;
}

function crud(app, url, verbs) {
    for(var k in verbs) app[k](url, verbs[k] || notAllowed(verbs));
}

function notAllowed(verbs) {
    var allowed = Object.keys(verbs).map(function(k) {k.toUpperCase();}).join(', ');

    return function(req, res) {
        res.header('Allow', allowed);
        res.send(403);
    };
}

