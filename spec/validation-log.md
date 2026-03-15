# Validation Log

## Step
Initial add-in preparation scaffold created

- Date: 2026-03-15
- Status: validated
- Notes: `src/taskpane`, `src/office`, `src/core`, `src/mock`, `README.md`, `spec/code-map.md`, and `spec/rules.md` were created to prepare the add-in workspace.

## Step
Partial Yeoman scaffold analyzed

- Date: 2026-03-15
- Status: validated
- Notes: the useful generated scaffold was identified in `Project Navigator Add-in/Office-Addin-TaskPane-JS-release`, with the manifest at `Project Navigator Add-in/manifest.project.xml`.

## Step
Workspace reorganized for standalone work inside `project-navigator-addin`

- Date: 2026-03-15
- Status: validated
- Notes: roadmap, next step, backlog, task breakdown, function list, and validation log were consolidated into `spec/`.

## Step
Useful Yeoman scaffold promoted into the add-in root

- Date: 2026-03-15
- Status: validated
- Notes: `package.json`, `webpack.config.js`, `manifest.project.xml`, `src/taskpane/taskpane.html`, `src/taskpane/taskpane.js`, `src/taskpane/taskpane.css`, `src/commands/commands.html`, and `src/commands/commands.js` were promoted into the final `project-navigator-addin` root without modifying `src/office`, `src/core`, or `src/mock`.

## Step
Task pane webpack entry wired to the Project Navigator bootstrap

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. `src/taskpane/taskpane.js` imports `bootstrapTaskPane` from `src/taskpane/taskpane-bootstrap.js`, executes it, and the multi-host imports were removed from the generated task pane entry.

## Step
Contoso sample content removed from the task pane host page

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. `src/taskpane/taskpane.html` no longer contains the Contoso welcome screen and now exposes a neutral `#project-navigator-root` container while keeping `office.js` and `taskpane.css`.

## Step
Task pane CSS replaced with a Project Navigator visual base

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. `src/taskpane/taskpane.css` no longer contains the Contoso welcome styles. It now defines Project Navigator colors, typography, background treatment, and root layout styling for `#project-navigator-root`.

## Step
Bootstrap renders a minimal Project Navigator shell

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. `bootstrapTaskPane()` renders a minimal Project Navigator shell into `#project-navigator-root` and still returns the `shell` and `viewModel` objects for the upcoming task pane states.

## Step
Task pane shell handles the empty-selection state

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. `createTaskPaneShell()` now declares an explicit `empty-selection` status and copy, and `bootstrapTaskPane()` renders a dedicated empty-state block when no task is selected.

## Step
Task pane shell handles the main Project Navigator states in a unified step

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The backlog state items were consolidated into one step. The shell now exposes visible representations for empty selection, information or error, selected task, filtered task list, and dependency views level 1 and level 2.

## Step
Data adapters cover mock testing and normalized Project reads in one unified step

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The backlog adapter items were consolidated into one step. `src/mock/mock-project-data-adapter.js` now provides reusable mock tasks, dependencies, and selection data, while `src/office/project-adapter.js` normalizes selection, tasks, and dependency links into shapes aligned with the core contract.

## Step
Core bridge imports real helpers from project-navigator-core

- Date: 2026-03-15
- Status: validated
- Notes: visual and structural verification completed. `src/core/project-navigator-core-bridge.js` imports the real helpers from the neighboring `project-navigator-core/src/index.js`, exposes them through `createCoreBridge()`, and keeps fallback behavior for missing helper exports.

## Step
Task pane search uses the core bridge for ID and name lookups

- Date: 2026-03-15
- Status: validated
- Notes: structural verification completed. The task pane normalizes mock tasks through the core bridge and renders search results produced by `findTaskById` and `findTasksByPartialName`.

## Step
Task pane computes direct predecessor and successor relations through the core bridge

- Date: 2026-03-15
- Status: validated
- Notes: user validation received after a functional verification on mock data. The task pane uses the core helpers for direct predecessor and successor relations and renders the resulting relation labels from mock dependencies.

## Step
Task pane computes second-level predecessor and successor relations through the core bridge

- Date: 2026-03-15
- Status: validated
- Notes: functional verification completed on mock data. The task pane uses the core helpers for second-level predecessor and successor relations and returns the expected second-level relations for task `57`.

## Step
Task pane highlights active constraints through the core bridge

- Date: 2026-03-15
- Status: validated
- Notes: functional verification completed on mock data. The task pane uses the core helpers for active predecessor constraints, constrained successors, and their level-2 equivalents, then returns the expected task ids for task `57`.

## Step
Project manifest now uses coherent Project Navigator identity and development URLs

- Date: 2026-03-15
- Status: validated
- Notes: structural verification completed. `manifest.project.xml` no longer uses the Contoso identity, points to the local development host, and `package.json` now targets `manifest.project.xml` for start, stop, and validate commands.

## Step
Local add-in build succeeds

- Date: 2026-03-15
- Status: validated
- Notes: local dependencies were installed, the missing root `assets/` folder was restored from the Yeoman snapshot, and `npm run build:dev` completed successfully with emitted task pane, commands, icons, and `manifest.project.xml`.

## Step
Local Office development server starts the task pane assets

- Date: 2026-03-15
- Status: validated
- Notes: controlled startup completed. `npm run dev-server` trusted the local certificate, compiled successfully, and served the workspace on `https://localhost:3000/` with `taskpane.html`, `commands.html`, and `manifest.project.xml`.

## Step
Task pane loads in MS Project

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The add-in appears in Project, opens from the shared catalog, and the task pane loads without a blocking runtime error.

## Step
Task pane shows a minimal functional state in MS Project

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The Project Navigator shell is visible inside MS Project with the current minimal layout and content.

## Step
Task pane reacts to task selection changes in MS Project

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The selected-task card changes when the selection changes in MS Project, and the live Project task ID is now read correctly.

## Step
Task pane UI reproduces the main visual structure of project-navigator

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The task pane now keeps only the visualization-oriented controls and reproduces the intended Project Navigator visual structure inside MS Project.

## Step
Task pane reuses the working project-navigator visualization logic

- Date: 2026-03-15
- Status: validated
- Notes: user validation received with a residual latency note. The task pane now uses the working visualization approach from the web app, relies on the mapped MPP dataset for dependency rendering, keeps zoom and card-click navigation, and behaves correctly functionally in MS Project.

## Step
Two mapped extra fields can be selected and displayed on the central task card

- Date: 2026-03-15
- Status: implemented-awaiting-user-validation
- Notes: the task pane now exposes two additional field selectors populated from the mapped dataset field catalog and renders the selected field values as extra rows in the central task card.

## Step
Publisher name updated to Mass Consultants

- Date: 2026-03-15
- Status: validated
- Notes: user validation received. The add-in publisher shown from the manifest is now `Mass Consultants`.
