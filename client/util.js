/**
 * This is a utility module that provides generalized convenience methods
 * for the rest of the codebase.
 */

// Register the "groceries" namespace (public variable) if it doesn't already exist.
var groceries = groceries || {}

groceries.util = {
    // Shim for Element.closest, as detailed in chapter 4 of the book.
    closest: function(referenceEl, closestSelector) {
        if (referenceEl.closest) {
            return referenceEl.closest(closestSelector);
        }

        var matches = Element.prototype.matches ||
                Element.prototype.msMatchesSelector ||
                Element.prototype.webkitMatchesSelector,

            currentEl = referenceEl;

        while (currentEl) {
            if (matches.call(currentEl, closestSelector)) {
                return currentEl;
            }
            currentEl = currentEl.parentElement;
        }

        return null;
    },

    // Shim for Array.prototype.find.
    findInArray: function(array, callback) {
        if (array.find) {
            return array.find(callback)
        }

        var matchingItem = null
        array.some(function(item) {
            if (callback(item)) {
                matchingItem = item
                return true
            }
        })
        return matchingItem
    },

    // Shim for Array.prototype.findIndex.
    findIndexInArray: function(array, callback) {
        if (array.findIndex) {
            return array.findIndex(callback)
        }

        var matchingIndex = null
        array.some(function(item, index) {
            if (callback(item)) {
                matchingIndex = index
                return true
            }
        })
        return matchingIndex
    },

    // Wrapper around the Fetch API.
    sendRequest: function(method, url, data) {
        var headers = {}

        // Set the appropriate Content-Type header based on the HTTP method.
        if (method === 'PATCH') {
            headers['Content-Type'] = 'application/json-patch+json'
        }
        else if (method === 'POST') {
            headers['Content-Type'] = 'application/json'
        }

        return fetch(url, {
            // Only send a request body if data is provided.
            body: data ? JSON.stringify(data) : undefined,
            headers: headers,
            method: method
        })
            .then(
                // This is called if there is no network error.
                function success(response) {
                    /**
                     * If the request succeeds & we are expected data in the response,
                     * convert the JSON response to a JavaScript object and return it
                     * to the caller. Otherwise, just return the response status code.
                     */
                    if (response.ok) {
                        if (method.toLowerCase() !== 'delete') {
                            return response.json()
                        }
                        return response.status
                    }

                    /**
                     * If the server indicates failure, throw an Error
                     * containing either the message from the server or
                     * the response status code if the response is empty.
                     * Also, display an error message in the UI.
                     */
                    return response.text().then(function(text) {
                        var message = text || response.status

                        groceries.ui.showError(message)
                        throw new Error(message)
                    })
                },

                // If we encounter a network error, display an error message and throw an Error.
                function error(error) {
                    groceries.ui.showError('Network error')
                    throw error
                }
            )
        }
}