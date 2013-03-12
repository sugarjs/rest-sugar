var sugar = require('object-sugar');

var schema = sugar.schema();


exports.Library = schema('Library', {
    name: String,
    url: String
});

exports.Tag = schema('Tag', {
    name: String
});
