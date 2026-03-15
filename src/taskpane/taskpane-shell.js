// Placeholder task pane composition root for the future MS Project add-in.
// This file is intentionally host-light and does not reference Office.js yet.

export function createTaskPaneShell() {
  return {
    name: "project-navigator-taskpane",
    status: "placeholder",
    rightPanelStates: [
      "empty-selection",
      "task-details-message",
      "task-details-table-view",
      "task-details-mindmap-view"
    ],
    consumes: [
      "project-navigator-core/src/model/tasks.js",
      "project-navigator-core/src/search/task-search.js",
      "project-navigator-core/src/graph/dependencies.js",
      "project-navigator-core/src/source/normalize-planning-data.js"
    ]
  };
}
