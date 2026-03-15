# Next Step

## Objective

Faire de `project-navigator-addin` la racine technique unique du futur add-in, sans perdre ni la structure préparée ni les fichiers techniques utiles du scaffold Yeoman.

## Immediate action

Promouvoir dans un pas contrôlé les fichiers techniques suivants depuis le scaffold Yeoman partiel vers la racine de `project-navigator-addin` :

- `package.json`
- `webpack.config.js`
- `manifest.project.xml`
- `src/taskpane/taskpane.html`
- `src/taskpane/taskpane.js`
- `src/taskpane/taskpane.css`
- `src/commands/commands.html`
- `src/commands/commands.js`

## Constraints

- ne pas écraser les fichiers d'architecture préparés dans `src/taskpane`, `src/office`, `src/core`, `src/mock` sans décision explicite
- garder `project-navigator-addin` comme racine cible finale
- ne pas toucher à `project-navigator` ni `project-navigator-core`
- ne pas relancer Yeoman avant d'avoir stabilisé la promotion du scaffold existant

## Expected result

- le projet add-in possède à sa racine les fichiers Yeoman réellement utiles
- `taskpane.js` devient le point d'entrée webpack officiel
- `taskpane-bootstrap.js` reste le point d'entrée applicatif Project Navigator

## After this step

La prochaine étape sera de brancher `src/taskpane/taskpane.js` sur `src/taskpane/taskpane-bootstrap.js` et de remplacer le contenu sample Contoso par un shell minimal Project Navigator.
