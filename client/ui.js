/**
 * This module focuses on rendering and updating the grocery list UI.
 * Both internal/private and public API methods are defined here.
 */
(function(groceries) {
    var addItemEl = document.querySelector('.add-grocery-item'),
        alertEl = document.querySelector('.grocery-list-alert'),

        // This is the grocery item template located in a <script> tag on the index.html page.
        groceryItemTemplateString = document.getElementById('grocery-item-template').innerHTML,
        // An element that will hold the error message text
        groceryListAlertContentEl = alertEl.querySelector('.grocery-list-alert-content'),
        // This is the container element that holds all grocery item elements.
        groceryListEl = document.querySelector('.grocery-list'),

        /**
         * Adds a single grocery item element or an entire container
         * filled with grocery item elements to the DOM.
         */
        addItemOrItemsToDom = function(itemOrItems) {
            // add the grocery item element(s) above the "add a new item" text inout
            groceryListEl.insertBefore(itemOrItems, addItemEl)
        },

        /**
         * Adds a new grocery item object to the store & ultimately the DOM.
         * This method optionally takes a DocumentFragment, which may be used
         * to efficiently render multiple grocery item elements at once.
         * The element representation of the passed grocery item object,
         * which is created by this method, is returned.
         */
        addItemToList = function(item, documentFragment) {
            groceries.store.addItem(item)

            var newListItemEl = createNewItemEl(item)

            /**
             * If we're working with a document fragment, add the element
             * representing the item object to the fragment, otherwise add it
             * to the DOM.
             */
            if (documentFragment) {
                documentFragment.appendChild(newListItemEl)
            }
            else {
                addItemOrItemsToDom(newListItemEl)
            }

            return newListItemEl
        },

        /**
         * Given a grocery item object, create an HTML Element representation, add it to the DOM,
         * and return this element.
         */
        createNewItemEl = function(item) {
            // Create a temporary element, detached from the DOM, to store the new item element.
            var tempItemContainerEl = document.createElement('div')

            /**
             * Read the grocery item template string from the template <script> tag,
             * turn it into an HTML element, and add this as a child of the temporary container element.
             */
            tempItemContainerEl.insertAdjacentHTML('afterbegin', groceryItemTemplateString)

            /**
             * Delegate to another method that will set appropriate values for the item element
             * & add it to the DOM.
             */
            var itemEl = tempItemContainerEl.firstElementChild
            groceries.ui.updateItem(item, itemEl)

            return itemEl
        }

    // The public methods are defined here. Everything above is "private" and only for internal use.
    groceries.ui = {
        /**
         * Handles a request to archive an item.
         * This is the step before it is completely deleted from the server.
         * A Promise is returned, detailing the result of the HTTP request
         * sent to the server to mark the associated item as archived.
         */
        archiveItem: function(id, unarchive) {
            var archive = !unarchive

            // Update the server. On success, update the UI.
            return groceries.util.sendRequest('PATCH', '/api/item/' + id, {
                op: 'replace', path: '/archived', value: archive
            }).then(this.updateItem)
        },

        /**
         * Completely delete a grocery item from the server and the DOM.
         */
        deleteItem: function(id) {
            /**
             * Tell the server to delete the item object. On success,
             * remove the item element from the DOM.
             */
            groceries.util.sendRequest('DELETE', '/api/item/' + id)
                .then(function() {
                    groceries.store.removeItemFromList(id)

                    // We use a data attribute w/ the item's ID to locate it in the DOM & remove it.
                    var groceryItemEl = document.querySelector('[data-id="' + id + '"')
                    groceryItemEl.parentNode.removeChild(groceryItemEl)
                })
        },

        /**
         * Load all item from the server and render them as grocery item elements in the DOM.
         */
        loadInitialItems: function() {
            // GET the item objects from the server. On success, render them all.
            groceries.util.sendRequest('GET', '/api/items')
                .then(function(items) {
                    // We will use a DocumentFragment to avoid a reflow for each new added item element.
                    var documentFragment = document.createDocumentFragment()

                    // Ignore archived items. For all other items, add them to the DocumentFragment.
                    items.forEach(function(item) {
                        !item.archived && this.updateItem(item, null, documentFragment)
                    }.bind(this))

                    /**
                     * This will take the DocumentFragment, which is not attached to the DOM,
                     * and add all of its contents (the initial grocery items from the server)
                     * all at once. This should only result in a single repaint/reflow.
                     */
                    addItemOrItemsToDom(documentFragment)

                }.bind(this))
        },

        /**
         * Temporarily display error messages at the bottom of the page.
         */
        showError: function(message) {
            /**
             * If an error is already displayed, this will prevent the new error
             * from disappearing too quickly.
             */
            clearTimeout(this.showErrorTimer)

            // Set the error message text and un-hide the error box.
            groceryListAlertContentEl.textContent = message
            alertEl.removeAttribute('hidden')

            // Hide the error box again after 10 seconds.
            this.showErrorTimer = setTimeout(function() {
                alertEl.setAttribute('hidden', '')
            }, 10000)
        },

        // Remove the "archive" flag on an item. This happens when a "delete" is undone.
        unarchiveItem: function(id) {
            this.archiveItem(id, true)
        },

        /**
         * Based on a backing item object, update the associated item element
         * (or create a new one if the item isn't already in the DOM).
         */
        updateItem: function(newItem, itemEl, documentFragment) {
            var oldItem = groceries.store.getItemById(newItem.id)

            // This is the code path for adding a new item element to the DOM.
            if (!oldItem) {
                // Add the item to the list and possibly a DocumentFragment
                itemEl = addItemToList(newItem, documentFragment)

                /**
                 * Ensure the element's checkbox reflects the value of the "completed" property
                 * on the backing grocery item object.
                 */
                itemEl.querySelector('.grocery-item-completed').checked = newItem.completed
                itemEl[newItem.completed ? 'setAttribute' : 'removeAttribute']('completed', '')

                // Add a data attribute to the item element so we can easily located it by ID later.
                itemEl.setAttribute('data-id', newItem.id)

                /**
                 * Ensure the text of the item element reflects the value of the "name" property
                 * on the backing grocery item object.
                 */
                itemEl.querySelector('.grocery-item-name').textContent = newItem.name
            }
            // This is the code path for updating an existing item element
            else {
                // Replace the matching item in the store with this one (key is the ID).
                groceries.store.replaceItemInList(newItem)

                // Find the matching item element in the DOM.
                itemEl =  itemEl || document.querySelector('[data-id="' + newItem.id + '"]')

                // Hide the item element if it is now archived, show it if it is no longer archived.
                if (newItem.archived !== oldItem.archived) {
                    itemEl[newItem.archived ? 'setAttribute' : 'removeAttribute']('hidden', '')
                }

                // Mark the item's checkbox if it is "completed", uncheck if no longer "completed".
                if (newItem.completed !== oldItem.completed) {
                    itemEl[newItem.completed ? 'setAttribute' : 'removeAttribute']('completed', '')
                }

                // Update the text of the item element if the name has changed.
                if (newItem.name !== oldItem.name) {
                    itemEl.querySelector('.grocery-item-name').textContent = newItem.name
                }
            }
        }
    }
}(groceries || {}))
