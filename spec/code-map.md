# Add-in Code Map

## Intended purpose

This folder is the future host for a Yeoman-generated MS Project task pane add-in.

It is not the place for shared business logic. Shared planning logic should continue to live in `../project-navigator-core`.

## Reusable logic intended from `project-navigator-core`

The add-in is expected to reuse these core modules later:

- `../project-navigator-core/src/model/tasks.js`
  - task model normalization
- `../project-navigator-core/src/search/task-search.js`
  - task lookup by ID, Unique ID, and partial name
- `../project-navigator-core/src/graph/dependencies.js`
  - predecessor/successor traversal
  - second-level traversal
  - active constraint detection
  - relation labeling
- `../project-navigator-core/src/source/normalize-planning-data.js`
  - source-independent task and dependency normalization
- `../project-navigator-core/src/index.js`
  - consolidated public entry point

## Standalone UI behaviors that map to the future task pane

The add-in task pane is inspired mainly by the standalone right panel, especially from:

- `../project-navigator/js/ui.js`
  - empty-selection message
  - selected task card
  - task-details message rendering
  - filtered task list rendering
  - dependency visualization rendering
  - dependency-card click navigation
  - level-1 and level-2 dependency display
- `../project-navigator/js/app.js`
  - selected-task orchestration
  - dependency-level switching
  - search-result handling that feeds the right panel

## Prepared placeholder areas

- `src/taskpane/taskpane-shell.js`
  - describes intended right-panel states
- `src/taskpane/taskpane-view-model.js`
  - lists supported interactions and view states
- `src/taskpane/taskpane-bootstrap.js`
  - future Project Navigator task-pane entry
- `src/office/project-adapter.js`
  - future Office.js adapter around MS Project data
- `src/core/project-navigator-core-bridge.js`
  - explicit bridge to `project-navigator-core`
- `src/mock/mock-project-data-adapter.js`
  - mock source placeholder for local task-pane checks
- `src/integration-notes.js`
  - cross-project contract reminders

## Current Yeoman status

The folder already contains a partial generated scaffold:

- `Project Navigator Add-in/manifest.project.xml`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/package.json`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/webpack.config.js`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/src/taskpane/taskpane.html`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/src/taskpane/taskpane.js`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/src/taskpane/taskpane.css`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/src/commands/commands.html`
- `Project Navigator Add-in/Office-Addin-TaskPane-JS-release/src/commands/commands.js`

The generation failed during the final `convert-to-single-host` step because the script looked for `package.json` at the parent generated folder level instead of inside the nested release folder.

## What should later come from the generated scaffold

- the Office add-in manifest
- package and build tooling
- Office initialization lifecycle
- the task pane host page
- the task pane webpack entry file
- the commands surface wiring

## What must later be adapted to Office.js

- reading tasks and dependency links from MS Project
- reading the selected task context from the host
- reacting to host selection changes
- any future write-back actions

## What remains specific to the standalone web app

- file input selection and accepted file types
- browser parsing entry flow
- standalone left task list and split layout
- resizable panels and table columns
- current standalone page shell and CSS
