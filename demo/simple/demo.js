#!/usr/bin/env node
var express = require('express');
var rest = require('../../lib/rest-sugar');

main();

function main() {
    var app = express.createServer();

    app.configure(function() {
        app.use(express.methodOverride()); // handles PUT
        app.use(express.bodyParser()); // handles POST
        app.use(app.router);
    });

    initAPI(app);

    console.log('Surf to localhost:8000');
    app.listen(8000);
}

// our API (basic CRUD + count + meta)
function initAPI(app) {
    rest.init(app, '/api/v1/', {
        'libraries': libraries(),
        'tags': tags()
    }, queries());
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
        create: function(model, data, okCb, errCb) {
            model.push(data); // might want to validate now
            okCb(model[model.length - 1]);
        },
        getAll: function(model, query, okCb, errCb) {
            okCb(model);
        },
        get: function(model, id, fields, okCb, errCb) {
            id = parseInt(id, 10);
            if(0 <= id && id < model.length) okCb(model[id]);
            else errCb('not found');
        },
        update: function(model, id, data, okCb, errCb) {
            id = parseInt(id, 10);
            if(0 <= id && id < model.length) {
                for(var k in data) model[id][k] = data[k];
                okCb(model[id]);
            }
            else errCb('not updated');
        },
        'delete': function(model, id, okCb, errCb) {
            var a = model.splice(id, 1);

            if(a) okCb({});
            else errCb('not deleted');
        },
        count: function(model, okCb, errCb) {
            okCb(model.length);
        },
        getMeta: function(model) {
            return model.meta;
        }
    };
}

