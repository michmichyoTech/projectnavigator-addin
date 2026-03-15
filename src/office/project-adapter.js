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
