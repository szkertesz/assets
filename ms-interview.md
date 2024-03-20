## Scripts: async, defer

### defer

`<script>`'s with `defer`...

- are _not blocking_ (never blocks the HTML parsing & DOM building of the page) -- browsers scan the page for scripts and download them in parallel
- always execute when the DOM is ready (but before `DOMContentLoaded` event).
  (`DOMContentLoaded` event handler waits for the deferred script to download and execute)
- keep their relative order, just like regular scripts
- The defer attribute is only for external scripts - it is ignored if the `<script>` tag has no src


### async

`<script>`'s with `async` are completely independent:

- they are _non-blocking_
- async scripts load in the background and run when ready:
  - `DOMContentLoaded` and async` scripts don’t wait for each other
  - other scripts don’t wait for `async` scripts, and `async` scripts don’t wait for others
- The `async` attribute is only for external scripts - it is ignored if the `<script>` tag has no src


## What is the difference between span and div?

The difference is that span gives the output with `display: inline` and div gives the output with `display: block`.

## What is `srcset` of images?
