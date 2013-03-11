var funkit = require('funkit');
var is = require('is-js');


function init(app, prefix, apis, queries, auth, success) {
    prefix = funkit.string.rtrim('/', prefix);

    app.get(prefix, handle('', auth, function(req, res) {
        var api = {};

        for(var k in apis) api[k] = queries.getMeta(apis[k]);

        res.json(api);
    }));

    for(var k in apis) initAPI(app, prefix, k, apis[k], queries, auth, success);
}
exports.init = init;

// IMPORTANT! if you decide to use key based auth, remember to use SSL
// to mitigate MITM attacks
function key(name, value, check) {
    check = check || function(req) {return true;};

    return function(err, ok) {
        return function(req, res) {
            if(!check(req)) return err(res);

            if(req.query[name] == value || req.body[name] == value) {
                if('query' in req) delete req.query[name];
                if('body' in req) delete req.body[name];
                ok(req, res);
            }
            else err(res);
        };
    };
}

function only(method) {
    return function(err, ok) {
        return function(req, res) {
            if(req.method == method) ok(req, res);
            else err(res);
        };
    };
}

function unauthorized(res) {
    error(res, "Sorry, unable to access this resource. Check your auth", 401);
}

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

exports.auth = {
    key: key,
    only: only
};

function initAPI(app, prefix, resource, model, queries, auth, success) {
    var operator = operate.bind(undefined, success);
    var groupOps = {
        post: function(req, res) {
            queries.create(model, getParams(req), operator(req, res));
        },
        get: function(req, res) {
            var query = req.query;
            var method = query.method;
            delete query.method;

            if(method && method != 'get') getOp(groupOps, method)(req, res);
            else queries.getAll(model, query, operator(req, res));
        },
        'delete': function(req, res) {
            queries['delete'](model, req.body._id, operator(req, res));
        }
    };
    var name = prefix + '/' + resource;

    crud(app, name, handlers(resource, auth, groupOps));

    app.get(name + '/count', handle(resource, auth, function(req, res) {
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
            queries['delete'](model, req.params.id, operator(req, res));
        }
    };

    crud(app, name + '/:id', handlers(resource, auth, idOps));
}

function getParams(req) {
    return Object.keys(req.body).length? req.body: req.query;
}

function handlers(resource, auth, o) {
    var ret = {};

    for(var k in o) ret[k] = handle(resource, auth, o[k]);

    return ret;
}

function handle(resource, auth, fn) {
    auth = auth || function(err, ok) {
        return function(req, res) {
            ok(req, res);
        };
    };

    return function(req, res) {
        req.resource = resource;

        return auth(unauthorized, function(req, res) {
            req.body = parseCommaLists(req.body);
            req.query = parseCommaLists(req.query);

            fn(req, res);
        })(req, res);
    };
}

function operate(success, req, res) {
    success = success || function() {};

    return function(err, d) {
        if(err) {
            res.status(400);
            res.json(err);
            return;
        }

        success(req, res, d);

        res.json(d);
    };
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

