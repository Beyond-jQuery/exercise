/**
 * This module is concerned with handling DOM events. All user interactions are accounted
 * for here. For example, when the edit button is clicked, that interaction is handled in
 * this file.
 */
(function(groceries) {
    var lastDeletedItemId,
        undoTimer,

        /**
         * This will fade the undo box in. Triggered after the user clicks the delete button
         * next to a grocery item.
         */
        showUndoDelete = function(id) {
            var undoPromptEl = document.querySelector('.grocery-item-delete-undo-prompt')
            undoPromptEl.setAttribute('aria-hidden', 'false')

            /**
             * This is the item that will be automatically deleted
             * if the user does not click undo before the timer expires.
             */
            lastDeletedItemId = id

            // After 10 seconds, the item will be deleted unless the user clicks "undo".
            undoTimer = setTimeout(function() {
                groceries.ui.deleteItem(id)
                undoPromptEl.setAttribute('aria-hidden', 'true')
            }, 10000)
        }

    // This defines the public API. All variables above are private/internal.
    groceries.event = {
        /**
         * Whenever the "add" button is clicked or the enter key is pressed inside the
         * new grocery item text input, a form submit event is triggered,
         * and that is handled here.
         */
        registerAddItemHandler: function() {
            document.querySelector('.add-grocery-item').addEventListener('submit', function(event) {
                // Prevent the form submit from sending a non-ajax request to the server.
                event.preventDefault()

                var input = event.target.querySelector('input'),
                    item = {
                        name: input.value
                    }

                /**
                 * If the user has entered a name, send it to the server. If the POST request
                 * to create a new item record succeeds, clear out the input
                 * and add the new item to the list using the ui module.
                 */
                if (item.name.trim().length > 0) {
                    groceries.util.sendRequest('POST', '/api/item', item)
                        .then(function(newItem) {
                            input.value = ''
                            groceries.ui.updateItem(newItem)
                        })
                }
            })
        },

        /**
         * This monitors a "change" event that has bubbled from one of the checkboxes
         * in the grocery list, which corresponds to toggling of an item's "completed" state.
         */
        registerCompletedItemHandler: function() {
            document.querySelector('.grocery-list').addEventListener('change', function(event) {
                // We are only interested in change events that target the item checkboxes
                if (event.target.className.indexOf('grocery-item-completed') >= 0) {
                    // Find the item associated with the checkbox & determine its state
                    var groceryItemEl = groceries.util.closest(event.target, '.grocery-item'),
                        id = parseInt(groceryItemEl.getAttribute('data-id')),
                        completed = event.target.checked

                    /**
                     * Send a PATCH request to the server describing the "completed" state
                     * of the grocery item. If the request succeeds, update the item in the
                     * UI using the ui module.
                     */
                    groceries.util.sendRequest('PATCH', '/api/item/' + id, {
                        op: 'replace', path: '/completed', value: completed
                    }).then(groceries.ui.updateItem)
                }
            })
        },

        /**
         * This listens for all click events that bubble up from items in the grocery list.
         * We are interested specifically in clicks on the delete and edit buttons.
         */
        registerDeleteAndEditItemHandlers: function() {
            document.querySelector('.grocery-list').addEventListener('click', function(event) {
                // If a delete button has been clicked, start the process to delete the item.
                if (groceries.util.closest(event.target, '.grocery-item-delete-button')) {
                    // Find the associated item.
                    var groceryItemEl = groceries.util.closest(event.target, '.grocery-item'),
                        id = parseInt(groceryItemEl.getAttribute('data-id'))

                    /**
                     * Mark the item as "archived", then give the user the option to undo this
                     * archive. Otherwise, the item will be completely deleted from the server.
                     */
                    groceries.ui.archiveItem(id).then(function() {
                        showUndoDelete(id)
                    })
                }
                // If the edit button has been clicked, allow the user to change the item's name
                else if (groceries.util.closest(event.target, '.grocery-item-edit-button')) {
                    // Find the associated item.
                    var groceryItemEl = groceries.util.closest(event.target, '.grocery-item'),
                        id = parseInt(groceryItemEl.getAttribute('data-id')),
                        inputEl = groceryItemEl.querySelector('.grocery-item-edit')

                    /**
                     * Put the item into "edit" mode. This will reveal a text input and
                     * a save button inside of a form. The input will be focused
                     * so editing can begin at once, and the initial text of the input
                     * will equal the current name of the grocery item.
                     */
                    groceryItemEl.setAttribute('editing', '')
                    inputEl.focus()
                    inputEl.value = groceries.store.getItemById(id).name
                }
            })
        },

        /**
         * Handle any submit events that bubble up from the grocery list items.
         * Here, we are interested in submit events created by the edit name form,
         * which appears after the edit button has been initially clicked.
         */
        registerUpdateItemHandler: function() {
            document.querySelector('.grocery-list').addEventListener('submit', function(event) {
                if (event.target.className.indexOf('grocery-item-editing') >= 0) {
                    // Find the grocery item associated w/ the submit & the new name
                    var groceryItemEl = groceries.util.closest(event.target, '.grocery-item'),
                        inputEl = groceryItemEl.querySelector('.grocery-item-edit'),
                        id = parseInt(groceryItemEl.getAttribute('data-id')),
                        newName = groceryItemEl.querySelector('.grocery-item-edit').value

                    // Ensure the form submit does not send a non-ajax request to the server.
                    event.preventDefault()
                    // The input should lose focus after the submit.
                    inputEl.blur()

                    // Change the item back from "editing" into "viewing" mode.
                    groceryItemEl.removeAttribute('editing')

                    // Send the new name to the server. On success, update the UI.
                    groceries.util.sendRequest('PATCH', '/api/item/' + id, {
                        op: 'replace', path: '/name', value: newName
                    }).then(groceries.ui.updateItem)
                }
            })
        },

        /**
         * Initialize event handlers for the undo delete box, which appears briefly
         * after the user clicks the delete button next to a grocery item.
         */
        setupUndoDelete: function() {
            // Handler that is called when the close button on the box is clicked.
            var closeUndoPromptClickHandler = function() {
                    // Be sure to prevent the undo action from automatically occurring.
                    clearTimeout(undoTimer)
                    // Delete the item.
                    groceries.ui.deleteItem(lastDeletedItemId)
                    /**
                     * Hide the undo box. We use this attribute instead of "hidden"
                     * so we can transition the element out. The hidden attribute will
                     * immediately hide the element, which we do not want in this case.
                     * Another benefit to using aria-hidden is its built-in
                     * accessibility benefits.
                     */
                    undoPromptEl.setAttribute('aria-hidden', 'true')
                },

                // Handler that is called when the undo button is clicked.
                undoButtonClickHandler = function() {
                    // Be sure to prevent the undo action from automatically occurring.
                    clearTimeout(undoTimer)
                    // Remove the "archived" state on the item.
                    groceries.ui.unarchiveItem(lastDeletedItemId)
                    // Fade the undo box out.
                    undoPromptEl.setAttribute('aria-hidden', 'true')
                },

                undoPromptEl = document.querySelector('.grocery-item-delete-undo-prompt'),
                undoPromptCloseEl = document.querySelector('.grocery-item-delete-undo-prompt-close'),
                undoPromptButtonEl = document.querySelector('.grocery-item-delete-undo-button')

            // Register click handlers for the undo and close buttons.
            undoPromptCloseEl.addEventListener('click', closeUndoPromptClickHandler)
            undoPromptButtonEl.addEventListener('click', undoButtonClickHandler)
        }
    }
}(groceries || {}))