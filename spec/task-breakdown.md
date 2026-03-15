# Task Breakdown

## 1. Structurer le dossier add-in comme workspace autonome
**Expected behavior**  
Le dossier `project-navigator-addin` contient son `README`, ses `spec/` et ses placeholders de code, sans dépendre d'analyses dispersées à la racine.

**Out of scope**  
Tout code Office réel.

**Acceptance criteria**  
- `README.md` existe.
- `spec/` contient les documents de pilotage.
- les analyses historiques sont fusionnées dans `spec/`.

## 2. Stabiliser la stratégie Yeoman
**Expected behavior**  
Le projet sait quoi faire du scaffold Yeoman partiel déjà généré.

**Out of scope**  
Toute relance automatique de Yeoman.

**Acceptance criteria**  
- le scaffold partiel est analysé
- le plan de fusion est documenté
- le prochain pas est explicite

## 3. Promouvoir les fichiers techniques Yeoman utiles
**Expected behavior**  
Le projet récupère les bons fichiers de build, manifest et task pane à la racine.

**Out of scope**  
Le remplacement du contenu métier final du task pane.

**Acceptance criteria**  
- `package.json`, `webpack.config.js` et `manifest.project.xml` sont au bon endroit
- les fichiers `taskpane.*` et `commands.*` existent dans la structure finale

## 4. Raccorder le point d'entrée du task pane
**Expected behavior**  
`taskpane.js` devient le point d'entrée technique et appelle `taskpane-bootstrap.js`.

**Out of scope**  
Lecture Office.js complète.

**Acceptance criteria**  
- le bundler pointe vers `taskpane.js`
- `taskpane.js` appelle `taskpane-bootstrap.js`

## 5. Remplacer le sample Contoso par un shell Project Navigator minimal
**Expected behavior**  
Le task pane ne montre plus la démo générique Yeoman mais un shell Project Navigator minimal.

**Out of scope**  
Visualisation complète des dépendances.

**Acceptance criteria**  
- plus de branding Contoso visible
- un shell Project Navigator s'affiche

## 6. Brancher un mode mock local
**Expected behavior**  
Le task pane peut être rendu avec des données mock sans Office.

**Out of scope**  
Connexion au vrai host Project.

**Acceptance criteria**  
- le mock adapter est appelé dans un mode local contrôlé
- les états du panneau droit peuvent être testés

## 7. Implémenter l'adaptateur Office
**Expected behavior**  
L'add-in lit la sélection, les tâches et les liens depuis MS Project.

**Out of scope**  
Toute écriture métier dans Project.

**Acceptance criteria**  
- lecture de la sélection
- lecture des tâches
- lecture des dépendances
- conversion vers les shapes du core

## 8. Connecter `project-navigator-core`
**Expected behavior**  
Le task pane réutilise la logique métier du core pour recherche et graphes.

**Out of scope**  
Parser/API externes.

**Acceptance criteria**  
- imports réels du core
- recherche fonctionnelle
- calculs de dépendances niveau 1 et niveau 2 fonctionnels

## 9. Finaliser le task pane fonctionnel dans MS Project
**Expected behavior**  
Le task pane se charge dans MS Project et affiche le bon contenu selon la tâche sélectionnée.

**Out of scope**  
Fonctions avancées d'édition ou de parser.

**Acceptance criteria**  
- le task pane se sideload correctement
- l'affichage minimal fonctionne
- la sélection Project met à jour le panneau
