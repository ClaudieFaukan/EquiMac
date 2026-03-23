/** Types of quiz questions */
export type QuizType = 'equity' | 'action';

export type PokerAction = 'fold' | 'call' | 'raise' | '3bet' | '4bet' | 'allin';

export const ACTION_LABELS: Record<PokerAction, string> = {
  fold: 'Fold',
  call: 'Call',
  raise: 'Raise',
  '3bet': '3-Bet',
  '4bet': '4-Bet',
  allin: 'All-in',
};

export const ACTION_COLORS: Record<PokerAction, string> = {
  fold: 'bg-red-600',
  call: 'bg-sky-600',
  raise: 'bg-emerald-600',
  '3bet': 'bg-amber-600',
  '4bet': 'bg-purple-600',
  allin: 'bg-rose-700',
};

export type Position = 'UTG' | 'MP' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface ActionQuestion {
  id: string;
  /** Description of the situation */
  situation: string;
  /** Hero's position */
  heroPosition: Position;
  /** Hero's hand notation (e.g. "AKs", "TT", "87s") */
  heroHand: string;
  /** Villain action/context */
  villainAction: string;
  /** Stack depth in BB */
  stackBB?: number;
  /** Available actions for the player to choose from */
  options: PokerAction[];
  /** The correct action */
  correctAction: PokerAction;
  /** Optional explanation */
  explanation?: string;
}

export interface Questionnaire {
  id: string;
  name: string;
  description?: string;
  type: QuizType;
  /** Only for 'action' type */
  questions?: ActionQuestion[];
  /** For 'equity' type: mode */
  equityMode?: 'preflop' | 'flop';
  /** Number of questions for equity type */
  equityCount?: number;
  createdAt: number;
}

export interface QuestionnaireExport {
  version: 1;
  questionnaires: Questionnaire[];
}

/** Built-in action questionnaires */
export const BUILTIN_QUESTIONNAIRES: Questionnaire[] = [
  {
    id: 'builtin-rfi-6max',
    name: 'RFI 6-max (100bb)',
    description: 'Décisions d\'open raise en 6-max cash game',
    type: 'action',
    createdAt: 0,
    questions: [
      { id: 'rfi-1', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: 'ATs', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'ATs est dans le range d\'open UTG standard' },
      { id: 'rfi-2', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: '87s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'fold', explanation: '87s est trop faible pour open UTG' },
      { id: 'rfi-3', situation: '6-max 100bb, Folds to you', heroPosition: 'CO', heroHand: 'K9s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'K9s est un open standard au CO' },
      { id: 'rfi-4', situation: '6-max 100bb, Folds to you', heroPosition: 'BTN', heroHand: '54s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: '54s s\'ouvre au BTN pour sa jouabilité postflop' },
      { id: 'rfi-5', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: 'QTo', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'fold', explanation: 'QTo est trop faible pour open UTG' },
      { id: 'rfi-6', situation: '6-max 100bb, Folds to you', heroPosition: 'CO', heroHand: '66', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'Toutes les paires s\'ouvrent au CO' },
      { id: 'rfi-7', situation: '6-max 100bb, Folds to you', heroPosition: 'BTN', heroHand: 'J7s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'J7s est un open BTN standard' },
      { id: 'rfi-8', situation: '6-max 100bb, Folds to you', heroPosition: 'SB', heroHand: 'A6s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'A6s s\'ouvre en SB vs BB' },
      { id: 'rfi-9', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: 'KJo', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'KJo est borderline UTG, open standard' },
      { id: 'rfi-10', situation: '6-max 100bb, Folds to you', heroPosition: 'MP', heroHand: 'T8s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'fold', explanation: 'T8s est en dessous du seuil d\'open MP' },
    ],
  },
  {
    id: 'builtin-3bet-defense',
    name: '3-Bet ou Fold vs Open',
    description: 'Réagir face à un open raise',
    type: 'action',
    createdAt: 0,
    questions: [
      { id: '3b-1', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'BTN', heroHand: 'AQo', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'AQo est un 3-bet standard vs UTG open en position' },
      { id: '3b-2', situation: '6-max 100bb, CO opens 2.5bb', heroPosition: 'BTN', heroHand: 'JTs', villainAction: 'CO open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'call', explanation: 'JTs a une bonne jouabilité, call en position' },
      { id: '3b-3', situation: '6-max 100bb, BTN opens 2.5bb', heroPosition: 'BB', heroHand: 'A5s', villainAction: 'BTN open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'A5s est un bon 3-bet bluff du BB vs BTN' },
      { id: '3b-4', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'CO', heroHand: '77', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'call', explanation: '77 call pour set value vs un range UTG tight' },
      { id: '3b-5', situation: '6-max 100bb, MP opens 2.5bb', heroPosition: 'BTN', heroHand: 'KK', villainAction: 'MP open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'KK se 3-bet toujours pour value' },
      { id: '3b-6', situation: '6-max 100bb, CO opens 2.5bb', heroPosition: 'SB', heroHand: 'QJo', villainAction: 'CO open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'fold', explanation: 'QJo hors position sans initiative, fold en SB' },
      { id: '3b-7', situation: '6-max 100bb, BTN opens 2.5bb', heroPosition: 'SB', heroHand: 'TT', villainAction: 'BTN open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'TT est un 3-bet value vs BTN open' },
      { id: '3b-8', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'BB', heroHand: 'K8s', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'call', explanation: 'K8s est trop faible pour 3-bet vs UTG mais bon prix en BB' },
      { id: '3b-9', situation: '6-max 100bb, CO opens 2.5bb', heroPosition: 'BTN', heroHand: 'A4s', villainAction: 'CO open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'A4s est un bon 3-bet en position vs CO' },
      { id: '3b-10', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'MP', heroHand: 'J9s', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'fold', explanation: 'J9s ne peut ni call ni 3-bet profitablement vs UTG en MP' },
    ],
  },
  {
    id: 'builtin-push-fold',
    name: 'Push or Fold (10-15bb)',
    description: 'Décisions push/fold en tournoi short stack',
    type: 'action',
    createdAt: 0,
    questions: [
      { id: 'pf-1', situation: 'Tournoi, 12bb effective', heroPosition: 'BTN', heroHand: 'A7o', villainAction: 'Folds to Hero', stackBB: 12, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'A7o est un push standard BTN 12bb' },
      { id: 'pf-2', situation: 'Tournoi, 10bb effective', heroPosition: 'SB', heroHand: 'K5s', villainAction: 'Folds to Hero', stackBB: 10, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'K5s push SB vs BB à 10bb' },
      { id: 'pf-3', situation: 'Tournoi, 15bb effective', heroPosition: 'UTG', heroHand: 'J8s', villainAction: 'Folds to Hero', stackBB: 15, options: ['fold', 'allin'], correctAction: 'fold', explanation: 'J8s trop faible pour push UTG à 15bb' },
      { id: 'pf-4', situation: 'Tournoi, 10bb effective', heroPosition: 'CO', heroHand: '33', villainAction: 'Folds to Hero', stackBB: 10, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'Toute paire est un push CO à 10bb' },
      { id: 'pf-5', situation: 'Tournoi, 12bb, BTN pushes', heroPosition: 'BB', heroHand: 'A9o', villainAction: 'BTN push all-in', stackBB: 12, options: ['fold', 'call'], correctAction: 'call', explanation: 'A9o call vs BTN push 12bb' },
      { id: 'pf-6', situation: 'Tournoi, 15bb, CO pushes', heroPosition: 'BTN', heroHand: 'KJo', villainAction: 'CO push all-in', stackBB: 15, options: ['fold', 'call'], correctAction: 'call', explanation: 'KJo call vs CO push à 15bb avec bonne cote' },
      { id: 'pf-7', situation: 'Tournoi, 10bb, SB pushes', heroPosition: 'BB', heroHand: 'Q7o', villainAction: 'SB push all-in', stackBB: 10, options: ['fold', 'call'], correctAction: 'call', explanation: 'Q7o call vs SB push à 10bb (large range)' },
      { id: 'pf-8', situation: 'Tournoi, 15bb effective', heroPosition: 'BTN', heroHand: 'T9s', villainAction: 'Folds to Hero', stackBB: 15, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'T9s est un push standard BTN 15bb' },
      { id: 'pf-9', situation: 'Tournoi, 10bb, UTG pushes', heroPosition: 'BB', heroHand: 'A3o', villainAction: 'UTG push all-in', stackBB: 10, options: ['fold', 'call'], correctAction: 'fold', explanation: 'A3o fold vs UTG push — range trop tight' },
      { id: 'pf-10', situation: 'Tournoi, 12bb effective', heroPosition: 'SB', heroHand: '55', villainAction: 'Folds to Hero', stackBB: 12, options: ['fold', 'allin'], correctAction: 'allin', explanation: '55 push SB à 12bb sans hésitation' },
    ],
  },
];
