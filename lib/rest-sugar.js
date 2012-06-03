var funkit = require('funkit');

function init(app, prefix, apis, queries, auth) {
    prefix = funkit.rtrim(prefix, '/');

    app.get(prefix, function(req, res) {
        var api = {};

        for(var k in apis) api[k] = queries.getMeta(apis[k]);

        res.json(api);
    });

    for(var k in apis) initAPI(app, prefix + '/' + k, apis[k], queries, auth);
}
exports.init = init;

// IMPORTANT! if you decide to use key based auth, remember to use SSL
// to mitigate MITM attacks
function key(name, value, check) {
    check = check || function(req) {return false;};

    return function(fn) {
        return function(req, res) {
            if(req.query[name] == value || req.body[name] == value || check(req)) {
                if('query' in req) delete req.query[name];
                if('body' in req) delete req.body[name];
                fn(req, res);
            }
            else unauthorized(res);
        };
    };
}

function unauthorized(res) {
    error(res, "Sorry, unable to access this resource. Check your auth");
}

exports.auth = {
    key: key
};

function initAPI(app, name, model, queries, auth) {
    crud(app, name, handlers(auth, {
        post: function(req, res) {
            queries.create(model, req.body, ret(res), ret(res));
        },
        get: function(req, res) {
            var method = req.query.method;

            if(method) getOp(this, method)(req, res);
            else queries.getAll(model, req.query, ret(res), ret(res));
        }
    }));

    app.get(name + '/count', handle(auth, function(req, res) {
        queries.count(model, ret(res), err(res));
    }));

    crud(app, name + '/:id', handlers(auth, {
        get: function(req, res) {
            var method = req.query.method;

            if(method) getOp(this, method)(req, res);
            else queries.get(model, req.params.id, req.query.fields, ret(res), err(res));
        },
        put: function(req, res) {
            queries.update(model, req.params.id, req.body, ret(res), err(res));
        },
        'delete': function(req, res) {
            queries['delete'](model, req.params.id, ret(res), err(res));
        }
    }));
}

function handlers(auth, o) {
    for(var k in o) o[k] = handle(auth, o[k]);

    return o;
}

function handle(auth, fn) {
    auth = auth || function(f) {return function(req, res) {f(req, res);};};

    return auth(function(req, res) {
        req.body = parseCommaLists(req.body);
        req.query = parseCommaLists(req.query);
        fn(req, res);
    });
}

function ret(res) {
    return function(d) {res.json(d);};
}

function err(res) {
    return function(e) {
        if(e) res.json(e);
        else error(res, 'Sorry, unable to find this resource', 404);
    };
}

function getOp(verbs, method) {
    if(method in verbs) return verbs;
    return notAllowed(verbs);
}

function parseCommaLists(o) {
    var ret = {};

    for(var k in o) {
        var v = o[k];
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

function error(res, msg, code) {
    res.json({errors: [{message: msg}]}, code);
}

