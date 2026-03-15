import { createCoreBridge } from "../core/project-navigator-core-bridge.js";

// Host-neutral composition shape for the future task pane.
// This is intentionally small: it describes what the task pane needs without implementing Office behavior.
export function createTaskPaneViewModel() {
  return {
    bridge: createCoreBridge(),
    states: [
      "empty-selection-message",
      "selected-task-card",
      "filtered-task-list",
      "dependency-visualization-level-1",
      "dependency-visualization-level-2"
    ],
    interactions: [
      "select-task",
      "click-dependency-card",
      "change-dependency-level",
      "show-task-not-found-message"
    ]
  };
}
