# Current Step

## Task

Ajouter dans le task pane deux menus deroulants de champs mappes pour afficher des informations supplementaires sur la tache selectionnee.

## Expected behavior

Le task pane propose deux listes basees sur le catalogue des champs mappes present en tete du JSON exporte. Quand l'utilisateur choisit un ou deux champs, leurs valeurs s'affichent dans la carte centrale de la tache selectionnee, sous les informations deja presentes, avec la meme presentation.

## Out of scope

- traiter la diffusion MSI
- publier les assets en production
- refondre encore la strategie globale de latence

## Acceptance criteria

- deux menus deroulants apparaissent a cote du selecteur `Dependency level`
- leurs options proviennent du catalogue de `selectedTaskPropertyFields` du JSON exporte
- les champs choisis s'affichent dans la carte centrale de la tache avec des lignes supplementaires
- la presentation reste coherente avec la carte existante

## Status

implemented-awaiting-user-validation
