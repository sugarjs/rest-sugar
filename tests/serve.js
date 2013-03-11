var express = require('express');


function serve(conf) {
    var app = express();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    return app;
}
module.exports = serve;
