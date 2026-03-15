# Chargement Manuel Dans MS Project

## Pourquoi cette procedure

Le test automatique `npm run start` ne permet pas ici de charger l'add-in dans MS Project:

- l'outil `office-addin-debugging` a bien ete cible vers `project`
- le serveur local `https://localhost:3000` fonctionne
- mais le sideload automatique echoue avec `Sideload to the Project app is not supported`

La voie recommandee pour continuer est donc un chargement manuel du manifest dans MS Project.

## Pre-requis

- `npm install`
- `npm run dev-server`
- `manifest.project.xml` a la racine du projet
- MS Project Desktop installe sur la machine

## Procedure recommandee

1. Demarrer le serveur local:

```powershell
npm run dev-server
```

2. Creer un dossier local pour les manifests, par exemple:

```text
C:\OfficeAddinCatalog
```

3. Copier [manifest.project.xml](c:/Users/yoram/OneDrive%20-%20Technion/Archives%20Consultant/06.%20Developpement%20web/project-navigator-addin/manifest.project.xml) dans ce dossier.

4. Partager ce dossier en lecture sur Windows.

Exemple de nom de partage:

```text
\\<nom-du-pc>\OfficeAddinCatalog
```

5. Dans MS Project, ouvrir:

```text
File > Options > Trust Center > Trust Center Settings > Trusted Add-in Catalogs
```

6. Ajouter le chemin partage du catalogue, cocher l'option pour afficher les manifests du menu, puis redemarrer MS Project.

7. Dans MS Project, ouvrir:

```text
Home > Add-ins
```

ou, selon la version:

```text
Insert > My Add-ins
```

8. Aller dans l'onglet du dossier partage ou du catalogue ajoute, puis charger `Project Navigator Add-in`.

## Resultat attendu

- le task pane s'ouvre
- le contenu est charge depuis `https://localhost:3000/taskpane.html`
- le titre ou le shell `Project Navigator` apparait

## Si ca ne charge pas

- verifier que `npm run dev-server` est toujours actif
- verifier que `https://localhost:3000/taskpane.html` repond dans un navigateur
- verifier que le certificat localhost est accepte
- verifier que le partage reseau est toujours accessible depuis Windows
- fermer puis rouvrir MS Project apres ajout du catalogue
- supprimer puis recharger le manifest si une ancienne version reste en cache

## Etat actuel du projet

- build local OK
- dev server OK sur `https://localhost:3000`
- manifest Project coherent
- validation distante `npm run validate` non concluante ici a cause d'un blocage reseau vers le service Microsoft de validation
