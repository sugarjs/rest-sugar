var async = require('async');
var funkit = require('funkit');
var otozip = funkit.functional.otozip;
var is = require('is-js');


function init(app, prefix, apis, queries) {
    var handlers = {
        pre: [],
        post: []
    };
    var context;

    prefix = funkit.string.rtrim('/', prefix);

    app.get(prefix, initHandler('', handlers.pre, function(req, res) {
        var api = {};

        async.parallel(otozip(apis).map(function(v) {
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
exports.init = init;

// IMPORTANT! if you decide to use key based auth, remember to use SSL
// to mitigate MITM attacks and store key in a safe way!
function keyAuth(auth) {
    var name = auth.name;
    var value = auth.value;

    return function(req, res, next) {
        if(req.query[name] == value) {
            if('query' in req) delete req.query[name];

            return next();
        }
        if(req.body[name] == value) {
            if('body' in req) delete req.body[name];

            return next();
        }

        unauthorized(res);
    };
}
exports.keyAuth = keyAuth;

function only(method) {
    return function(req, res, next) {
        if(req.method == method) return next();

        unauthorized(res);
    };
}
exports.only = only;

function unauthorized(res) {
    error(res, "Sorry, unable to access this resource. Check your auth", 401);
}
exports.unauthorized = unauthorized;

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

function initAPI(app, prefix, resource, model, queries, handlers) {
    var operator = operate.bind(undefined, handlers.post);
    var groupOps = {
        get: function(req, res) {
            var query = req.query;
            var method = query.method;
            delete query.method;

            if(method && method != 'get') getOp(groupOps, method)(req, res);
            else queries.getAll(model, query, operator(req, res));
        },
        put: function(req, res) {
            var data = is.empty(req.body)? req.query: req.body;

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
            var method = req.query.method;

            if(method && method != 'get') getOp(idOps, method, excludeIdOps)(req, res);
            else queries.get(model, req.params.id, req.query.fields, operator(req, res));
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

        evaluatePreHandlers(preHandlers, req, res, function() {
            req.body = parseCommaLists(req.body);
            req.query = parseCommaLists(req.query);

            fn(req, res);
        });
    };
}

function operate(postHandlers, req, res) {
    return function(err, d) {
        if(err) {
            res.status(400);
            res.json(err);
            return;
        }

        evaluatePostHandlers(postHandlers, req, res, d, function() {
            res.json(d);
        });
    };
}

function evaluatePreHandlers(handlers, req, res, done) {
    async.series(handlers.map(function(fn) {
        return function(cb) {
            fn(req, res, cb);
        };
    }), done);
}

function evaluatePostHandlers(handlers, req, res, data, done) {
    async.series(handlers.map(function(fn) {
        return function(cb) {
            fn(req, res, cb, data);
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

