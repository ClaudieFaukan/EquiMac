# EquiMac

**[FR]** Calculateur d'equity poker pour macOS. Clone open-source d'Equilab, optimise pour Apple Silicon et Intel.

**[EN]** Poker equity calculator for macOS. Open-source Equilab clone, optimized for Apple Silicon and Intel.

---

## Features / Fonctionnalites

### 13x13 Range Grid / Grille de Ranges
- Click, drag-to-paint, right-click for suit combos / Clic, drag-to-paint, clic droit pour les combos de suits
- Cmd+click to select a group (pairs+, suited+, offsuit+) / Cmd+clic pour selectionner un groupe
- Weighted ranges (0-100% per hand) / Ranges ponderees (poids 0-100% par main)
- Bidirectional text notation (e.g.: `TT+, AQs+, AKo`) / Notation texte bidirectionnelle
- Double slider for Top X% / Slider double pour Top X%

### Equity Calculator / Calculateur d'Equity
- 2 to 6 players / 2 a 6 joueurs
- Optimized Monte Carlo engine (10k to 1M iterations) / Moteur Monte Carlo optimise
- Web Worker computation (non-blocking UI) / Calcul en Web Worker (UI non bloquante)
- Visual + text board selector (Flop / Turn / River) / Selecteur de board visuel + textuel
- Dead cards + automatic card removal / Dead cards + card removal automatique

### Scenario Analyzer / Analyseur de Scenarios
- Analyzes equity for each possible Turn or River card / Analyse l'equity pour chaque carte possible au Turn ou River
- Color-coded sorted table / Tableau trie par impact avec code couleur

### Equity Heatmap / Heatmap d'Equity
- Visualizes each hero hand's strength against the opponent's range / Visualise la force de chaque main du hero contre le range adverse
- Color code: green (strong) to red (weak) / Code couleur : vert (forte) a rouge (faible)

### Equity Filter / Filtre d'Equity
- Finds all hands with at least (or at most) X% equity against a given range / Trouve toutes les mains avec au moins (ou au plus) X% d'equity contre un range donne
- Result grid + copyable notation / Grille de resultat + notation copiable

### Quiz
- **Equity Quiz** : estimate hand equity vs a range (preflop / postflop) / Estimez l'equity de votre main vs un range
- **Action Quiz** : call / fold / raise / 3-bet on real scenarios / call / fold / raise / 3-bet sur des scenarios concrets
- Built-in questionnaires (RFI 6-max, 3-bet defense, push/fold) / Questionnaires integres
- Create, import and export custom quizzes / Creation, import et export de questionnaires personnalises

### Range Library / Bibliotheque de Ranges
- Built-in presets: 6-max cash, full ring, tournament / Presets integres
- Custom ranges with categories / Ranges personnalisees avec categories
- Import / Export between users (JSON) / Import / Export entre utilisateurs
- Enable / disable categories / Activation / desactivation de categories

### Misc / Divers
- Dark and light theme / Theme sombre et clair
- FR/EN language toggle / Bascule FR/EN
- Full keyboard shortcuts / Raccourcis clavier complets
- Persistence (localStorage)
- Auto-updates via GitHub Releases / Mises a jour automatiques

---

## Installation

### From .dmg / Depuis le .dmg

Download the latest version from the [Releases page](https://github.com/ClaudieFaukan/EquiMac/releases).

Telecharger la derniere version sur la [page Releases](https://github.com/ClaudieFaukan/EquiMac/releases).

> **macOS Gatekeeper warning / Avertissement macOS Gatekeeper**
>
> If macOS displays *"Apple could not verify that EquiMac does not contain malware"*, run the following command in Terminal then relaunch the app:
>
> Si macOS affiche *« Apple n'a pas pu confirmer que EquiMac ne contenait pas de logiciel malveillant »*, executez la commande suivante dans le Terminal puis relancez l'application :
>
> ```bash
> xattr -cr /Applications/EquiMac.app
> ```

### From source / Depuis les sources

```bash
git clone https://github.com/ClaudieFaukan/EquiMac.git
cd EquiMac
npm install
npm run dev
```

## Build

```bash
# Production build
npm run build

# Generate macOS .dmg
npm run build:mac
```

The `.dmg` is generated in the `release/` folder. / Le `.dmg` est genere dans le dossier `release/`.

## Tests

```bash
npm test
```

65 tests cover the calculation engine / 65 tests couvrent le moteur de calcul :
- Hand evaluator (5 and 7 cards, all categories) / Evaluateur de mains
- Monte Carlo equity (AA vs KK, AKs vs QQ, etc.)
- Notation parsing and serialization / Parsing et serialisation de notation
- Combo generation and card removal / Generation de combos et card removal

## Keyboard Shortcuts / Raccourcis clavier

| Shortcut / Raccourci | EN | FR |
|---|---|---|
| `Cmd+Z` | Undo | Annuler |
| `Cmd+Shift+Z` | Redo | Retablir |
| `Cmd+C` | Copy range notation | Copier le range |
| `Cmd+V` | Paste range | Coller un range |
| `Cmd+N` | Clear grid | Vider la grille |
| `Cmd+Click` | Select hand group | Selectionner un groupe |
| `1` - `9` | Select player | Selectionner le joueur |
| `Esc` | Close heatmap | Fermer la heatmap |

## Documentation

- [User Guide / Guide utilisateur](https://github.com/ClaudieFaukan/EquiMac/blob/main/docs/guide-utilisateur.md)

## Tech Stack

- **Electron** + **React** + **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (state management)
- **Vitest** (testing)
- **Web Workers** (Monte Carlo)
- **electron-builder** (macOS packaging)

## License / Licence

MIT
