import { createCoreBridge } from "../core/project-navigator-core-bridge.js";
import { loadMockProjectData } from "../mock/mock-project-data-adapter.js";
import { getMappedProjectDataset } from "../data/mpp-dataset.js";
import {
  isOfficeProjectAvailable,
  readSelectedOfficeTaskSnapshot,
  subscribeToOfficeTaskSelectionChange
} from "../office/project-adapter.js";
import { renderTaskDetailsMessage, renderTaskVisualization } from "./web-visualization-ui.js";

function createTaskShellMarkup(root) {
  root.innerHTML = `
    <section class="taskpane-visualization-shell" aria-label="Project Navigator visualization">
      <div class="search-panel visualization-only-panel">
        <div class="search-controls-group">
          <div class="search-field">
            <label for="dependency-level-select">Dependency level</label>
            <select id="dependency-level-select" name="dependency-level-select">
              <option value="level-1">Level 1</option>
              <option value="level-2">Level 2</option>
            </select>
          </div>
          <div class="search-field">
            <label for="task-extra-field-1">Extra field 1</label>
            <select id="task-extra-field-1" name="task-extra-field-1"></select>
          </div>
          <div class="search-field">
            <label for="task-extra-field-2">Extra field 2</label>
            <select id="task-extra-field-2" name="task-extra-field-2"></select>
          </div>
        </div>
        <p id="taskpane-status" class="taskpane-status" aria-live="polite"></p>
      </div>
      <div id="task-details" class="task-details-centered"></div>
    </section>
  `;
}

function getStatusElement(root) {
  return root.querySelector("#taskpane-status");
}

function setStatus(root, message) {
  const statusElement = getStatusElement(root);

  if (statusElement) {
    statusElement.textContent = message;
  }
}

function createMockVisualizationData(taskId, dependencyLevel, bridge) {
  const mockProjectData = loadMockProjectData();
  const helpers = bridge.helpers;
  const normalizedTasks = helpers.normalizeTasks(mockProjectData.tasks);
  const selectedTask =
    helpers.findTaskById(normalizedTasks, String(taskId)) ??
    helpers.findTaskById(normalizedTasks, String(mockProjectData.selectedTaskId));

  if (!selectedTask) {
    return null;
  }

  return {
    task: selectedTask,
    predecessors: helpers.getDirectPredecessorRelations(selectedTask.id, normalizedTasks, mockProjectData.dependencyLinks),
    successors: helpers.getDirectSuccessorRelations(selectedTask.id, normalizedTasks, mockProjectData.dependencyLinks),
    secondPredecessors:
      dependencyLevel === 2
        ? helpers.getSecondPredecessorRelations(selectedTask.id, normalizedTasks, mockProjectData.dependencyLinks)
        : [],
    secondSuccessors:
      dependencyLevel === 2
        ? helpers.getSecondSuccessorRelations(selectedTask.id, normalizedTasks, mockProjectData.dependencyLinks)
        : [],
    activeConstraintTaskIds: helpers.getActiveStartConstraintTaskIds(
      selectedTask.id,
      normalizedTasks,
      mockProjectData.dependencyLinks
    ),
    constrainedSuccessorTaskIds: helpers.getConstrainedSuccessorTaskIds(
      selectedTask.id,
      normalizedTasks,
      mockProjectData.dependencyLinks
    ),
    secondLevelActiveConstraintTaskIds:
      dependencyLevel === 2
        ? helpers.getSecondLevelActivePredecessorTaskIds(
            selectedTask.id,
            normalizedTasks,
            mockProjectData.dependencyLinks
          )
        : [],
    secondLevelConstrainedSuccessorTaskIds:
      dependencyLevel === 2
        ? helpers.getSecondLevelConstrainedSuccessorTaskIds(
            selectedTask.id,
            normalizedTasks,
            mockProjectData.dependencyLinks
          )
        : []
  };
}

function createMappedVisualizationData(taskId, dependencyLevel, bridge, dataset) {
  const helpers = bridge.helpers;
  const normalizedTasks = helpers.normalizeTasks(dataset.tasks);
  const normalizedTask = helpers.findTaskById(normalizedTasks, String(taskId));
  const rawTask = dataset.tasksById.get(String(taskId));

  if (!normalizedTask || !rawTask) {
    return null;
  }

  const selectedTask = {
    ...normalizedTask,
    ...rawTask
  };

  return {
    task: selectedTask,
    predecessors: helpers.getDirectPredecessorRelations(normalizedTask.id, normalizedTasks, dataset.dependencyLinks),
    successors: helpers.getDirectSuccessorRelations(normalizedTask.id, normalizedTasks, dataset.dependencyLinks),
    secondPredecessors:
      dependencyLevel === 2
        ? helpers.getSecondPredecessorRelations(normalizedTask.id, normalizedTasks, dataset.dependencyLinks)
        : [],
    secondSuccessors:
      dependencyLevel === 2
        ? helpers.getSecondSuccessorRelations(normalizedTask.id, normalizedTasks, dataset.dependencyLinks)
        : [],
    activeConstraintTaskIds: helpers.getActiveStartConstraintTaskIds(
      normalizedTask.id,
      normalizedTasks,
      dataset.dependencyLinks
    ),
    constrainedSuccessorTaskIds: helpers.getConstrainedSuccessorTaskIds(
      normalizedTask.id,
      normalizedTasks,
      dataset.dependencyLinks
    ),
    secondLevelActiveConstraintTaskIds:
      dependencyLevel === 2
        ? helpers.getSecondLevelActivePredecessorTaskIds(
            normalizedTask.id,
            normalizedTasks,
            dataset.dependencyLinks
          )
        : [],
    secondLevelConstrainedSuccessorTaskIds:
      dependencyLevel === 2
        ? helpers.getSecondLevelConstrainedSuccessorTaskIds(
            normalizedTask.id,
            normalizedTasks,
            dataset.dependencyLinks
          )
        : []
  };
}

function resolveDatasetTaskId(snapshot, dataset) {
  if (!snapshot?.task) {
    return "";
  }

  const idCandidate = String(snapshot.task.id ?? "").trim();

  if (idCandidate && dataset.tasksById.has(idCandidate)) {
    return idCandidate;
  }

  const uniqueIdCandidate = String(snapshot.task.uniqueId ?? "").trim();

  if (uniqueIdCandidate && dataset.tasksByUniqueId.has(uniqueIdCandidate)) {
    return String(dataset.tasksByUniqueId.get(uniqueIdCandidate).id);
  }

  return "";
}

function formatFieldLabel(fieldName) {
  return String(fieldName ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .trim();
}

function populateExtraFieldSelect(selectElement, fieldNames) {
  if (!selectElement) {
    return;
  }

  selectElement.innerHTML = "";

  const emptyOption = document.createElement("option");
  emptyOption.value = "";
  emptyOption.textContent = "None";
  selectElement.append(emptyOption);

  fieldNames.forEach((fieldName) => {
    const option = document.createElement("option");
    option.value = fieldName;
    option.textContent = formatFieldLabel(fieldName);
    selectElement.append(option);
  });
}

function buildSelectedExtraFields(task, selectedFieldNames) {
  if (!task?.mappedFields || !Array.isArray(selectedFieldNames)) {
    return [];
  }

  return selectedFieldNames
    .filter(Boolean)
    .map((fieldName) => ({
      label: formatFieldLabel(fieldName),
      value: task.mappedFields[fieldName] ?? ""
    }))
    .filter((field) => field.value !== "");
}

export function bootstrapTaskPane() {
  const root = document.getElementById("project-navigator-root");
  const bridge = createCoreBridge();

  if (!root) {
    return {
      bridge,
      status: "missing-root"
    };
  }

  createTaskShellMarkup(root);

  const mappedDataset = getMappedProjectDataset();
  const state = {
    bridge,
    dependencyLevel: 1,
    displayedTaskId: "",
    environment: isOfficeProjectAvailable() ? "office" : "mock",
    mappedDataset,
    selectedExtraFieldNames: ["", ""]
  };

  const dependencyLevelSelect = root.querySelector("#dependency-level-select");
  const extraFieldSelect1 = root.querySelector("#task-extra-field-1");
  const extraFieldSelect2 = root.querySelector("#task-extra-field-2");
  const taskDetails = root.querySelector("#task-details");

  populateExtraFieldSelect(extraFieldSelect1, mappedDataset.selectedTaskPropertyFields);
  populateExtraFieldSelect(extraFieldSelect2, mappedDataset.selectedTaskPropertyFields);

  const renderVisualization = (taskId, sourceLabel) => {
    const resolvedTaskId = String(taskId ?? "").trim();

    if (!resolvedTaskId) {
      renderTaskDetailsMessage("Select a task in Microsoft Project.");
      setStatus(root, "Waiting for a task selection in Microsoft Project.");
      return;
    }

    const visualizationData =
      state.environment === "office"
        ? createMappedVisualizationData(resolvedTaskId, state.dependencyLevel, state.bridge, state.mappedDataset)
        : createMockVisualizationData(resolvedTaskId, state.dependencyLevel, state.bridge);

    if (!visualizationData?.task) {
      renderTaskDetailsMessage("The selected task is not present in the mapped dataset.");
      setStatus(root, "The selected task is not present in the mapped dataset.");
      return;
    }

    state.displayedTaskId = String(visualizationData.task.id);
    renderTaskVisualization(
      visualizationData.task,
      visualizationData.secondPredecessors,
      visualizationData.predecessors,
      visualizationData.successors,
      visualizationData.secondSuccessors,
      visualizationData.activeConstraintTaskIds,
      visualizationData.constrainedSuccessorTaskIds,
      visualizationData.secondLevelActiveConstraintTaskIds,
      visualizationData.secondLevelConstrainedSuccessorTaskIds,
      buildSelectedExtraFields(visualizationData.task, state.selectedExtraFieldNames)
    );
    setStatus(root, `Showing task ${visualizationData.task.id} from ${sourceLabel}.`);
  };

  dependencyLevelSelect?.addEventListener("change", (event) => {
    state.dependencyLevel = event.target.value === "level-2" ? 2 : 1;
    renderVisualization(state.displayedTaskId, "dependency level");
  });

  extraFieldSelect1?.addEventListener("change", (event) => {
    state.selectedExtraFieldNames[0] = String(event.target.value ?? "");
    renderVisualization(state.displayedTaskId, "extra field selection");
  });

  extraFieldSelect2?.addEventListener("change", (event) => {
    state.selectedExtraFieldNames[1] = String(event.target.value ?? "");
    renderVisualization(state.displayedTaskId, "extra field selection");
  });

  taskDetails?.addEventListener("click", (event) => {
    const dependencyCard = event.target.closest(".dependency-card-button[data-task-id]");

    if (!dependencyCard) {
      return;
    }

    renderVisualization(dependencyCard.dataset.taskId || "", "task navigation");
  });

  taskDetails?.addEventListener("keydown", (event) => {
    const dependencyCard = event.target.closest(".dependency-card-button[data-task-id]");

    if (!dependencyCard || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    renderVisualization(dependencyCard.dataset.taskId || "", "task navigation");
  });

  const initializeOfficeMode = async () => {
    const selectedSnapshot = await readSelectedOfficeTaskSnapshot();
    const resolvedDatasetTaskId = resolveDatasetTaskId(selectedSnapshot, state.mappedDataset);

    if (!resolvedDatasetTaskId) {
      renderTaskDetailsMessage("Select a task that exists in the mapped MPP dataset.");
      setStatus(root, "Waiting for a task selection that exists in the mapped MPP dataset.");
    } else {
      renderVisualization(resolvedDatasetTaskId, "MS Project selection");
    }

    await subscribeToOfficeTaskSelectionChange(async () => {
      const snapshot = await readSelectedOfficeTaskSnapshot({ useCache: false });
      const nextTaskId = resolveDatasetTaskId(snapshot, state.mappedDataset);

      if (!nextTaskId) {
        renderTaskDetailsMessage("Select a task that exists in the mapped MPP dataset.");
        setStatus(root, "Waiting for a task selection that exists in the mapped MPP dataset.");
        return;
      }

      renderVisualization(nextTaskId, "MS Project selection");
    });
  };

  const initializeMockMode = () => {
    const mockProjectData = loadMockProjectData();
    renderVisualization(mockProjectData.selectedTaskId, "mock data");
  };

  if (state.environment === "office") {
    initializeOfficeMode();
  } else {
    initializeMockMode();
  }

  return {
    bridge,
    status: state.environment === "office" ? "connected-to-mapped-dataset" : "mock-mode",
    state
  };
}
