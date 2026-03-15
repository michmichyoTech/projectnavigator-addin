# Current Step

## Task

Brancher le bridge de `src/core` sur les helpers reels de `project-navigator-core`.

## Expected behavior

Le bridge du projet n'est plus seulement declaratif: il importe les helpers utiles depuis `project-navigator-core` et expose un point d'entree reel pour les prochaines etapes de recherche et de calcul de dependances.

## Out of scope

- brancher encore le task pane sur ces helpers
- finaliser les calculs de recherche et de dependances dans l'UI
- modifier le code source de `project-navigator-core`

## Acceptance criteria

- `src/core/project-navigator-core-bridge.js` importe reellement les helpers necessaires depuis `project-navigator-core`
- le bridge expose ces helpers via une API claire pour le task pane
- le bridge reste tolerant si le core n'est pas encore complet ou si certains exports sont absents

## Status

in_progress
