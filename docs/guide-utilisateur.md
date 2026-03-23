# EquiMac User Guide / Guide Utilisateur

> **[EN]** English text first | **[FR]** French below each section

---

## Table of Contents / Sommaire

1. [Getting Started / Prise en main](#getting-started--prise-en-main)
2. [Range Grid / Grille de Ranges](#range-grid--grille-de-ranges)
3. [Equity Calculator / Calculateur d'Equity](#equity-calculator--calculateur-dequity)
4. [Scenario Analyzer / Analyseur de Scenarios](#scenario-analyzer--analyseur-de-scenarios)
5. [Heatmap](#heatmap)
6. [Equity Filter / Filtre d'Equity](#equity-filter--filtre-dequity)
7. [Quiz](#quiz)
8. [Range Library / Bibliotheque de Ranges](#range-library--bibliotheque-de-ranges)
9. [Keyboard Shortcuts / Raccourcis clavier](#keyboard-shortcuts--raccourcis-clavier)
10. [Settings / Parametres](#settings--parametres)

---

## Getting Started / Prise en main

**[EN]** EquiMac is a poker equity calculator for macOS. The interface is split in two panels:
- **Left panel**: 13x13 range grid, percentage slider, brush weight, and range stats
- **Right panel**: Calculator, Quiz, Filter, Ranges tabs

**[FR]** EquiMac est un calculateur d'equity poker pour macOS. L'interface est divisee en deux panneaux :
- **Panneau gauche** : grille de range 13x13, slider de pourcentage, poids du pinceau, et statistiques
- **Panneau droit** : onglets Calculateur, Quiz, Filtre, Ranges

---

## Range Grid / Grille de Ranges

**[EN]** The 13x13 grid represents all 169 unique hand combinations in Texas Hold'em.

### Hand types
- **Diagonal**: pairs (AA, KK, ..., 22) — 6 combos each
- **Above diagonal**: suited hands (AKs, AQs, ...) — 4 combos each
- **Below diagonal**: offsuit hands (AKo, AQo, ...) — 12 combos each

### Interactions
| Action | Effect |
|--------|--------|
| Click | Select / deselect a hand |
| Click + drag | Paint multiple hands |
| Right-click | Open suit sub-grid |
| Cmd + click | Select group (e.g.: TT → AA-TT) |
| Cmd + click + drag | Select multiple groups |

**[FR]** La grille 13x13 represente les 169 combinaisons de mains au Texas Hold'em.

### Types de mains
- **Diagonale** : paires — 6 combos chacune
- **Au-dessus** : suited — 4 combos chacune
- **En dessous** : offsuit — 12 combos chacune

### Interactions
| Action | Effet |
|--------|-------|
| Clic | Selectionner / deselectionner |
| Clic + glisser | Peindre plusieurs mains |
| Clic droit | Ouvrir la sous-grille des suits |
| Cmd + clic | Selectionner un groupe |
| Cmd + clic + glisser | Selectionner plusieurs groupes |

### Percentage Slider / Slider de pourcentage
**[EN]** Use the double slider to select the Top X% of hands by preflop ranking. Type a percentage directly in the input field.

**[FR]** Utilisez le double slider pour selectionner les Top X% de mains. Tapez directement un pourcentage dans le champ.

### Brush Weight / Poids du pinceau
**[EN]** Sets the inclusion frequency when painting on the grid. 100% = always in range, 50% = included half the time in simulations. Useful for mixed strategy ranges.

**[FR]** Definit la frequence d'inclusion quand vous peignez sur la grille. 100% = toujours dans le range, 50% = incluse une fois sur deux. Utile pour les ranges de strategie mixte.

### Text Notation / Notation texte
**[EN/FR]** Supported formats:
- `AA` — pair / paire
- `AKs` — suited
- `AKo` — offsuit
- `AK` — suited + offsuit
- `TT+` — TT and all pairs above / TT et toutes les paires au-dessus
- `ATs+` — ATs, AJs, AQs, AKs
- `77-TT` — pair range / range de paires
- `A2s-A5s` — suited range
- `AhKh` — specific combo / combo specifique

---

## Equity Calculator / Calculateur d'Equity

**[EN]**
- 2 to 6 player panels, each with notation input, Presets, Grid button
- Click on a player's input to activate that player and sync the grid
- Top %: enter a percentage to auto-generate the range
- Board: click F/T/R slots or type in the text field (e.g.: `Ah,Kd,2s`)
- Dead Cards: known removed cards
- Select iterations (10k quick, 100k precise, 1M maximum), click Calculate
- Results: equity, win%, tie% per player + visual bar

**[FR]**
- 2 a 6 panneaux joueurs avec champ notation, Presets, bouton Grille
- Cliquer sur l'input d'un joueur l'active et synchronise la grille
- Top % : entrez un pourcentage pour generer le range automatiquement
- Board : cliquez sur les emplacements F/T/R ou tapez dans le champ (ex: `Ah,Kd,2s`)
- Dead Cards : cartes mortes connues
- Selectionnez les iterations (10k rapide, 100k precis, 1M maximum), cliquez Calculer
- Resultats : equity, win%, tie% par joueur + barre visuelle

---

## Scenario Analyzer / Analyseur de Scenarios

**[EN]** Available in the Calculator tab when a board of 3 or 4 cards is set. Enter 2 ranges + a flop, click Analyze. Shows equity for each possible next card. Green = favorable, red = unfavorable.

**[FR]** Disponible dans l'onglet Calculateur quand un board de 3 ou 4 cartes est defini. Entrez 2 ranges + un flop, cliquez Analyser. Montre l'equity pour chaque carte suivante possible. Vert = favorable, rouge = defavorable.

---

## Heatmap

**[EN]** Visualizes each Player 1 hand's strength against Player 2's range. Click "Heatmap" after entering 2 ranges. Hover cells for exact equity. Colors: green (>70%), orange (55-70%), yellow (45-55%), blue (35-45%), red (<35%).

**[FR]** Visualise la force de chaque main du Joueur 1 contre le range du Joueur 2. Cliquez "Heatmap" apres avoir entre 2 ranges. Survolez les cellules pour l'equity exacte. Couleurs : vert (>70%), orange (55-70%), jaune (45-55%), bleu (35-45%), rouge (<35%).

---

## Equity Filter / Filtre d'Equity

**[EN]** Filter tab — finds all hands with a target equity against an opponent's range.
1. **Opponent range**: synced with the left grid. Editable via notation, presets, or Top %
2. **Target equity**: slider to set threshold (≥ or ≤)
3. **Find hands**: calculates and filters
4. **Result**: 13x13 grid + copyable notation
5. **Load to grid**: applies the result. The filter re-applies instantly when you move the slider.

**[FR]** Onglet Filtre — trouve toutes les mains avec une equity cible contre un range adverse.
1. **Range adverse** : synchronise avec la grille. Modifiable via notation, presets, ou Top %
2. **Equity cible** : slider pour definir le seuil (≥ ou ≤)
3. **Trouver les mains** : calcule et filtre
4. **Resultat** : grille 13x13 + notation copiable
5. **Charger dans la grille** : applique le resultat. Le filtre se re-applique instantanement.

---

## Quiz

### Equity Quiz
**[EN]** Choose number of questions (10, 20, or custom), Preflop or Postflop mode. Estimate equity with the slider, submit. Score with average error and detail per question.

**[FR]** Choisissez le nombre de questions (10, 20, ou libre), mode Preflop ou Postflop. Estimez l'equity avec le slider, validez. Score avec ecart moyen et detail par question.

### Action Quiz
**[EN]** Themed questionnaires: RFI, 3-bet, push/fold. Choose the correct action. Explanation after each answer. Final score with detail.

**[FR]** Questionnaires thematiques : RFI, 3-bet, push/fold. Choisissez l'action correcte. Explication apres chaque reponse. Score final avec detail.

### Manage quizzes / Gerer les questionnaires
**[EN]** Manage button in the Quiz tab. Enable/disable built-in quizzes, create custom ones, import/export as JSON.

**[FR]** Bouton Gerer dans l'onglet Quiz. Activer/desactiver les questionnaires integres, creer des personnalises, importer/exporter en JSON.

---

## Range Library / Bibliotheque de Ranges

**[EN]** Ranges tab — manage your ranges.
- **Built-in presets**: 6-max Cash (RFI, 3-bet, Call), Full Ring, Tournament (push/fold, medium stacks). Toggle with checkbox.
- **Custom ranges**: "Save from grid", "+ New range", "+ Category". Each range is editable and deletable.
- **Import/Export**: "Export" downloads `equimac-ranges.json`. "Import" loads a JSON file (merges without duplicates).

**[FR]** Onglet Ranges — gerez vos ranges.
- **Presets integres** : 6-max Cash (RFI, 3-bet, Call), Full Ring, Tournoi (push/fold, stacks moyens). Activables via checkbox.
- **Ranges personnalisees** : "Sauvegarder la grille", "+ Nouveau range", "+ Categorie". Chaque range est editable et supprimable.
- **Import/Export** : "Exporter" telecharge `equimac-ranges.json`. "Importer" charge un fichier JSON (fusion sans doublons).

---

## Keyboard Shortcuts / Raccourcis clavier

| Shortcut | EN | FR |
|---|---|---|
| `Cmd+Z` | Undo | Annuler |
| `Cmd+Shift+Z` | Redo | Retablir |
| `Cmd+C` | Copy range | Copier le range |
| `Cmd+V` | Paste range | Coller un range |
| `Cmd+N` | Clear grid | Vider la grille |
| `Cmd+Click` | Select group | Selectionner un groupe |
| `1` - `9` | Select player | Selectionner le joueur |
| `Esc` | Close heatmap | Fermer la heatmap |

---

## Settings / Parametres

### Theme
**[EN]** Click the sun/moon icon in the top right to toggle dark/light mode. Choice is saved.

**[FR]** Cliquez sur l'icone soleil/lune en haut a droite pour basculer sombre/clair. Le choix est sauvegarde.

### Language / Langue
**[EN]** Click FR/EN in the top right to switch language. Choice is saved.

**[FR]** Cliquez FR/EN en haut a droite pour changer de langue. Le choix est sauvegarde.

### Updates / Mises a jour
**[EN]** Menu EquiMac > "Check for Updates..." to check for new versions on GitHub.

**[FR]** Menu EquiMac > "Check for Updates..." pour verifier les nouvelles versions sur GitHub.

### Persistence
**[EN/FR]** Auto-saved / Sauvegarde automatique :
- Theme (dark/light — sombre/clair)
- Language (EN/FR)
- Custom ranges and categories / Ranges personnalisees et categories
- Custom quizzes / Questionnaires personnalises
- Enabled/disabled categories / Categories activees/desactivees
