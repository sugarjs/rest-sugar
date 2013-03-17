module.exports = require('./core');

var middleware = require('./middleware');
for(var name in middleware) module.exports[name] = middleware[name];
