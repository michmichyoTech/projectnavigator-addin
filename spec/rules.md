# Add-in Rules

## Current constraints

- This folder is the working area for the future add-in.
- Do not add Office.js calls outside `src/office`.
- Do not duplicate business logic that already exists in `../project-navigator-core`.
- Do not move or rewrite the current standalone app in place.
- Do not implement parser or API work in this folder.

## Separation of concerns

- `src/taskpane`
  - task pane composition and UI orchestration
- `src/office`
  - Office.js and MS Project host integration only
- `src/core`
  - bridge contract describing how the add-in consumes `project-navigator-core`
- `src/mock`
  - safe non-Office mock adapter placeholders
- `project-navigator-core`
  - reusable business logic and normalization

## Reuse rules

- Reuse business logic from `project-navigator-core` rather than recopying it.
- Treat the standalone app as the visual reference for the future right pane, not as a file source to mirror wholesale.
- Keep task-pane rendering host-specific, but keep planning logic in the core.

## Yeoman rules

- Do not rerun `npx yo office` while the partial scaffold recovery path remains the preferred route.
- Treat `Project Navigator Add-in/Office-Addin-TaskPane-JS-release` as a generated source snapshot until promotion is complete.
- Promote only the files that are needed for the final add-in root.

## Expected future Office dependencies

- reading tasks and predecessor links from Project
- mapping host identifiers to core `id` and `uniqueId`
- reading selection changes and refreshing the task pane
- optional write-back operations later

## Safe next step

- promote the useful files from the already generated partial Yeoman scaffold into the final root, then connect the future `src/taskpane/taskpane.js` entry file to `src/taskpane/taskpane-bootstrap.js`
