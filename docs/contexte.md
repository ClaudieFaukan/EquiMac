# Prompt pour Claude Code : Clone d'Equilab pour Mac

---

## Contexte

Crée une application desktop **native macOS** qui clone les fonctionnalités du logiciel de poker **Equilab** (de PokerStrategy.com). Equilab n'est disponible que sur Windows. L'objectif est de reproduire fidèlement toutes ses fonctionnalités dans une app moderne, performante, qui tourne nativement sur Mac (Apple Silicon + Intel).

---

## Stack technique

- **Framework** : Electron + React + TypeScript (pour avoir une app desktop cross-platform, mais optimisée Mac en priorité)
- **Styling** : Tailwind CSS
- **Moteur de calcul d'equity** : Implémente un moteur Monte Carlo en **Rust** ou **C++ compilé en WebAssembly** pour les performances. Si trop complexe, un moteur TypeScript pur avec Web Workers est acceptable mais moins performant.
- **Build** : electron-builder pour générer un `.dmg` installable sur Mac
- **State management** : Zustand ou Redux Toolkit
- **Tests** : Vitest pour les tests unitaires du moteur de calcul

---

## Architecture du projet

```
equilab-mac/
├── src/
│   ├── main/                    # Process principal Electron
│   │   └── main.ts
│   ├── renderer/                # UI React
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── RangeGrid/       # Grille 13x13 des ranges
│   │   │   │   ├── RangeGrid.tsx
│   │   │   │   ├── HandCell.tsx
│   │   │   │   └── SuitSubGrid.tsx
│   │   │   ├── EquityCalculator/
│   │   │   │   ├── EquityCalculator.tsx
│   │   │   │   ├── PlayerPanel.tsx
│   │   │   │   └── ResultsDisplay.tsx
│   │   │   ├── BoardSelector/
│   │   │   │   ├── BoardSelector.tsx
│   │   │   │   └── CardPicker.tsx
│   │   │   ├── PercentageSlider/
│   │   │   │   └── PercentageSlider.tsx
│   │   │   ├── ScenarioAnalyzer/
│   │   │   │   └── ScenarioAnalyzer.tsx
│   │   │   └── EquityTrainer/
│   │   │       └── EquityTrainer.tsx
│   │   ├── engine/              # Moteur de calcul
│   │   │   ├── evaluator.ts     # Évaluation des mains
│   │   │   ├── equity.ts        # Calcul Monte Carlo
│   │   │   ├── ranges.ts        # Gestion des ranges
│   │   │   ├── combos.ts        # Comptage des combos
│   │   │   └── constants.ts     # Rankings, constantes
│   │   ├── data/
│   │   │   ├── preflop-rankings.ts  # Classement des 169 mains
│   │   │   └── preset-ranges.ts     # Ranges prédéfinies
│   │   ├── hooks/
│   │   ├── store/
│   │   └── utils/
│   └── workers/                 # Web Workers pour calculs lourds
│       └── equity-worker.ts
├── tests/
├── package.json
├── electron-builder.yml
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Fonctionnalité 1 : La Grille de Ranges 13x13

### Description
C'est LE coeur de l'application. Une matrice 13x13 représentant les 169 combinaisons de mains uniques au Texas Hold'em.

### Layout de la grille

```
     A     K     Q     J     T     9     8     7     6     5     4     3     2
A  [AA]  [AKs] [AQs] [AJs] [ATs] [A9s] [A8s] [A7s] [A6s] [A5s] [A4s] [A3s] [A2s]
K  [AKo] [KK]  [KQs] [KJs] [KTs] [K9s] [K8s] [K7s] [K6s] [K5s] [K4s] [K3s] [K2s]
Q  [AQo] [KQo] [QQ]  [QJs] [QTs] [Q9s] [Q8s] [Q7s] [Q6s] [Q5s] [Q4s] [Q3s] [Q2s]
J  [AJo] [KJo] [QJo] [JJ]  [JTs] [J9s] [J8s] [J7s] [J6s] [J5s] [J4s] [J3s] [J2s]
T  [ATo] [KTo] [QTo] [JTo] [TT]  [T9s] [T8s] [T7s] [T6s] [T5s] [T4s] [T3s] [T2s]
9  [A9o] [K9o] [Q9o] [J9o] [T9o] [99]  [98s] [97s] [96s] [95s] [94s] [93s] [92s]
8  [A8o] [K8o] [Q8o] [J8o] [T8o] [98o] [88]  [87s] [86s] [85s] [84s] [83s] [82s]
7  [A7o] [K7o] [Q7o] [J7o] [T7o] [97o] [87o] [77]  [76s] [75s] [74s] [73s] [72s]
6  [A6o] [K6o] [Q6o] [J6o] [T6o] [96o] [86o] [76o] [66]  [65s] [64s] [63s] [62s]
5  [A5o] [K5o] [Q5o] [J5o] [T5o] [95o] [85o] [75o] [65o] [55]  [54s] [53s] [52s]
4  [A4o] [K4o] [Q4o] [J4o] [T4o] [94o] [84o] [74o] [64o] [54o] [44]  [43s] [42s]
3  [A3o] [K3o] [Q3o] [J3o] [T3o] [93o] [83o] [73o] [63o] [53o] [43o] [33]  [32s]
2  [A2o] [K2o] [Q2o] [J2o] [T2o] [92o] [82o] [72o] [62o] [52o] [42o] [32o] [22]
```

### Règles de la grille
- **Diagonale** : Paires (AA, KK, QQ... 22) → 6 combos chacune
- **Au-dessus de la diagonale** : Mains suited (s) → 4 combos chacune
- **En dessous de la diagonale** : Mains offsuit (o) → 12 combos chacune
- **Total** : 13 paires × 6 + 78 suited × 4 + 78 offsuit × 12 = 78 + 312 + 936 = **1326 combos**

### Interactions utilisateur sur la grille
1. **Clic simple** : Sélectionne/désélectionne une main entière
2. **Clic + drag (paint)** : Permet de "peindre" une sélection en glissant la souris sur plusieurs cellules. C'est CRITIQUE — l'utilisateur doit pouvoir sélectionner rapidement en faisant glisser.
3. **Clic droit** : Ouvre un sous-menu pour sélectionner des combos de suits spécifiques (voir sous-grille)
4. **Code couleur** :
   - Rouge/rose : main sélectionnée à 100%
   - Dégradé de couleur : main partiellement pondérée (ex: 50% = couleur à mi-opacité)
   - Gris/blanc : main non sélectionnée
   - Les paires, suited et offsuit doivent avoir des teintes légèrement différentes pour être visuellement distinctes

### Sous-grille des suits (4x4 par main)
Quand on fait clic droit sur une cellule, afficher une sous-grille montrant chaque combinaison de suits :
- Pour une main suited comme AKs : A♠K♠, A♥K♥, A♦K♦, A♣K♣ (4 combos)
- Pour une main offsuit comme AKo : A♠K♥, A♠K♦, A♠K♣, A♥K♠, A♥K♦, A♥K♣, A♦K♠, A♦K♥, A♦K♣, A♣K♠, A♣K♥, A♣K♦ (12 combos)
- Pour une paire comme AA : A♠A♥, A♠A♦, A♠A♣, A♥A♦, A♥A♣, A♦A♣ (6 combos)
- L'utilisateur peut cocher/décocher chaque combo individuellement

### Affichage des statistiques de range
À côté de la grille, toujours afficher en temps réel :
- **Nombre de combos sélectionnés** : ex. "184 combos"
- **Pourcentage du total** : ex. "13.9%"
- **Liste textuelle de la range** : ex. "77+, A9s+, KTs+, QTs+, JTs, AJo+, KQo"
- Cette notation textuelle doit être **copiable** et aussi **importable** (l'utilisateur peut coller une notation et la grille se met à jour)

---

## Fonctionnalité 2 : Slider de pourcentage (Top X%)

### Description
Un slider horizontal (ou double slider) qui permet de sélectionner un pourcentage de mains. Quand l'utilisateur déplace le slider, la grille se met à jour automatiquement en sélectionnant les X% meilleures mains selon un classement standard.

### Classement standard des 169 mains (du plus fort au plus faible)
Utilise le classement classique basé sur l'equity préflop all-in (ProPokerTools / Equilab standard). Voici l'ordre approximatif à intégrer comme constante :

```typescript
const HAND_RANKINGS: string[] = [
  // Top 1% - Premium
  "AA", "KK", "QQ", "AKs", "JJ",
  // Top 3%
  "AQs", "TT", "AKo", "AJs", "KQs",
  // Top 5%
  "99", "ATs", "AQo", "KJs", "88",
  // Top 8%
  "KTs", "QJs", "A9s", "AJo", "QTs",
  // Top 10%
  "77", "KQo", "JTs", "A8s", "K9s",
  // Top 13%
  "ATo", "A5s", "A7s", "66", "KJo",
  // Top 15%
  "A4s", "A6s", "A3s", "QJo", "K8s",
  // Top 18%
  "Q9s", "JTo", "A2s", "55", "KTo",
  // Top 20%
  "J9s", "QTo", "T9s", "K7s", "A9o",
  // Top 23%
  "K6s", "44", "Q8s", "J8s", "98s",
  // Top 25%
  "T8s", "K5s", "A8o", "K4s", "Q9o",
  // Top 28%
  "33", "87s", "J9o", "A5o", "Q7s",
  // Top 30%
  "97s", "A7o", "T9o", "K3s", "J7s",
  // Top 33%
  "76s", "22", "K2s", "Q6s", "A4o",
  // Top 35%
  "98o", "86s", "T7s", "A6o", "K9o",
  // Top 38%
  "65s", "A3o", "Q5s", "J8o", "96s",
  // Top 40%
  "54s", "T8o", "87o", "Q4s", "K8o",
  // Top 43%
  "75s", "A2o", "Q3s", "J6s", "85s",
  // Top 45%
  "K7o", "Q8o", "97o", "J5s", "64s",
  // Top 48%
  "Q2s", "T6s", "53s", "76o", "J4s",
  // Top 50%
  "86o", "K6o", "95s", "J3s", "43s",
  // ... continuer jusqu'à 72o (la pire main)
  // Top 55%
  "T7o", "74s", "J2s", "65o", "K5o",
  // Top 60%
  "Q7o", "54o", "84s", "T5s", "96o",
  // Top 65%
  "K4o", "63s", "93s", "T4s", "75o",
  // Top 70%
  "Q6o", "85o", "52s", "K3o", "T3s",
  // Top 75%
  "42s", "64o", "Q5o", "94o", "T2s",
  // Top 80%
  "K2o", "92s", "83s", "53o", "73s",
  // Top 85%
  "Q4o", "43o", "74o", "J7o", "82s",
  // Top 90%
  "Q3o", "62s", "84o", "93o", "72s",
  // Top 95%
  "Q2o", "63o", "52o", "73o", "42o",
  // Top 100%
  "J6o", "32s", "82o", "92o", "62o",
  "T6o", "J5o", "32o", "72o"
];
```

**IMPORTANT** : Affine ce classement en utilisant des sources fiables. Le classement ci-dessus est approximatif. Idéalement, pré-calcule l'equity all-in de chaque main vs un range aléatoire et trie par equity décroissante.

### Double slider (comme Equilab)
- **Slider gauche** : borne inférieure du range (ex: PFR = 12%)
- **Slider droite** : borne supérieure du range (ex: VPIP = 25%)
- La zone entre les deux sliders = le range sélectionné
- Cela permet de modéliser des ranges de cold-call (VPIP - PFR) par exemple
- Afficher les % au-dessus de chaque curseur

### Input numérique
- Un champ texte à côté du slider où on peut taper directement un pourcentage
- La grille se met à jour en temps réel pendant la frappe (avec debounce de 200ms)

---

## Fonctionnalité 3 : Calculateur d'Equity

### Description
Le coeur mathématique. Calcule la probabilité de gain (equity) de chaque joueur dans un scénario donné.

### Interface
- **2 à 10 panneaux joueurs** (par défaut 2, bouton "+" pour ajouter)
- Chaque panneau joueur contient :
  - Un bouton pour ouvrir le sélecteur de range (ouvre la grille 13x13)
  - OU un champ pour entrer une main spécifique (ex: "AsKh")
  - OU un champ texte pour entrer une range en notation (ex: "QQ+, AKs, AKo")
  - L'equity affichée en gros (ex: "65.3%")
  - Win% / Tie% / Lose% détaillés

### Board (cartes communes)
- Un sélecteur de cartes pour le **Flop** (3 cartes), **Turn** (1 carte), **River** (1 carte)
- Sélecteur visuel : cliquer sur une carte ouvre un picker avec les 52 cartes (organisées par suit)
- Les cartes déjà utilisées (dans les mains ou le board) sont grisées/indisponibles (card removal)
- Possibilité de laisser le board vide (calcul preflop)

### Dead Cards
- Un champ pour spécifier des cartes mortes (cartes connues qui ne sont plus dans le deck)
- Utile pour les situations multi-way ou les reads

### Moteur de calcul
- **Méthode** : Simulation Monte Carlo
- **Nombre d'itérations** : Configurable (par défaut 100 000, option jusqu'à 1 000 000+)
- **Performance** : Utiliser des Web Workers pour ne pas bloquer l'UI
- **Barre de progression** : Afficher la progression du calcul en temps réel
- **Énumération exacte** : Si le nombre de combinaisons restantes est petit (< 50 000), faire un calcul exact au lieu de Monte Carlo
- **Card removal** : Le moteur DOIT prendre en compte les cartes déjà utilisées. Si le joueur 1 a AK, le joueur 2 ne peut pas avoir de combos contenant un As ou un Roi qui sont déjà dans la main du joueur 1.

### Évaluation des mains (Hand Evaluator)
Implémente un évaluateur de mains 5 cartes rapide. Méthode recommandée :
- Utilise un système de **lookup table** pour la vitesse
- Chaque main de 5 cartes doit recevoir un **rang numérique** (plus le rang est bas, plus la main est forte)
- Les catégories : Royal Flush > Straight Flush > Four of a Kind > Full House > Flush > Straight > Three of a Kind > Two Pair > One Pair > High Card
- Pour les mains de 7 cartes (5 board + 2 hole cards), évalue toutes les combinaisons C(7,5) = 21 et retourne la meilleure

---

## Fonctionnalité 4 : Ranges pondérées (Weighted Ranges)

### Description
Chaque main dans un range peut avoir un poids entre 0% et 100%. Par exemple, un joueur pourrait 3-bet AA 100% du temps mais AKo seulement 50% du temps.

### Interface
- Dans la grille, chaque cellule affiche son poids (opacité proportionnelle)
- Un champ de saisie de poids quand on sélectionne une cellule : slider 0-100%
- Mode "pinceau" : sélectionner un poids (ex: 50%) puis peindre sur les cellules
- Les combos pondérés comptent proportionnellement dans le calcul du nombre total de combos et du %

### Impact sur le calcul d'equity
- Une main avec un poids de 50% est incluse dans la simulation seulement 50% du temps
- Le moteur Monte Carlo doit gérer les poids : quand il sample une main du range, il respecte les probabilités pondérées

---

## Fonctionnalité 5 : Analyseur de Scénarios (Scenario Analyzer)

### Description
Permet d'analyser l'equity pour chaque carte possible au turn ou à la river.

### Fonctionnement
1. L'utilisateur entre les ranges des joueurs et un flop
2. Clic sur "Analyser les cartes du Turn"
3. L'app calcule l'equity pour chacune des 45 cartes restantes possibles au turn
4. Affiche un **tableau** trié avec :
   - La carte du turn
   - L'equity de chaque joueur
   - Code couleur : vert si la carte améliore l'equity du héro, rouge si elle la diminue
5. Même chose pour la river (en ayant spécifié le turn)

### Affichage
- Tableau avec colonnes triables
- Graphique en barres optionnel montrant la distribution d'equity par carte
- Regroupement par catégorie : "Cartes de cœur", "Cartes qui complètent le flush draw", etc.

---

## Fonctionnalité 6 : Equity Trainer (Quiz)

### Description
Un mode d'entraînement où l'app pose des questions d'equity à l'utilisateur pour qu'il améliore son intuition.

### Fonctionnement
1. L'app génère un scénario aléatoire (ou l'utilisateur configure les paramètres)
2. Affiche : main du héro, range estimée du vilain, board éventuel
3. L'utilisateur doit deviner son equity (slider ou input)
4. L'app révèle la vraie equity et calcule l'écart
5. Score cumulé basé sur la précision

### Modes de quiz
- **Preflop** : Main vs Range
- **Postflop** : Main vs Range sur un board donné
- **Range vs Range** : Plus avancé, estimer l'equity d'un range entier contre un autre
- **Personnalisé** : L'utilisateur définit les ranges/boards pour s'entraîner sur des spots spécifiques

### Statistiques
- Historique des quiz avec précision moyenne
- Graphique de progression
- Points faibles identifiés (ex: "Vous sous-estimez l'equity des suited connectors")

---

## Fonctionnalité 7 : Ranges prédéfinies

### Description
Bibliothèque de ranges prédéfinies pour différentes positions et actions.

### Ranges à inclure
Crée une bibliothèque complète avec au minimum :

```
- Par position (UTG, UTG+1, MP, MP+1, CO, BTN, SB, BB)
  - Open raise range (RFI)
  - 3-bet range
  - Call range (vs open)
  - 4-bet range
  - Call 3-bet range

- Par type de jeu
  - Cash game 6-max (100bb)
  - Cash game full ring (100bb)
  - Tournament (20bb, 30bb, 50bb, 100bb)

- Ranges de push/fold
  - Push charts par position et stack size (8bb à 25bb)
  - Call charts vs push par position
```

### Interface
- Menu déroulant / bibliothèque navigable
- Catégories et sous-catégories
- Possibilité de sauvegarder ses propres ranges personnalisées
- Import/Export de ranges au format texte

---

## Fonctionnalité 8 : Import/Export et notation

### Formats supportés
- **Notation texte Equilab** : `QQ+, AKs, ATs+, KQs, AKo` (compatible copier/coller avec Equilab, Flopzilla, etc.)
- **Notation Pokerstove** : Même format, compatibilité
- **Export en image** : Sauvegarder la grille de range en PNG/SVG
- **Sauvegarde de session** : Sauvegarder/charger une session complète (ranges de tous les joueurs + board + dead cards) en JSON

### Parsing de la notation
Le parser doit comprendre :
- `AA` → paire d'As (6 combos)
- `AKs` → As-Roi suited (4 combos)
- `AKo` → As-Roi offsuit (12 combos)
- `AK` → As-Roi toutes variantes (16 combos)
- `TT+` → Toutes les paires de TT à AA
- `TT-77` → Paires de 77 à TT
- `ATs+` → ATs, AJs, AQs, AKs
- `A2s-A5s` → A2s, A3s, A4s, A5s
- `AhKh` → Combo spécifique As de cœur + Roi de cœur
- Virgules comme séparateurs
- Espaces tolérés

---

## Fonctionnalité 9 : Interface utilisateur globale

### Layout principal
```
┌──────────────────────────────────────────────────────────┐
│  Menu Bar : Fichier | Ranges | Outils | Aide             │
├────────────────────────┬─────────────────────────────────┤
│                        │                                 │
│   GRILLE DE RANGE      │   PANNEAU EQUITY                │
│   13x13                │                                 │
│                        │   [Joueur 1: Range/Main]        │
│   (avec couleurs)      │   Equity: 65.3%                 │
│                        │                                 │
│                        │   [Joueur 2: Range/Main]        │
│                        │   Equity: 34.7%                 │
│                        │                                 │
│                        │   ─────────────────             │
│                        │   Board: [_][_][_] [_] [_]      │
│                        │   Dead cards: [_][_]            │
├────────────────────────┤                                 │
│  [||||||||||||--------]│   [  CALCULER  ]                │
│  Slider: 22.5%         │                                 │
│  Combos: 298           │   Résultats détaillés...        │
│  Range: QQ+, AKs...    │                                 │
└────────────────────────┴─────────────────────────────────┘
```

### Thème
- **Dark mode par défaut** (les joueurs de poker préfèrent le dark mode)
- Option light mode
- Couleurs inspirées du feutre vert de poker pour les éléments clés
- Police monospace pour les notations de mains

### Raccourcis clavier
- `Cmd+N` : Nouvelle session
- `Cmd+S` : Sauvegarder la session
- `Cmd+O` : Ouvrir une session
- `Cmd+C` : Copier le range en notation texte
- `Cmd+V` : Coller un range depuis la notation texte
- `Cmd+Z` / `Cmd+Shift+Z` : Undo/Redo sur les modifications de range
- `Espace` : Lancer le calcul d'equity
- `1-9` : Sélectionner le panneau joueur correspondant
- `Échap` : Fermer les popups/sous-menus

### Responsivité
- L'app doit être utilisable en fenêtre redimensionnée
- La grille de range doit maintenir un ratio carré
- Les panneaux doivent pouvoir être réorganisés (drag & drop optionnel)

---

## Fonctionnalité 10 : Heatmap d'equity

### Description
Une visualisation par heatmap sur la grille 13x13 montrant l'equity de chaque main du range du héro contre le range du vilain.

### Fonctionnement
1. L'utilisateur sélectionne un range pour le héro et un range pour le vilain
2. L'app calcule l'equity de chaque main individuelle du héro contre le range complet du vilain
3. La grille affiche un dégradé de couleur :
   - Rouge foncé : equity très haute (>70%)
   - Orange : equity bonne (55-70%)
   - Jaune : equity neutre (~50%)
   - Bleu clair : equity faible (35-50%)
   - Bleu foncé : equity très faible (<35%)
4. Hoverer une cellule affiche l'equity exacte dans un tooltip

---

## Spécifications techniques critiques

### Performance
- Le calcul de 100 000 simulations Monte Carlo doit prendre **moins de 2 secondes** pour hand vs range
- Le calcul range vs range (100k sims) doit prendre **moins de 10 secondes**
- L'UI ne doit JAMAIS freezer pendant les calculs (utilise des Web Workers)
- Le slider de pourcentage doit mettre à jour la grille en temps réel sans lag

### Précision
- L'equity calculée doit être précise à ±0.5% avec 100k simulations
- Le card removal doit être implémenté correctement partout
- Les combos doivent être comptés exactement (pas d'approximation)

### Persistance
- Les ranges personnalisées sauvegardées doivent persister entre les sessions (utilise electron-store ou un fichier JSON local)
- Historique des 10 dernières sessions
- Préférences utilisateur (thème, nombre d'itérations par défaut, etc.)

---

## Tests à écrire

### Tests du moteur de calcul
```typescript
// Exemples de tests à implémenter :

// Test equity connues
test("AA vs KK preflop ≈ 82%", () => {
  const equity = calculateEquity("AA", "KK", [], 500000);
  expect(equity.player1).toBeCloseTo(0.82, 1);
});

test("AKs vs QQ preflop ≈ 46%", () => {
  const equity = calculateEquity("AKs", "QQ", [], 500000);
  expect(equity.player1).toBeCloseTo(0.46, 1);
});

test("AA vs range random ≈ 85%", () => {
  const equity = calculateEquity("AA", "random", [], 500000);
  expect(equity.player1).toBeCloseTo(0.85, 1);
});

// Test hand evaluator
test("Royal flush bat straight flush", ...);
test("Full house bat flush", ...);
test("Deux paires bat une paire", ...);

// Test parsing de notation
test("parse 'TT+' = [TT, JJ, QQ, KK, AA]", ...);
test("parse 'A2s-A5s' = [A2s, A3s, A4s, A5s]", ...);
test("parse 'AhKh' = combo spécifique", ...);

// Test card removal
test("Si board = Ah Kh Qh, alors AhXx n'est plus possible", ...);

// Test comptage de combos
test("AA = 6 combos", ...);
test("AKs = 4 combos", ...);
test("AKo = 12 combos", ...);
test("AK (tout) = 16 combos", ...);
```

---

## Ordre de développement recommandé

1. **Phase 1** : Setup du projet Electron + React + TypeScript + Tailwind
2. **Phase 2** : Grille de range 13x13 avec sélection click + drag
3. **Phase 3** : Slider de pourcentage + classement des mains + notation texte
4. **Phase 4** : Hand evaluator (classement des mains de poker)
5. **Phase 5** : Moteur Monte Carlo avec Web Workers
6. **Phase 6** : Interface du calculateur d'equity (panneaux joueurs + board)
7. **Phase 7** : Card removal + dead cards
8. **Phase 8** : Ranges pondérées
9. **Phase 9** : Analyseur de scénarios
10. **Phase 10** : Heatmap d'equity
11. **Phase 11** : Equity Trainer
12. **Phase 12** : Ranges prédéfinies + Import/Export
13. **Phase 13** : Polish UI + raccourcis + persistance + build .dmg
14. **Phase 14** : Tests exhaustifs + optimisation performance

---

## Notes finales

- L'app doit être **100% offline** — aucune connexion internet requise
- Aucune dépendance à un serveur externe
- Le code doit être propre, bien typé (TypeScript strict), et commenté
- Chaque fonctionnalité doit pouvoir fonctionner indépendamment
- L'UI doit être intuitive pour quelqu'un qui connaît déjà Equilab
- Pense "poker player" : dark mode, rapide, précis, pas de fioritures inutiles