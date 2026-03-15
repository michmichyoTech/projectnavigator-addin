// Mock adapter reserved for local task-pane UI checks before Office.js wiring exists.
// It must stay separate from the future Office adapter so host-specific code does not leak.

const mockTasks = [
  {
    id: "21",
    uniqueId: "TASK-21",
    wbs: "1.1.1",
    name: "Cadrer le besoin du task pane",
    summary: false,
    startDate: "2026-03-17",
    endDate: "2026-03-18"
  },
  {
    id: "42",
    uniqueId: "TASK-42",
    wbs: "1.2.1",
    name: "Valider le prototype du task pane",
    summary: false,
    startDate: "2026-03-20",
    endDate: "2026-03-22"
  },
  {
    id: "57",
    uniqueId: "TASK-57",
    wbs: "1.2.2",
    name: "Documenter le cycle de validation",
    summary: false,
    startDate: "2026-03-23",
    endDate: "2026-03-24"
  },
  {
    id: "63",
    uniqueId: "TASK-63",
    wbs: "1.3.1",
    name: "Preparer le plan de diffusion",
    summary: false,
    startDate: "2026-03-25",
    endDate: "2026-03-28"
  },
  {
    id: "88",
    uniqueId: "TASK-88",
    wbs: "1.4.1",
    name: "Valider la publication de l add-in",
    summary: false,
    startDate: "2026-03-29",
    endDate: "2026-03-31"
  }
];

const mockDependencyLinks = [
  {
    predecessorId: "21",
    successorId: "42",
    type: "FS",
    lag: 0,
    lagFormat: "d"
  },
  {
    predecessorId: "42",
    successorId: "57",
    type: "FS",
    lag: 0,
    lagFormat: "d"
  },
  {
    predecessorId: "57",
    successorId: "63",
    type: "FS",
    lag: 1,
    lagFormat: "d"
  },
  {
    predecessorId: "63",
    successorId: "88",
    type: "FS",
    lag: 0,
    lagFormat: "d"
  }
];

const mockSelection = {
  taskId: "42",
  taskUniqueId: "TASK-42",
  source: "mock"
};

export function loadMockProjectData() {
  return {
    tasks: mockTasks.map((task) => ({ ...task })),
    dependencyLinks: mockDependencyLinks.map((link) => ({ ...link })),
    selectedTaskId: mockSelection.taskId,
    selection: { ...mockSelection }
  };
}
