/**
 *  The "store" module is concerned with storing, retriving, and updating the list of
 *  grocery items that backs the UI.
 */
(function(groceries) {
    var items = []

    // This defines the public API. All variables above are private/internal.
    groceries.store = {
        addItem: function(item) {
            items.push(item)
        },

        // Given an item's server-assigned ID, lookup the item in the store & return it.
        getItemById: function(id) {
            return groceries.util.findInArray(items, function(item) {
                return item.id === id
            })
        },

        // This stores all of the grocery item objects.
        items: [],

        removeItemFromList: function(id) {
            var itemIndex = groceries.util.findIndexInArray(items, function(item) {
                return item.id === id
            })

            items.splice(itemIndex, 1)
        },

        replaceItemInList: function(newItem) {
            var itemIndex = groceries.util.findIndexInArray(items, function(item) {
                return item.id === newItem.id
            })

            if (itemIndex >= 0) {
                items.splice(itemIndex, 1, newItem)
            }
        }
    }
}(groceries || {}))
