// Bridge boundary between the future add-in host and project-navigator-core.
// This file documents the exact shared modules the task pane is expected to consume later.

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
  expectedTaskShape: "{ id, uniqueId, wbs, name, summary, startDate, endDate }",
  expectedDependencyShape: "{ predecessorId, successorId, type, lag, lagFormat }"
};

export function createCoreBridge() {
  return {
    status: "placeholder",
    note: "Replace with real imports from project-navigator-core after Yeoman generation is in place."
  };
}
