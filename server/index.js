/**
 * This is the server entry point file, and the sole file used to handle all
 * ajax and non-ajax HTTP requests sent by the browser-based client for this
 * grocery list app. The server-side portion of this exercise is not the focus,
 * but you can still benefit from the comments I've added across this file if you're
 * curious about Node.js.
 */

// These first set of variables represent all 3rd-party dependencies needed by our server.
var express = require('express'),
    app = express(),
    router = express.Router(),
    bodyParser = require('body-parser'),
    path = require('path'),

    /**
     * All grocery items are stored here. The items hardcoded in this array represent
     * the initial items that will be seen by the user when the list loads in the browser
     * after the server first starts. Each item contains a unique numeric ID and a name.
     * All items are addressed by their ID through the HTTP API defined later in this file.
     */
    items = [
        {
            id: 0,
            name: 'Bananas'
        },
        {
            id: 1,
            name: 'Ketchup'
        },
        {
            id: 2,
            name: 'MacBook Pro'
        }
    ],

    /**
     * This is the last assigned ID number. We need it to determine the next ID to assign
     * when a new grocery item is added.
     */
    lastId = 2,

    /**
     * The use of `Array.prototype.findIndex`, which was discussed in chapter 12 of the book,
     * requires we depend on a more recent version of Node.js, such as v5. I could have
     * used `Array.prototype.indexOf` instead and used an older version of Node, but felt
     * it was useful to demonstrate this newer addition to the `Array` prototype instead.
     */
    getIndexOfId = function(id) {
        return items.findIndex(function(item) {
            return item.id === id
        })
    }

// This ensures all HTTP GET requests for any of our client-side files are returned.
app.use(express.static(path.resolve('client')))

// Same as above, but this is for the node_modules directory, where our polyfills live.
app.use('/node_modules', express.static(path.resolve('node_modules')))

/**
 * Any requests with JSON or JSON PATCH payloads will be turned into JavaScript objects
 * before the matching route handler is called.
 */
app.use(bodyParser.json({ type: ['json', '+json'] }))

// This sends any API requests to the API request routes below.
app.use('/api', router)

/**
 * This is our first API request route handler. It is called when a GET request is sent to
 * the /items endpoint. The response includes all items currently stored in the items array.
 * The Cache-Control header ensures that the request is not cached by the browser.
 */
router.get('/items', function(request, response)  {
    response.header('Cache-Control', 'no-cache')
    response.json(items)
})

// Any DELETE request for a specific item (given an item ID) are handled here.
router.delete('/item/:id', function(request, response) {
    var id = parseInt(request.params.id),
        itemIndex = getIndexOfId(id)

    // If the item is not found, the request fails with a 404 status.
    if (itemIndex < 0) {
        response.status(404).end()
    }
    else {
        // If the item is found, it is removed from the items array.
        items.splice(itemIndex, 1)
        response.status(200).end()
    }
})

/**
 * This third API request route handler is for all PATCH requests, which are used to update
 * a single property on an existing item. I talked about PATCH requests and JSON PATCH
 * documents in chapter 10. The expected payload for all PATCH requests is a JSON PATCH
 * document, and the expected Content-Type for the request is application/json-patch+json.
 */
router.patch('/item/:id', function(request, response) {
    var directive = request.body,
        id = parseInt(request.params.id),
        item = items[getIndexOfId(id)],
        operation = directive.op,
        path = directive.path.substring(1),
        value = directive.value

    /**
     * The only operation supported by this server is "replace". Any other operations
     * are rejected with a 403 response.
     */
    if (operation !== 'replace') {
        response.status(403).send('PATH op of ' + operation + ' is not supported.')
    }
    else if (!item) {
        // As expected, if the item is not found, the request fails with a 404 response.
        response.status(404).end()
    }
    else {
        /**
         * Otherwise the item's property indicated in the JSON PATCH payload is updated
         * with the indicated value.
         */
        item[path] = value
    }

    // The updated grocery item object is returned in the response if the request succeeds.
    response.json(item)
})

/**
 * This is fourth and final API request handler. It's job is to response to requests to
 * add new grocery items to the list, which must be sent as POST requests. The payload of
 * each such request must an object with a name property. A unique ID is assigned by the server
 * in this route handler.
 */
router.post('/item', function(request, response) {
    var id = ++lastId,
        item = request.body

    // The request fails with a 400 status if the mandatory name property is omitted.
    if (item.name == null) {
        response.status(400).send('Missing `name` property.')
    }
    else {
        /**
         * Otherwise, a new ID is created for the item, it is added to the items array,
         * and then returned to the client in the response.
         */
        item.id = id
        items.push(item)
        response.json(item)
    }
})

// This line blocks the server from exiting and listens for all HTTP requests.
app.listen(3000, function() {
    console.log('Grocery list server listening on port 3000.')
})