# rest-sugar - Makes it easy to write yummy REST APIs

The whole point of this library is to make it easy to implement simple
yet powerful REST APIs. There are a few extension points you can hook
into. [mongoose-sugar](https://github.com/bebraw/mongoose-sugar)
complements this particular library very well. It is possible to implement
similar solutions for other backends too as long as you stick to the
[sugar-spec](https://github.com/bebraw/sugar-spec).

Even though the library has been designed based on Express, it might be
possible to make it work with other similar libraries too given they use
Express conventions. This might take some kind of an adapter.

## Basic Schema

The following urls contain a prefix given at init.

* GET /? (ie. /api/v1) -&gt; API metadata (ie. schema and help)
* GET /&lt;api&gt; -&gt; Get all
* GET /&lt;api&gt;?name=foobar -&gt; Get all with the matching name
* GET /&lt;api&gt;?limit=25&offset=50 -&gt; Get with pagination
* GET /&lt;api&gt;/count -&gt; Get count
* GET /&lt;api&gt;?fields=name,color -&gt; Get name and color fields only
* POST /&lt;api&gt;?name=foobar -&gt; Create new item with the given name
* PUT /&lt;api&gt; -&gt; Disallowed, gives 403 error
* DELETE /&lt;api&gt; -&gt; Disallowed, gives 403 error

Note that it is possible to mix and match various GETs above. The following
urls operate on a specific resource (ie. /&lt;api&gt;/&lt;id&gt;).

* GET /&lt;api&gt;/&lt;id&gt; -&gt; Get resource matching to the id
* POST /&lt;api&gt;/&lt;id&gt; -&gt; Disallowed, gives 403 error
* PUT /&lt;api&gt;/&lt;id&gt;?name=joe -&gt; Updates the content of the given resource with
  the given field data
* DELETE /&lt;api&gt;/&lt;id&gt; -&gt; Deletes the given resource. Returns an empty structure
  if successful.

## Middleware

In case you want to use some authentication method (preferable!) or
customize the behavior further, consider using middlewares. You may attach
both `pre` and `post` middleware handlers. `pre` ones are performed before an
actual database query performed whereas `post` ones are after. The basic syntax
resembles Express. See the example below:

```js
...

var api = rest.init(app, '/api/v1', {
    authors: models.Author
}, sugar);

api.pre(function() {
    api.use(rest.middleware.only('GET'));
    api.use(rest.middleware.keyAuth({name: 'apikey', value: 'secret'}));
    api.use(function(req, res, next) {
        // do your magic now

        next(); // call or else...
    });
});

// api.post is identical except the functions get an extra parameter containing
// the data fetched from the database. You may then use that data to trigger
// further actions for instance
```

Examine the tests included with the project for more complete examples.

## Acknowledgments

Inspired by [RESTful API Design - Second
Edition](http://www.slideshare.net/apigee/restful-api-design-second-edition)
and [django-tastypie](https://github.com/toastdriven/django-tastypie).

## License

rest-sugar is available under MIT. See LICENSE for more details.

