// Bridge boundary between the future add-in host and project-navigator-core.
// This file documents the exact shared modules the task pane is expected to consume later.
import * as projectNavigatorCore from "../../../project-navigator-core/src/index.js";

export const coreBridgeContract = {
  importsFromCore: [
    "normalizeTasks",
    "findTaskById",
    "findTaskByUniqueId",
    "findTasksByPartialName",
    "getDirectPredecessorRelations",
    "getDirectSuccessorRelations",
    "getSecondPredecessorRelations",
    "getSecondSuccessorRelations",
    "getActiveStartConstraintTaskIds",
    "getConstrainedSuccessorTaskIds",
    "getSecondLevelActivePredecessorTaskIds",
    "getSecondLevelConstrainedSuccessorTaskIds",
    "normalizePlanningData"
  ],
  expectedTaskShape: "{ id, uniqueId, wbs, name, summary, duration, predecessors, successors, startDate, endDate }",
  expectedDependencyShape: "{ predecessorId, successorId, type, lag, lagFormat }"
};

function fallbackIdentity(value) {
  return value;
}

function fallbackArray() {
  return [];
}

function fallbackNull() {
  return null;
}

function resolveCoreHelper(helperName, fallbackImplementation) {
  const helper = projectNavigatorCore[helperName];
  return typeof helper === "function" ? helper : fallbackImplementation;
}

export function createCoreBridge() {
  const helpers = {
    normalizeTasks: resolveCoreHelper("normalizeTasks", fallbackArray),
    findTaskById: resolveCoreHelper("findTaskById", fallbackNull),
    findTaskByUniqueId: resolveCoreHelper("findTaskByUniqueId", fallbackNull),
    findTaskByPartialName: resolveCoreHelper("findTaskByPartialName", fallbackNull),
    findTasksByPartialName: resolveCoreHelper("findTasksByPartialName", fallbackArray),
    getDirectPredecessorRelations: resolveCoreHelper("getDirectPredecessorRelations", fallbackArray),
    getDirectSuccessorRelations: resolveCoreHelper("getDirectSuccessorRelations", fallbackArray),
    getSecondPredecessorRelations: resolveCoreHelper("getSecondPredecessorRelations", fallbackArray),
    getSecondSuccessorRelations: resolveCoreHelper("getSecondSuccessorRelations", fallbackArray),
    getActiveStartConstraintTaskIds: resolveCoreHelper("getActiveStartConstraintTaskIds", fallbackArray),
    getConstrainedSuccessorTaskIds: resolveCoreHelper("getConstrainedSuccessorTaskIds", fallbackArray),
    getSecondLevelActivePredecessorTaskIds: resolveCoreHelper(
      "getSecondLevelActivePredecessorTaskIds",
      fallbackArray
    ),
    getSecondLevelConstrainedSuccessorTaskIds: resolveCoreHelper(
      "getSecondLevelConstrainedSuccessorTaskIds",
      fallbackArray
    ),
    normalizePlanningData: resolveCoreHelper("normalizePlanningData", fallbackIdentity)
  };

  return {
    status: "connected",
    contract: coreBridgeContract,
    availableHelpers: Object.keys(helpers),
    helpers
  };
}
