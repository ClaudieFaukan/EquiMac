export type Lang = 'en' | 'fr';

const translations = {
  // App
  'switch_light': { en: 'Switch to light mode', fr: 'Passer en mode clair' },
  'switch_dark': { en: 'Switch to dark mode', fr: 'Passer en mode sombre' },
  'heatmap_title': { en: 'Heatmap — P1 vs P2', fr: 'Heatmap — J1 vs J2' },
  'back_to_grid': { en: 'Back to grid', fr: 'Retour grille' },
  'computed_in': { en: 'Computed in', fr: 'Calculé en' },
  'range_player': { en: 'Range — Player', fr: 'Range — Joueur' },
  'tab_calculator': { en: 'Calculator', fr: 'Calculateur' },
  'tab_quiz': { en: 'Quiz', fr: 'Quiz' },
  'tab_filter': { en: 'Filter', fr: 'Filtre' },
  'tab_ranges': { en: 'Ranges', fr: 'Ranges' },

  // Calculator
  'player': { en: 'Player', fr: 'Joueur' },
  'add_player': { en: '+ Player', fr: '+ Joueur' },
  'remove_player': { en: '− Player', fr: '− Joueur' },
  'iterations': { en: 'Iterations', fr: 'Itérations' },
  'computing': { en: 'Computing...', fr: 'Calcul...' },
  'calculate': { en: 'Calculate', fr: 'Calculer' },
  'heatmap_tooltip': { en: 'Shows the strength of each P1 hand against P2\'s range using color codes on the grid (green = strong, red = weak).', fr: 'Affiche la force de chaque main du J1 contre le range du J2 par un code couleur sur la grille (vert = forte, rouge = faible).' },
  'simulations_in': { en: 'simulations in', fr: 'simulations en' },

  // Player Panel
  'clear': { en: 'Clear', fr: 'Vider' },
  'grid': { en: 'Grid', fr: 'Grille' },
  'apply': { en: 'Apply', fr: 'Appliquer' },

  // Brush Weight
  'weight': { en: 'Weight', fr: 'Poids' },
  'weight_tooltip': { en: 'Frequency of hand inclusion in the range. E.g.: 50% = the hand is played half the time. Select a weight then paint on the grid.', fr: 'Fréquence d\'inclusion d\'une main dans le range. Ex: 50% = la main est jouée une fois sur deux. Sélectionnez un poids puis peignez sur la grille.' },

  // Board
  'clear_board': { en: 'Clear board', fr: 'Vider le board' },
  'dead_cards': { en: 'Dead Cards', fr: 'Dead Cards' },
  'clear_dead_cards': { en: 'Clear dead cards', fr: 'Vider les dead cards' },
  'click_to_remove': { en: 'Click to remove', fr: 'Cliquer pour retirer' },

  // Presets
  'presets': { en: 'Presets', fr: 'Presets' },
  'load_preset': { en: 'Load a preset range', fr: 'Charger un range prédéfini' },
  'no_active_presets': { en: 'No active presets. Enable them in the Ranges tab.', fr: 'Aucun preset actif. Activez-les dans l\'onglet Ranges.' },

  // Range Stats
  'enter_range': { en: 'Enter a range: QQ+, AKs, ATs+, KQs...', fr: 'Entrez un range: QQ+, AKs, ATs+, KQs...' },

  // Scenario Analyzer
  'analyzer': { en: 'Analyzer', fr: 'Analyseur' },
  'close_results': { en: 'Close results', fr: 'Fermer les résultats' },
  'analyzing': { en: 'Analyzing...', fr: 'Analyse...' },
  'analyze': { en: 'Analyze', fr: 'Analyser' },
  'analyzer_hint': { en: 'Enter 2 ranges and a flop (or flop+turn) to analyze the next cards.', fr: 'Entrez 2 ranges et un flop (ou flop+turn) pour analyser les cartes suivantes.' },
  'cards_analyzed_in': { en: 'cards analyzed in', fr: 'cartes analysées en' },
  'sort_by_card': { en: 'Sort by card', fr: 'Trier par carte' },
  'sort_by_equity': { en: 'Sort by equity', fr: 'Trier par equity' },
  'card': { en: 'Card', fr: 'Carte' },

  // Range Manager
  'range_library': { en: 'Range Library', fr: 'Bibliothèque de ranges' },
  'save_from_grid': { en: 'Save from grid', fr: 'Sauvegarder la grille' },
  'new_range': { en: '+ New range', fr: '+ Nouveau range' },
  'new_category': { en: '+ Category', fr: '+ Catégorie' },
  'export': { en: 'Export', fr: 'Exporter' },
  'import': { en: 'Import', fr: 'Importer' },
  'new_category_label': { en: 'New category', fr: 'Nouvelle catégorie' },
  'category_name_placeholder': { en: 'Category name...', fr: 'Nom de la catégorie...' },
  'new_range_label': { en: 'New range', fr: 'Nouveau range' },
  'range_name_placeholder': { en: 'Name (e.g.: My UTG open)', fr: 'Nom (ex: Mon open UTG)' },
  'range_notation_placeholder': { en: 'Notation (e.g.: TT+, AQs+, AKo)', fr: 'Notation (ex: TT+, AQs+, AKo)' },
  'category_select': { en: '— Category —', fr: '— Catégorie —' },
  'create': { en: 'Create', fr: 'Créer' },
  'cancel': { en: 'Cancel', fr: 'Annuler' },
  'delete_category_confirm': { en: 'and all its ranges?', fr: 'et tous ses ranges ?' },
  'delete_category': { en: 'Delete category', fr: 'Supprimer la catégorie' },
  'no_ranges': { en: 'No ranges', fr: 'Aucun range' },
  'load_to_grid': { en: 'Load to grid', fr: 'Charger dans la grille' },
  'load': { en: 'Load', fr: 'Charger' },
  'edit': { en: 'Edit', fr: 'Éditer' },
  'built_in': { en: 'Built-in', fr: 'Intégré' },

  // Equity Filter
  'equity_filter': { en: 'Equity Filter', fr: 'Filtre d\'equity' },
  'filter_desc': { en: 'Define the opponent\'s range (synced with the grid), then find all hands with a target equity against that range.', fr: 'Définissez le range adverse (synchro avec la grille), puis trouvez toutes les mains avec une equity cible contre ce range.' },
  'opponent_range': { en: 'Opponent range', fr: 'Range adverse' },
  'or_top': { en: 'or Top', fr: 'ou Top' },
  'target_equity': { en: 'Target equity', fr: 'Equity cible' },
  'at_least': { en: 'At least (≥)', fr: 'Au moins (≥)' },
  'at_most': { en: 'At most (≤)', fr: 'Au plus (≤)' },
  'find_hands': { en: 'Find hands', fr: 'Trouver les mains' },
  'hands': { en: 'hands', fr: 'mains' },
  'hands_with': { en: 'Hands with', fr: 'Mains avec' },
  'notation': { en: 'Notation:', fr: 'Notation :' },
  'no_hands': { en: '(no hands)', fr: '(aucune main)' },
  'copy': { en: 'Copy', fr: 'Copier' },

  // Quiz
  'quiz': { en: 'Quiz', fr: 'Quiz' },
  'manage': { en: 'Manage', fr: 'Gérer' },
  'equity_quiz': { en: 'Equity Quiz', fr: 'Quiz d\'equity' },
  'equity_quiz_desc': { en: 'Estimate the equity percentage of your hand vs a range', fr: 'Estimez le pourcentage d\'equity de votre main vs un range' },
  'action_quizzes': { en: 'Action quizzes', fr: 'Questionnaires d\'actions' },
  'number_of_questions': { en: 'Number of questions', fr: 'Nombre de questions' },
  'custom': { en: 'Custom', fr: 'Libre' },
  'back': { en: 'Back', fr: 'Retour' },
  'quit': { en: 'Quit', fr: 'Quitter' },
  'your_hand': { en: 'Your hand', fr: 'Votre main' },
  'estimate_equity': { en: 'Estimate your equity:', fr: 'Estimez votre equity :' },
  'submit': { en: 'Submit', fr: 'Valider' },
  'loading': { en: 'Loading...', fr: 'Chargement...' },
  'view_results': { en: 'View results', fr: 'Voir les résultats' },
  'next': { en: 'Next', fr: 'Suivante' },
  'results': { en: 'Results', fr: 'Résultats' },
  'avg_error_over': { en: 'Average error over', fr: 'Écart moyen sur' },
  'questions': { en: 'questions', fr: 'questions' },
  'excellent': { en: 'Excellent', fr: 'Excellent' },
  'not_bad': { en: 'Not bad', fr: 'Pas mal' },
  'needs_work': { en: 'Needs work', fr: 'À travailler' },
  'hand': { en: 'Hand', fr: 'Main' },
  'answer': { en: 'Answer', fr: 'Réponse' },
  'guess': { en: 'Guess', fr: 'Estimation' },
  'error': { en: 'Error', fr: 'Écart' },
  'correct_answers': { en: 'correct answers', fr: 'bonnes réponses' },
  'correct': { en: 'correct', fr: 'correct' },

  // Quiz Manager
  'manage_quizzes': { en: 'Manage quizzes', fr: 'Gérer les questionnaires' },
  'create_btn': { en: '+ Create', fr: '+ Créer' },
  'new_quiz': { en: 'New quiz', fr: 'Nouveau questionnaire' },
  'quiz_name': { en: 'Quiz name', fr: 'Nom du questionnaire' },
  'description_optional': { en: 'Description (optional)', fr: 'Description (optionnel)' },
  'questions_added': { en: 'added', fr: 'ajoutée(s)' },
  'add_question': { en: '+ Add question', fr: '+ Ajouter une question' },
  'hand_placeholder': { en: 'Hand (e.g.: AKs)', fr: 'Main (ex: AKs)' },
  'villain_action': { en: 'Villain action', fr: 'Action vilain' },
  'explanation_optional': { en: 'Explanation (optional)', fr: 'Explication (optionnel)' },
  'add': { en: 'Add', fr: 'Ajouter' },
  'create_quiz': { en: 'Create quiz', fr: 'Créer le questionnaire' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}

export default translations;
