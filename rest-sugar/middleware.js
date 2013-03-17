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

function allow(methods) {
    return function(req, res, next) {
        if(methods.indexOf(req.method) >= 0) return next();

        unauthorized(res);
    };
}
exports.allow = allow;

function https(req, res, next) {
    // http://stackoverflow.com/questions/8152651/how-can-i-check-that-a-request-is-coming-over-https-in-express
    if(req.headers['x-forwarded-proto'] &&
       req.headers['x-forwarded-proto'] === 'https')
        return next();

    unauthorized(res);
}
exports.https = https;

function unauthorized(res) {
    res.json({errors: [{message: "Sorry, unable to access this resource. Check your auth"}]}, 401);
}
exports.unauthorized = unauthorized;
