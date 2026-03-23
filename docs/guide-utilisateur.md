# Guide Utilisateur EquiMac

## Sommaire

1. [Prise en main](#prise-en-main)
2. [Grille de Ranges](#grille-de-ranges)
3. [Calculateur d'Equity](#calculateur-dequity)
4. [Analyseur de Scenarios](#analyseur-de-scenarios)
5. [Heatmap](#heatmap)
6. [Filtre d'Equity](#filtre-dequity)
7. [Quiz](#quiz)
8. [Bibliotheque de Ranges](#bibliotheque-de-ranges)
9. [Raccourcis clavier](#raccourcis-clavier)
10. [Parametres](#parametres)

---

## Prise en main

EquiMac est un calculateur d'equity poker pour macOS. L'interface est divisee en deux panneaux :

- **Panneau gauche** : la grille de range 13x13, le slider de pourcentage, le poids du pinceau, et les statistiques
- **Panneau droit** : onglets Calculateur, Quiz, Filtre, Ranges

---

## Grille de Ranges

La grille 13x13 represente les 169 combinaisons de mains au Texas Hold'em.

### Types de mains
- **Diagonale** : paires (AA, KK, ..., 22) - 6 combos chacune
- **Au-dessus** : suited (AKs, AQs, ...) - 4 combos chacune
- **En dessous** : offsuit (AKo, AQo, ...) - 12 combos chacune

### Interactions
| Action | Effet |
|--------|-------|
| Clic | Selectionner / deselectionner une main |
| Clic + glisser | Peindre plusieurs mains |
| Clic droit | Ouvrir la sous-grille des suits |
| Cmd + clic | Selectionner un groupe (ex: TT → AA-TT) |
| Cmd + clic + glisser | Selectionner plusieurs groupes |

### Slider de pourcentage
Utilisez le double slider pour selectionner les Top X% de mains selon le classement preflop standard.
- Slider simple : Top X% (ex: 20% = les 20% meilleures mains)
- Double slider : range entre deux bornes (ex: 12%-25% pour un range de cold-call)
- Champ numerique : tapez directement un pourcentage

### Poids du pinceau
Definit la frequence d'inclusion quand vous peignez sur la grille.
- 100% : la main est toujours dans le range
- 50% : la main est incluse une fois sur deux dans les simulations
- Utile pour modeliser des ranges mixtes (ex: 3-bet AA 100%, 3-bet AKo 50%)

### Statistiques
En dessous de la grille :
- Nombre de combos selectionnes
- Pourcentage du total (1326 combos)
- Notation texte du range (copiable et editable)

### Notation texte
Formats supportes :
- `AA` - paire
- `AKs` - suited
- `AKo` - offsuit
- `AK` - suited + offsuit
- `TT+` - TT et toutes les paires au-dessus
- `ATs+` - ATs, AJs, AQs, AKs
- `77-TT` - range de paires
- `A2s-A5s` - range suited
- `AhKh` - combo specifique

### Presets
Cliquez sur "Presets" pour charger un range predifini (RFI, 3-bet, call, push/fold par position).

---

## Calculateur d'Equity

### Panneaux joueurs
- 2 a 6 joueurs
- Pour chaque joueur : champ notation, bouton Presets, bouton Grille
- Cliquer sur l'input d'un joueur active ce joueur et synchronise la grille
- Top % : entrez un pourcentage pour generer automatiquement le range

### Board
- Cliquez sur les emplacements F/T/R pour selectionner les cartes du flop, turn, river
- Ou tapez directement dans le champ texte (ex: `Ah,Kd,2s`)
- Cliquez sur une carte existante pour la retirer

### Dead Cards
Cartes mortes connues qui ne sont plus dans le deck. Cliquez + pour en ajouter.

### Calcul
- Selectionnez le nombre d'iterations (10k pour un apercu rapide, 100k pour la precision, 1M pour la precision maximale)
- Cliquez "Calculer" - le calcul tourne en arriere-plan (Web Worker)
- Resultats : equity, win%, tie% par joueur + barre visuelle

---

## Analyseur de Scenarios

Disponible dans l'onglet Calculateur quand un board de 3 ou 4 cartes est defini.

1. Entrez les ranges des joueurs et un flop (ou flop + turn)
2. Cliquez "Analyser"
3. Le tableau montre l'equity pour chaque carte possible au turn (ou river)
4. Code couleur : vert = carte favorable, rouge = carte defavorable
5. Triable par equity ou par carte

---

## Heatmap

Visualise la force de chaque main individuelle du Joueur 1 contre le range du Joueur 2.

1. Entrez les ranges des deux joueurs
2. Cliquez "Heatmap"
3. La grille se transforme en heatmap coloree
4. Survolez une cellule pour voir l'equity exacte
5. Cliquez "Retour grille" pour revenir a l'editeur

Couleurs :
- Vert : >70% d'equity (tres forte)
- Orange : 55-70% (bonne)
- Jaune : 45-55% (neutre)
- Bleu : 35-45% (faible)
- Rouge : <35% (tres faible)

---

## Filtre d'Equity

Onglet "Filtre" - trouve automatiquement les mains qui ont une equity cible contre un range adverse.

1. **Range adverse** : synchronise avec la grille gauche. Modifiable via notation, presets, ou Top %
2. **Equity cible** : slider pour definir le seuil (≥ ou ≤)
3. **"Trouver les mains"** : calcule l'equity de chaque main et filtre
4. **Resultat** : grille 13x13 avec les mains filtrees + notation copiable
5. **"Charger dans la grille"** : applique le resultat

Le filtre se re-applique instantanement quand vous bougez le slider (sans recalculer).

---

## Quiz

### Quiz d'Equity
- Choisissez le nombre de questions (10, 20, ou libre)
- Mode Preflop ou Postflop
- Estimez l'equity avec le slider, validez
- Score avec ecart moyen et detail par question

### Quiz d'Actions
- Questionnaires thematiques : RFI, 3-bet, push/fold
- Choisissez l'action correcte parmi les options
- Explication apres chaque reponse
- Score final avec detail

### Gerer les questionnaires
- Bouton "Gerer" dans l'onglet Quiz
- Activer/desactiver les questionnaires integres
- Creer des questionnaires personnalises
- Importer/exporter au format JSON

---

## Bibliotheque de Ranges

Onglet "Ranges" - gerez vos ranges.

### Presets integres
- 6-max Cash : RFI, 3-bet, Call par position
- Full Ring : RFI par position
- Tournoi : Push/Fold (10-15bb), stacks moyens (20-30bb)
- Activables/desactivables via la checkbox

### Ranges personnalisees
- "Sauvegarder la grille" : sauvegarde le range actuel
- "+ Nouveau range" : creation manuelle (nom, notation, categorie)
- "+ Categorie" : creer une categorie personnalisee
- Chaque range est editable et supprimable

### Import / Export
- "Exporter" : telecharge un fichier `equimac-ranges.json`
- "Importer" : charge un fichier JSON d'un autre utilisateur (fusion sans doublons)

---

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Cmd+Z` | Annuler la derniere modification de range |
| `Cmd+Shift+Z` | Retablir |
| `Cmd+C` | Copier le range en notation texte |
| `Cmd+V` | Coller un range depuis le presse-papier |
| `Cmd+N` | Vider la grille |
| `Cmd+Clic` | Selectionner un groupe de mains |
| `1` a `9` | Selectionner le joueur correspondant |
| `Echap` | Fermer la heatmap |

---

## Parametres

### Theme
Cliquez sur l'icone soleil/lune en haut a droite pour basculer entre le mode sombre et le mode clair. Le choix est sauvegarde.

### Mises a jour
Menu EquiMac > "Rechercher des mises a jour..." pour verifier si une nouvelle version est disponible sur GitHub.

### Persistance
Les donnees suivantes sont sauvegardees automatiquement :
- Theme (sombre/clair)
- Ranges personnalisees et categories
- Questionnaires personnalises
- Categories activees/desactivees
