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

## Features

The following urls contain a prefix given at init.

* GET /? (ie. /api/v1) -> API metadata (ie. schema and help)
* GET /<api> -> Get all
* GET /<api>?name=foobar -> Get all with the matching name
* GET /<api>?limit=25&offset=50 -> Get with pagination
* GET /<api>/count -> Get count
* GET /<api>?fields=name,color -> Get name and color fields only
* POST /<api>?name=foobar -> Create new item with the given name
* PUT /<api> -> Disallowed, gives 403 error
* DELETE /<api> -> Disallowed, gives 403 error

Note that it is possible to mix and match various GETs above. The following
urls operate on a specific resource (ie. /<api>/<id>).

* GET /<api>/<id> -> Get resource matching to the id
* POST /<api>/<id> -> Disallowed, gives 403 error
* PUT /<api>/<id>?name=joe -> Updates the content of the given resource with
  the given field data
* DELETE /<api>/<id> -> Deletes the given resource. Returns an empty structure
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

