// Placeholder Office adapter boundary.
// Future Office.js code should stay here and translate host data into the shared core shape.
import { selectedTaskPropertyFields } from "./task-field-selection.js";

function readRawField(rawTask, fieldName) {
  try {
    const value = rawTask?.[fieldName];
    if (value === undefined || value === null) {
      return "";
    }

    return value;
  } catch {
    return "";
  }
}

function normalizeMappedFieldValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function normalizeTask(rawTask = {}) {
  return {
    id: String(rawTask.id ?? rawTask.taskId ?? ""),
    uniqueId: String(rawTask.uniqueId ?? rawTask.guid ?? rawTask.id ?? ""),
    wbs: String(rawTask.wbs ?? rawTask.outlineNumber ?? ""),
    name: String(rawTask.name ?? rawTask.taskName ?? ""),
    summary: Boolean(rawTask.summary ?? rawTask.isSummary ?? false),
    duration: String(rawTask.duration ?? rawTask.Duration ?? ""),
    predecessors: String(rawTask.predecessors ?? rawTask.Predecessors ?? ""),
    successors: String(rawTask.successors ?? rawTask.Successors ?? ""),
    startDate: String(rawTask.startDate ?? rawTask.start ?? ""),
    endDate: String(rawTask.endDate ?? rawTask.finish ?? "")
  };
}

export function mapSelectedTaskFields(rawTask = {}, fieldNames = selectedTaskPropertyFields) {
  return fieldNames.reduce((mappedFields, fieldName) => {
    mappedFields[fieldName] = normalizeMappedFieldValue(readRawField(rawTask, fieldName));
    return mappedFields;
  }, {});
}

export function normalizeTaskWithSelectedFields(rawTask = {}, fieldNames = selectedTaskPropertyFields) {
  return {
    ...normalizeTask(rawTask),
    mappedFields: mapSelectedTaskFields(rawTask, fieldNames)
  };
}

function normalizeDependency(rawDependency = {}) {
  return {
    predecessorId: String(rawDependency.predecessorId ?? rawDependency.from ?? ""),
    successorId: String(rawDependency.successorId ?? rawDependency.to ?? ""),
    type: String(rawDependency.type ?? rawDependency.linkType ?? "FS"),
    lag: Number(rawDependency.lag ?? 0),
    lagFormat: String(rawDependency.lagFormat ?? rawDependency.lagUnit ?? "d")
  };
}

function normalizeSelection(rawSelection = {}) {
  return {
    taskId: String(rawSelection.taskId ?? rawSelection.id ?? ""),
    taskUniqueId: String(rawSelection.taskUniqueId ?? rawSelection.uniqueId ?? rawSelection.id ?? ""),
    source: String(rawSelection.source ?? "project-adapter")
  };
}

function readSourceValue(source, key) {
  if (source && Object.prototype.hasOwnProperty.call(source, key)) {
    return source[key];
  }

  return [];
}

function getOfficeDocument() {
  const officeApi = globalThis.Office;
  return officeApi?.context?.document ?? null;
}

const officeTaskSnapshotCache = new Map();

function callOfficeAsync(executor) {
  return new Promise((resolve, reject) => {
    try {
      executor((result) => {
        if (result?.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
          return;
        }

        reject(result?.error ?? new Error("Office async call failed."));
      });
    } catch (error) {
      reject(error);
    }
  });
}

function normalizeOfficeTask(taskId, rawTask = {}) {
  return {
    id: "",
    uniqueId: String(taskId ?? ""),
    taskGuid: String(taskId ?? ""),
    name: String(rawTask.taskName ?? rawTask.name ?? "Tache sans nom"),
    owner: String(rawTask.resourceNames ?? "Aucune ressource"),
    phase: rawTask.wssTaskId ? `WSS ${rawTask.wssTaskId}` : "MS Project",
    wbs: "",
    startDate: "",
    endDate: "",
    duration: "",
    predecessors: "",
    successors: ""
  };
}

async function readOfficeTaskField(taskId, fieldId) {
  const documentApi = getOfficeDocument();

  if (!documentApi || typeof documentApi.getTaskFieldAsync !== "function") {
    return "";
  }

  const value = await callOfficeAsync((callback) => {
    documentApi.getTaskFieldAsync(taskId, fieldId, callback);
  }).catch(() => null);

  if (value && typeof value === "object" && "fieldValue" in value) {
    return value.fieldValue ?? "";
  }

  return value ?? "";
}

async function enrichOfficeTask(taskId, task) {
  const officeApi = globalThis.Office;

  if (!officeApi?.ProjectTaskFields) {
    return task;
  }

  const [id, taskGuid, wbs, startDate, endDate, duration, predecessors, successors] = await Promise.all([
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.ID),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.TaskGUID),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.WBS),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.Start),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.Finish),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.Duration),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.Predecessors),
    readOfficeTaskField(taskId, officeApi.ProjectTaskFields.Successors)
  ]);

  return {
    ...task,
    id: String(id || task.id || ""),
    uniqueId: String(taskGuid || task.uniqueId || ""),
    taskGuid: String(taskGuid || ""),
    wbs: String(wbs || ""),
    startDate: String(startDate || ""),
    endDate: String(endDate || ""),
    duration: String(duration || ""),
    predecessors: String(predecessors || ""),
    successors: String(successors || "")
  };
}

function cloneOfficeTaskSnapshot(task) {
  return task ? { ...task } : null;
}

export function clearOfficeTaskSnapshotCache() {
  officeTaskSnapshotCache.clear();
}

export function isOfficeProjectAvailable() {
  const documentApi = getOfficeDocument();
  return Boolean(
    documentApi &&
      typeof documentApi.getSelectedTaskAsync === "function" &&
      typeof documentApi.getTaskAsync === "function"
  );
}

export async function readOfficeTaskById(taskId, options = {}) {
  const normalizedTaskId = String(taskId ?? "").trim();
  const includeFieldDetails = options.includeFieldDetails !== false;
  const useCache = options.useCache !== false;
  const documentApi = getOfficeDocument();

  if (!documentApi || !normalizedTaskId) {
    return null;
  }

  if (useCache && includeFieldDetails && officeTaskSnapshotCache.has(normalizedTaskId)) {
    return cloneOfficeTaskSnapshot(officeTaskSnapshotCache.get(normalizedTaskId));
  }

  const rawTask = await callOfficeAsync((callback) => {
    documentApi.getTaskAsync(normalizedTaskId, callback);
  }).catch(() => null);

  const normalizedTask = normalizeOfficeTask(normalizedTaskId, rawTask ?? {});
  const resolvedTask = includeFieldDetails
    ? await enrichOfficeTask(normalizedTaskId, normalizedTask)
    : normalizedTask;

  if (useCache && includeFieldDetails) {
    officeTaskSnapshotCache.set(normalizedTaskId, resolvedTask);
  }

  return cloneOfficeTaskSnapshot(resolvedTask);
}

export async function readSelectedOfficeTaskSnapshot(options = {}) {
  const documentApi = getOfficeDocument();

  if (!documentApi) {
    return null;
  }

  const selectedTaskId = await callOfficeAsync((callback) => {
    documentApi.getSelectedTaskAsync(callback);
  }).catch(() => "");

  if (!selectedTaskId) {
    return null;
  }
  const resolvedTask = await readOfficeTaskById(selectedTaskId, options);

  return {
    taskId: String(selectedTaskId),
    task: resolvedTask,
    source: "office-project"
  };
}

export function subscribeToOfficeTaskSelectionChange(onSelectionChange) {
  const documentApi = getOfficeDocument();
  const officeApi = globalThis.Office;

  if (
    !documentApi ||
    !officeApi?.EventType?.TaskSelectionChanged ||
    typeof documentApi.addHandlerAsync !== "function"
  ) {
    return Promise.resolve({ status: "unavailable" });
  }

  return new Promise((resolve) => {
    documentApi.addHandlerAsync(officeApi.EventType.TaskSelectionChanged, onSelectionChange, (result) => {
      resolve({
        status:
          result?.status === Office.AsyncResultStatus.Succeeded ? "subscribed" : "failed",
        error: result?.error ?? null
      });
    });
  });
}

export async function readProjectTasks(source = {}) {
  const rawTasks = readSourceValue(source, "tasks");
  return Array.isArray(rawTasks) ? rawTasks.map(normalizeTaskWithSelectedFields) : [];
}

export async function readProjectDependencies(source = {}) {
  const rawDependencies = readSourceValue(source, "dependencyLinks");
  return Array.isArray(rawDependencies) ? rawDependencies.map(normalizeDependency) : [];
}

export async function readSelectedTaskContext(source = {}) {
  const rawSelection = source.selection ?? {
    taskId: source.selectedTaskId ?? "",
    taskUniqueId: source.selectedTaskId ?? "",
    source: "project-adapter"
  };

  return normalizeSelection(rawSelection);
}

export function normalizeProjectDataset(source = {}) {
  return {
    selection: {
      taskId: String(source.selection?.taskId ?? source.selectedTaskId ?? ""),
      taskUniqueId: String(
        source.selection?.taskUniqueId ?? source.selection?.taskId ?? source.selectedTaskId ?? ""
      ),
      source: String(source.selection?.source ?? "project-adapter")
    },
    tasks: Array.isArray(source.tasks) ? source.tasks.map(normalizeTaskWithSelectedFields) : [],
    dependencyLinks: Array.isArray(source.dependencyLinks)
      ? source.dependencyLinks.map(normalizeDependency)
      : []
  };
}
