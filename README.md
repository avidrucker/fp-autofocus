# fp-autofocus

A (mostly) functional programming style to-do list management system codebase. This code can be used as-is in the terminal as a command line app, or as the business logic to drive a different front-end, such as a web app.

## in-progress
(scatch pad issues, to-do's, etc.)

- [x] Rebuild prior command line app functionality
- [ ] Migrate new app data level & utility functions from PWA app WIP back to fp-autofocus "core"
- [x] Enable "showing X of Y items" when printing list with hidden/archived items `stringifyShowingXofY(x)(y)`
- [x] Refactor code base to remove "place oriented programming" (ie. remove archive, replace w/ boolean flags)
- [x] Implement export all items to CSV `serializeToCSV(appData)`
- [ ] Export command line app to "autofocus-cla" repo which uses "fp-autofocus" core as dependency
- [x] Reimplement (re-enable) unit, integration, e2e tests
- [x] Create `dist/` folder to keep `src/` and `tests/` clean & simple to work with
- [ ] Upgrade `console.ts` CLA usage of algorithm to reflect updated understanding of "auto-mark"
- [x] Resolve bug where hidden items are (incorrectly) still rendered under "AUTOFOCUS LIST" heading
- [x] Add "about section" text creator to `index.ts` to render in either `console.ts` or PWA
- [ ] (optional) Experiment with word wrap to improve readability on CLA for about section