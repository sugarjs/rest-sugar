var funkit = require('funkit');

function init(app, prefix, apis, queries, auth) {
    prefix = funkit.rtrim(prefix, '/');

    app.get(prefix, handle(auth, function(req, res) {
        var api = {};

        for(var k in apis) api[k] = queries.getMeta(apis[k]);

        res.json(api);
    }));

    for(var k in apis) initAPI(app, prefix + '/' + k, apis[k], queries, auth);
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

function initAPI(app, name, model, queries, auth) {
    var groupOps = {
        post: function(req, res) {
            queries.create(model, getParams(req), ret(res));
        },
        get: function(req, res) {
            var query = req.query;
            var method = query.method;
            delete query.method;

            if(method && method != 'get') getOp(groupOps, method)(req, res);
            else queries.getAll(model, query, ret(res));
        }
    };

    crud(app, name, handlers(auth, groupOps));

    app.get(name + '/count', handle(auth, function(req, res) {
        queries.count(model, ret(res));
    }));

    var idOps = {
        get: function(req, res) {
            var method = req.query.method;

            if(method && method != 'get') getOp(idOps, method)(req, res);
            else queries.get(model, req.params.id, req.query.fields, ret(res));
        },
        put: function(req, res) {
            queries.update(model, req.params.id, getParams(req), ret(res));
        },
        'delete': function(req, res) {
            queries['delete'](model, req.params.id, ret(res));
        }
    };

    crud(app, name + '/:id', handlers(auth, idOps));
}

function getParams(req) {
    return Object.keys(req.body).length? req.body: req.query;
}

function handlers(auth, o) {
    var ret = {};

    for(var k in o) ret[k] = handle(auth, o[k]);

    return ret;
}

function handle(auth, fn) {
    auth = auth || function(err, ok) {return function(req, res) {ok(req, res);};};

    return auth(unauthorized, function(req, res) {
        req.body = parseCommaLists(req.body);
        req.query = parseCommaLists(req.query);
        fn(req, res);
    });
}

function ret(res) {
    return function(err, d) {
        if(err) {
            res.json(err);
            return;
        }

        res.json(d);
    };
}

function getOp(verbs, method) {
    if(method in verbs) return verbs[method];
    return notAllowed(verbs);
}

function parseCommaLists(o) {
    var ret = {};

    for(var k in o) {
        var v = o[k];
        if(!k || !funkit.isString(v)) continue;
        var parts = v.split(',');

        ret[k] = parts.length > 1? parts: v;
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

