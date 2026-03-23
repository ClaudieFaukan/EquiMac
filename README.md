# EquiMac

Calculateur d'equity poker pour macOS. Clone open-source d'Equilab, optimise pour Apple Silicon et Intel.

## Fonctionnalites

### Grille de Ranges 13x13
- Selection par clic, drag-to-paint, clic droit pour les combos de suits
- Cmd+clic pour selectionner un groupe (paires+, suited+, offsuit+)
- Ranges ponderees (poids 0-100% par main)
- Notation texte bidirectionnelle (ex: `TT+, AQs+, AKo`)
- Slider double pour Top X%

### Calculateur d'Equity
- 2 a 6 joueurs simultanement
- Moteur Monte Carlo optimise (10k a 1M iterations)
- Calcul en Web Worker (UI non bloquante)
- Selecteur de board visuel + textuel (Flop / Turn / River)
- Dead cards
- Card removal automatique

### Analyseur de Scenarios
- Analyse l'equity pour chaque carte possible au Turn ou River
- Tableau trie par impact avec code couleur

### Heatmap d'Equity
- Visualise la force de chaque main du hero contre le range adverse
- Code couleur : vert (forte) a rouge (faible)

### Filtre d'Equity
- Trouve toutes les mains avec au moins (ou au plus) X% d'equity contre un range donne
- Grille de resultat + notation copiable

### Quiz
- **Quiz d'equity** : estimez le % d'equity de votre main vs un range (preflop / postflop)
- **Quiz d'actions** : call / fold / raise / 3-bet sur des scenarios concrets
- Questionnaires integres (RFI 6-max, 3-bet defense, push/fold tournoi)
- Creation, import et export de questionnaires personnalises

### Bibliotheque de Ranges
- Presets integres : 6-max cash, full ring, tournoi (push/fold, stacks moyens)
- Ranges personnalisees avec categories
- Import / Export entre utilisateurs (JSON)
- Activation / desactivation de categories

### Divers
- Theme sombre et clair
- Raccourcis clavier complets
- Persistance (localStorage)
- Mises a jour automatiques via GitHub Releases

## Installation

### Depuis le .dmg

Telecharger la derniere version sur la [page Releases](https://github.com/ClaudieFaukan/EquiMac/releases).

### Depuis les sources

```bash
git clone https://github.com/ClaudieFaukan/EquiMac.git
cd EquiMac
npm install
npm run dev
```

## Build

```bash
# Build de production
npm run build

# Generer le .dmg macOS
npm run build:mac
```

Le `.dmg` est genere dans le dossier `release/`.

## Tests

```bash
npm test
```

65 tests couvrent le moteur de calcul :
- Evaluateur de mains (5 et 7 cartes, toutes categories)
- Calcul d'equity Monte Carlo (AA vs KK, AKs vs QQ, etc.)
- Parsing et serialisation de notation
- Generation de combos et card removal

## Raccourcis clavier

| Raccourci | Action |
|-----------|--------|
| `Cmd+Z` | Annuler |
| `Cmd+Shift+Z` | Retablir |
| `Cmd+C` | Copier le range en notation |
| `Cmd+V` | Coller un range |
| `Cmd+N` | Vider la grille |
| `Cmd+Clic` | Selectionner un groupe de mains |
| `1` - `9` | Selectionner le joueur |
| `Echap` | Fermer la heatmap |

## Documentation

La documentation complete est disponible sur le [Wiki GitHub](https://github.com/ClaudieFaukan/EquiMac/wiki).

## Stack technique

- **Electron** + **React** + **TypeScript**
- **Tailwind CSS v4** pour le styling
- **Zustand** pour le state management
- **Vitest** pour les tests
- **Web Workers** pour les calculs Monte Carlo
- **electron-builder** pour le packaging macOS

## Licence

MIT
