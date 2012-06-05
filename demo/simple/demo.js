#!/usr/bin/env node
var express = require('express');
var rest = require('../../lib/rest-sugar');

// IMPORTANT! Do not store this in repo on production
// In order to deal with this, define a separate module (ie. config.js) that
// does not go to the repo and load it from there. Or alternatively just stash
// it to your environment (ie. process.env.APIKEY). You can also combine these
// approaches.
var APIKEY = 'dummy';

main();

function main() {
    var app = express.createServer();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    rest.init(app, '/api/v1/', {
        'libraries': libraries(),
        'tags': tags()
    }, queries(), rest.auth.key('apikey', APIKEY));

    console.log('Surf to localhost:8000');
    app.listen(8000);
}

// some schema (could use actual db here!). mongoose-sugar works nicely too
// note that this data is not persistent! ie. gets reset on server reset
function libraries() {
    var ret = [];
    ret.meta = ['name', 'url'];
    return ret;
}

function tags() {
    var ret = [];
    ret.meta = ['name'];
    return ret;
}

// queries that operate on the schema. mongoose-sugar does this too
function queries() {
    return {
        create: function(model, data, cb) {
            model.push(data); // might want to validate now
            cb(null, model[model.length - 1]);
        },
        getAll: function(model, query, cb) {
            cb(null, model);
        },
        get: function(model, id, fields, cb) {
            id = parseInt(id, 10);
            if(0 <= id && id < model.length) cb(null, model[id]);
            else cb('not found');
        },
        update: function(model, id, data, cb) {
            id = parseInt(id, 10);
            if(0 <= id && id < model.length) {
                for(var k in data) model[id][k] = data[k];
                cb(null, model[id]);
            }
            else cb('not updated');
        },
        'delete': function(model, id, cb) {
            var a = model.splice(id, 1);

            if(a) cb(null, {});
            else cb('not deleted');
        },
        count: function(model, okCb, cb) {
            cb(null, model.length);
        },
        getMeta: function(model) {
            return model.meta;
        }
    };
}

