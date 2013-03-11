var sugar = require('object-sugar');

var schema = sugar.schema();

exports.Author = schema('Author', {
    name: {type: String, required: true}
});
