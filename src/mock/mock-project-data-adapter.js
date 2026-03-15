// Mock adapter reserved for local task-pane UI checks before Office.js wiring exists.
// It must stay separate from the future Office adapter so host-specific code does not leak.

export function loadMockProjectData() {
  return {
    tasks: [],
    dependencyLinks: [],
    selectedTaskId: ""
  };
}
