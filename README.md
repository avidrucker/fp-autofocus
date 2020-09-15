# fp-autofocus

A (mostly) functional programming style to-do list management system codebase. This code can be used as-is in the terminal as a command line app, or as the business logic to drive a different front-end, such as a web app.

## in-progress

- [x] Rebuild prior command line app functionality
- [ ] Migrate new app data level & utility functions from PWA app WIP back to fp-autofocus "core"
- [ ] Enable "showing X of Y items" when printing list with hidden/archived items `stringifyShowingXofY(x)(y)`
- [ ] Refactor code base to remove "place oriented programming" (ie. remove archive, replace w/ boolean flags)
- [ ] Implement export all items to CSV `serializeToCSV(appData)`
