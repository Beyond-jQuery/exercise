/**
 * This is the entry point for the client-side/browser-based side of the application.
 * First, all event handlers are registered, and then the initial items are loaded
 * from the server and rendered on the page. All of this work is delegated to
 * individual small focused modules.
 */
(function() {
    groceries.event.registerAddItemHandler()
    groceries.event.registerCompletedItemHandler()
    groceries.event.registerDeleteAndEditItemHandlers()
    groceries.event.registerUpdateItemHandler()
    groceries.event.setupUndoDelete()
    groceries.ui.loadInitialItems()
}())
