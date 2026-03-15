// Placeholder task pane composition root for the future MS Project add-in.
// This file is intentionally host-light and does not reference Office.js yet.

export function createTaskPaneShell() {
  return {
    name: "project-navigator-taskpane",
    status: "empty-selection",
    emptySelection: {
      title: "Aucune tache selectionnee",
      message:
        "Selectionnez une tache dans Microsoft Project pour afficher sa fiche, ses dependances et les prochains niveaux d'analyse."
    },
    infoMessage: {
      title: "Information d'integration",
      message:
        "Le shell Project Navigator est pret. Les prochains branchements utiliseront les donnees de selection, de recherche et de dependances."
    },
    errorMessage: {
      title: "Aucune donnee exploitable",
      message:
        "Le panneau ne peut pas encore lire le contexte Project. Verifiez la selection ou relancez le chargement de l'add-in."
    },
    selectedTask: {
      title: "Tache selectionnee",
      task: {
        id: "42",
        name: "Valider le prototype du task pane",
        owner: "Equipe PMO",
        phase: "Pilotage"
      }
    },
    filteredTasks: {
      title: "Liste filtree",
      query: "prototype",
      matches: [
        "42 - Valider le prototype du task pane",
        "57 - Documenter le cycle de validation",
        "63 - Preparer le plan de diffusion"
      ]
    },
    dependencyLevel1: {
      title: "Dependances niveau 1",
      items: ["Pred: Cadrer l'atelier Office", "Succ: Integrer le core Project Navigator"]
    },
    dependencyLevel2: {
      title: "Dependances niveau 2",
      items: ["Pred indirect: Preparar le backlog d'integration", "Succ indirect: Valider la diffusion MSI"]
    },
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
