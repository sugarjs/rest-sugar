# rest-sugar - Makes it easy to write yummy REST APIs

The whole point of this library is to make it easy to implement simple
yet powerful REST APIs. There are a few extension points you can hook
into. mongoose-sugar complements this particular library very well.
It is possible to implement similar solutions for other backends too.

Even though the library has been designed based on Express, it might be
possible to make it work with other similar libraries too given they use
Express conventions. This might take some kind of an adapter.

See the demos to see how the architecture works out. Note that as it does
not use mongoose-sugar it is a bit lengthy. It should give you some idea
how to implement components that fit the whole, though.

Inspired by [RESTful API Design - Second
Edition](http://www.slideshare.net/apigee/restful-api-design-second-edition)
and [django-tastypie](https://github.com/toastdriven/django-tastypie).

## Features

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

It is possible to emulate POST, PUT and DELETE via GET by using a query (ie.
method=post).

In case you want to use some authentication method (preferable!), you may
provide a custom auth handler for the init. It wraps each call in the API
except for the metadata one. It's signature is auth(fn) meaning you are
supposed to call fn in case auth has been made properly. The default
implementation just passes everything through.

## License

rest-sugar is available under MIT. See LICENSE for more details.

