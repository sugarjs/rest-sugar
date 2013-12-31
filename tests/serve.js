var express = require('express');


function serve(conf) {
    var app = express();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT

        // handles POST
        app.use(express.json());
        app.use(express.urlencoded());

        app.use(app.router);
    });

    return app;
}
module.exports = serve;
