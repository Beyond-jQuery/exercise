# You don't need jQuery (for your grocery list)

A comprehensive web exercise/application for ["Beyond jQuery"][amazon] readers that covers many of the concepts discussed in the book.


## What is this and how does it work?

The goal of this exercise is to take a number of concepts and native 
JavaScript/Web API items discussed in the book and demonstrate them in an easy
to understand and purposeful way. This simple grocery list application is meant
to be just that - simple. Simple enough to effectively illustrate a portion 
of what I covered in the book. Simple enough to be easily understandable. Simple
enough for you to extend and take even further.

This is a full-stack JavaScript web application, which means that the server has _also_
been creating with JavaScript (Node.js). While the focus of this exercise is primarily 
on the browser-side, you may also take note of the server-side code, which is quite 
simple itself. The only dependencies on the client/browser side are two polyfills - 
one for the Fetch API, and another for the ES6 Promise object. On the server, we are
using Express to handle HTTP request routing, and bodyParser to parse the JSON
requests sent by our client. This is also a Single Page Application (SPA), which means
that, after the initial page load, only the relevant portions of the page are updated
as needed, and all communication with the server occurs via ajax requests.

When the page loads, all existing grocery items are loaded from the server using
an ajax GET request. These items are then rendered on the page. Once the page fully
loads, you are able to add a new grocery item (which is persisted to the server),
edit the name of an existing item. After retriving an item from the store, 
you may find it useful to mark the item as completed, which is possible via a checkbox
next to each item. Like all other update actions, the status of a completed item is also
persisted to the server via a PATCH request. Finally, an existing item can be 
deleted entirely. When the trashcan button is triggered next to a grocery item, 
the associated item is marked as "archived" via a PATCH request. Archived items 
still exist on the server, and are also returned to the client when a GET request 
is sent, but they are not visible in the UI. After the button is clicked, a box 
slides down from the top of the page, allowing the user to "undo" this action, 
which will remove the "archived" status on the associated list item. If the 
undo box is manually dismissed, or if the 10 second timer expires, a DELETE request is
sent to the server to permenantly delete the list item.


## Browser support

All "modern" browsers are supported. The book defines modern browsers as IE9, IE10,
IE11, Microsoft Edge, Chrome, Firefox, Safari (for OS X), Opera, iOS Safari, and
Chrome for Android.


## Book items and concepts demonstrated here

* JavaScript shims and polyfills (chapter 2)
* Node.js (chapter 3)
* Locating elements using various CSS selectors (chapter 4)
* Element properties (chapter 5)
* Creating, removing, and updating element attributes (chapter 5)
* DOM data storage (chapter 6)
* Accessibility (chapter 7)
* Dynamically hiding and showing elements (chapter 7)
* Styling elements (chapter 7)
* DOM manipulation (chapter 8)
* Fetch API (chapter 9)
* Sending and monitoring ajax DELETE, GET, PATCH, and POST requests (chapter 9)
* Controlling browser events (chapter 10)
* Registering and unregistering browser event listeners (chapter 10)
* Triggering browser events (chapter 10)
* Promises (chapter 11)
* Context (chapter 12)
* String manipulation (chapter 12)
* Working with arrays, objects, and functions (chapter 12)
* Separation of concerns, small focused modules, minimal dependencies (chapter 13)
* BONUS: Web animation without jQuery (see the [CSS transition][css-transition-example] for the undo box fade in/out)

**The source code is heavily commented.** Please take a look at the code and its comments for more details.

## Installing & running the app

The server-side portion of our grocery list app requires Node.js, specifically version 5.
Before you go any further, please be sure you have Node v5 installed on your machine. You can
determine the current version of Node by typing `node -v` in a terminal session. If you don't
have Node installed at all, or if you have the wrong version, consider using [nvm] to install
and manager version of Node going forward.

You will also need to have a git client installed on your machine. The instructions for installing
git vary depending on your operating system of choice. A good set of instructions that walk you through
installing and setting up git can be found on the [GitHub documentation site][github-git].

One you have Node and git properly installed, follow these steps to **setup the application**:

1. Pull down the git repository: `git clone https://github.com/Beyond-jQuery/exercise.git`.
2. Switch to the cloned repository directory.
3. Install all server-side dependencies and client-side polyfills: `npm install`.

And then, you can **start the application** simply by running `npm start`. This will start
the Node.js server, and the entire application will be accessible at http://localhost:3000.
Feel free to play around with the list after starting the app. Grocery items are only persisted 
to memory, so the list will be reset when the server is restarted.


## Asking questions & contributing

If you have any questions at all, if you find a bug, or if you would like to discuss ideas for
making this demo application even better, please open up an [issue][issue-tracker], or a [pull request][pull-requests].
If you do open up a pull request with an improvement or new feature, please do so against the 
["contributions" branch][contributions-branch]. I would prefer to keep the master branch as-is, but if you
find any errors at all in the master branch, feel free to open a pull request master instead.

If you are interesting in writing some code and practicing what you have learned in "Beyond jQuery", 
here are some ways that you can potentially enhance our simple grocery list:

- Write unit tests.
- Use even more modern JavaScript syntax with the help of a build-time code compiler.
- Replace the shared global variable with ES6 modules.
- Allow the grocery list to be persisted to and loaded from disk server-side.
- Support for a collection of grocery lists.

These suggestions are just a small subset of the possibilities. 

[amazon]: https://amzn.com/1484222342
[contributions-branch]: https://github.com/Beyond-jQuery/exercise/tree/contributions
[css-transition-example]: https://github.com/Beyond-jQuery/exercise/blob/1.0.0/client/styles.css#L168
[github-git]: https://help.github.com/articles/set-up-git/
[issue-tracker]: https://github.com/Beyond-jQuery/exercise/issues
[nvm]: https://github.com/creationix/nvm
[pull-requests]: https://github.com/Beyond-jQuery/exercise/pulls
