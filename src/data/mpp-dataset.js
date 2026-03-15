import mappedProjectDataset from "../../data/mpp-mapped-all.json";

function normalizeLagToCoreUnit(lagText = "") {
  const normalizedLagText = String(lagText ?? "").replace(/\s+/g, "").trim();

  if (!normalizedLagText) {
    return { lag: 0, lagFormat: 39 };
  }

  const match = normalizedLagText.match(/^([+-]?\d+(?:[.,]\d+)?)([A-Za-z%]+)?$/);

  if (!match) {
    return { lag: 0, lagFormat: 39 };
  }

  const numericValue = Number(match[1].replace(",", "."));
  const suffix = String(match[2] ?? "d").toLowerCase();
  const lagFormatBySuffix = {
    m: 35,
    min: 35,
    mins: 35,
    h: 37,
    hr: 37,
    hrs: 37,
    d: 39,
    day: 39,
    days: 39,
    ed: 40,
    eday: 40,
    edays: 40,
    w: 41,
    wk: 41,
    wks: 41,
    week: 41,
    weeks: 41,
    ew: 42,
    eweek: 42,
    eweeks: 42,
    mo: 43,
    mon: 43,
    month: 43,
    months: 43,
    emo: 44,
    emonth: 44,
    emonths: 44,
    "%": 51
  };
  const lagDivisorByFormat = {
    35: 10,
    37: 600,
    39: 4800,
    40: 4800,
    41: 24000,
    42: 24000,
    43: 96000,
    44: 96000,
    51: 1
  };
  const lagFormat = lagFormatBySuffix[suffix] ?? 39;

  return {
    lag: Number.isFinite(numericValue) ? numericValue * (lagDivisorByFormat[lagFormat] ?? 4800) : 0,
    lagFormat
  };
}

function parseRelationTokens(value, anchorTaskId, direction) {
  return String(value ?? "")
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => {
      const match = token.match(/^(\d+)\s*(FS|SS|FF|SF)?\s*([+-]\s*\d+(?:[.,]\d+)?\s*[A-Za-z%]*)?$/i);

      if (!match) {
        return null;
      }

      const relatedTaskId = String(match[1]);
      const type = String(match[2] ?? "FS").toUpperCase();
      const lagText = String(match[3] ?? "").replace(/\s+/g, "").trim();
      const { lag, lagFormat } = normalizeLagToCoreUnit(lagText);

      return {
        predecessorId: direction === "predecessor" ? relatedTaskId : String(anchorTaskId),
        successorId: direction === "predecessor" ? String(anchorTaskId) : relatedTaskId,
        type,
        lag,
        lagFormat
      };
    })
    .filter(Boolean);
}

function createDependencyLinks(tasks) {
  const linksByKey = new Map();

  tasks.forEach((task) => {
    parseRelationTokens(task.predecessors, task.id, "predecessor").forEach((link) => {
      const key = [
        String(link.predecessorId),
        String(link.successorId),
        String(link.type),
        String(link.lag),
        String(link.lagFormat)
      ].join("|");
      linksByKey.set(key, link);
    });
  });

  return [...linksByKey.values()];
}

const tasks = Array.isArray(mappedProjectDataset.tasks) ? mappedProjectDataset.tasks : [];
const tasksById = new Map(tasks.map((task) => [String(task.id), task]));
const tasksByUniqueId = new Map(tasks.map((task) => [String(task.uniqueId), task]));
const dependencyLinks = createDependencyLinks(tasks);

export function getMappedProjectDataset() {
  return {
    sourceFile: mappedProjectDataset.sourceFile ?? "",
    taskCount: Number(mappedProjectDataset.taskCount ?? tasks.length),
    selectedCoreFields: Array.isArray(mappedProjectDataset.selectedCoreFields)
      ? mappedProjectDataset.selectedCoreFields
      : [],
    selectedTaskPropertyFields: Array.isArray(mappedProjectDataset.selectedTaskPropertyFields)
      ? mappedProjectDataset.selectedTaskPropertyFields
      : [],
    tasks,
    tasksById,
    tasksByUniqueId,
    dependencyLinks
  };
}
