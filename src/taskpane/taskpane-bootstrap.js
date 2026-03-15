import { createTaskPaneShell } from "./taskpane-shell.js";
import { createTaskPaneViewModel } from "./taskpane-view-model.js";

function renderTaskPaneShell(root, shell, viewModel) {
  const filteredTaskItems = shell.filteredTasks.matches
    .map((item) => `<li class="pn-state-card__list-item">${item}</li>`)
    .join("");
  const dependencyLevel1Items = shell.dependencyLevel1.items
    .map((item) => `<li class="pn-state-card__list-item">${item}</li>`)
    .join("");
  const dependencyLevel2Items = shell.dependencyLevel2.items
    .map((item) => `<li class="pn-state-card__list-item">${item}</li>`)
    .join("");

  root.innerHTML = `
    <section class="pn-shell" aria-label="Project Navigator">
      <header class="pn-shell__header">
        <div class="pn-shell__eyebrow">MS Project add-in</div>
        <h1 class="pn-shell__title">Project Navigator</h1>
        <p class="pn-shell__subtitle">
          Le shell du task pane est en place. Les prochains etats utiliseront le bootstrap applicatif pour afficher la selection et les dependances.
        </p>
      </header>
      <section class="pn-shell__panel" aria-label="Task pane status">
        <h2 class="pn-shell__panel-title">Bootstrap pret</h2>
        <p class="pn-shell__panel-copy">
          ${shell.name} initialise ${viewModel.states.length} etats visuels, regroupes en ${viewModel.stateGroups.length} familles de rendu.
        </p>
      </section>
      <section class="pn-state-grid" aria-label="Project Navigator states">
        <article class="pn-state-card pn-state-card--empty" aria-label="Aucune tache selectionnee">
          <div class="pn-state-card__badge">Etat initial</div>
          <h2 class="pn-state-card__title">${shell.emptySelection.title}</h2>
          <p class="pn-state-card__copy">${shell.emptySelection.message}</p>
        </article>
        <article class="pn-state-card pn-state-card--info" aria-label="Information ou erreur">
          <div class="pn-state-card__badge">Messages</div>
          <h2 class="pn-state-card__title">${shell.infoMessage.title}</h2>
          <p class="pn-state-card__copy">${shell.infoMessage.message}</p>
          <p class="pn-state-card__note">${shell.errorMessage.title}: ${shell.errorMessage.message}</p>
        </article>
        <article class="pn-state-card pn-state-card--task" aria-label="Fiche tache selectionnee">
          <div class="pn-state-card__badge">Fiche tache</div>
          <h2 class="pn-state-card__title">${shell.selectedTask.task.name}</h2>
          <dl class="pn-state-card__meta">
            <div><dt>ID</dt><dd>${shell.selectedTask.task.id}</dd></div>
            <div><dt>Responsable</dt><dd>${shell.selectedTask.task.owner}</dd></div>
            <div><dt>Phase</dt><dd>${shell.selectedTask.task.phase}</dd></div>
          </dl>
        </article>
        <article class="pn-state-card pn-state-card--list" aria-label="Liste filtree de taches">
          <div class="pn-state-card__badge">Liste filtree</div>
          <h2 class="pn-state-card__title">${shell.filteredTasks.title}</h2>
          <p class="pn-state-card__copy">Recherche demo: "${shell.filteredTasks.query}"</p>
          <ul class="pn-state-card__list">${filteredTaskItems}</ul>
        </article>
        <article class="pn-state-card pn-state-card--dep" aria-label="Dependances niveau 1">
          <div class="pn-state-card__badge">Niveau 1</div>
          <h2 class="pn-state-card__title">${shell.dependencyLevel1.title}</h2>
          <ul class="pn-state-card__list">${dependencyLevel1Items}</ul>
        </article>
        <article class="pn-state-card pn-state-card--dep" aria-label="Dependances niveau 2">
          <div class="pn-state-card__badge">Niveau 2</div>
          <h2 class="pn-state-card__title">${shell.dependencyLevel2.title}</h2>
          <ul class="pn-state-card__list">${dependencyLevel2Items}</ul>
        </article>
      </section>
    </section>
  `;
}

export function bootstrapTaskPane() {
  const root = document.getElementById("project-navigator-root");
  const shell = createTaskPaneShell();
  const viewModel = createTaskPaneViewModel();

  if (root) {
    renderTaskPaneShell(root, shell, viewModel);
  }

  return {
    root,
    shell,
    viewModel,
    status: root ? shell.status : "missing-root"
  };
}
