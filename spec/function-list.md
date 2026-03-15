# Function List

## createTaskPaneShell
- File name: `src/taskpane/taskpane-shell.js`
- Role: décrire les états d'interface du futur task pane

## createTaskPaneViewModel
- File name: `src/taskpane/taskpane-view-model.js`
- Role: décrire les interactions et les états visuels attendus

## bootstrapTaskPane
- File name: `src/taskpane/taskpane-bootstrap.js`
- Role: servir de point d'entrée applicatif du task pane Project Navigator

## createCoreBridge
- File name: `src/core/project-navigator-core-bridge.js`
- Role: exposer le contrat des imports à faire depuis `project-navigator-core`

## loadMockProjectData
- File name: `src/mock/mock-project-data-adapter.js`
- Role: fournir une source de données mock pour tester le task pane sans Office.js

## readProjectTasks
- File name: `src/office/project-adapter.js`
- Role: lire les tâches depuis MS Project

## readProjectDependencies
- File name: `src/office/project-adapter.js`
- Role: lire les dépendances depuis MS Project

## readSelectedTaskContext
- File name: `src/office/project-adapter.js`
- Role: lire la tâche actuellement sélectionnée dans MS Project

## futureGeneratedTaskPaneEntry
- File name: `src/taskpane/taskpane.js`
- Role: point d'entrée webpack Yeoman qui devra appeler `taskpane-bootstrap.js`

## futureGeneratedTaskPaneHost
- File name: `src/taskpane/taskpane.html`
- Role: page hôte du task pane
