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
    description: 'Open raise decisions in 6-max cash game',
    type: 'action',
    createdAt: 0,
    questions: [
      { id: 'rfi-1', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: 'ATs', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'ATs is in the standard UTG open range' },
      { id: 'rfi-2', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: '87s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'fold', explanation: '87s is too weak to open UTG' },
      { id: 'rfi-3', situation: '6-max 100bb, Folds to you', heroPosition: 'CO', heroHand: 'K9s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'K9s is a standard CO open' },
      { id: 'rfi-4', situation: '6-max 100bb, Folds to you', heroPosition: 'BTN', heroHand: '54s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: '54s opens on BTN for its postflop playability' },
      { id: 'rfi-5', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: 'QTo', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'fold', explanation: 'QTo is too weak to open UTG' },
      { id: 'rfi-6', situation: '6-max 100bb, Folds to you', heroPosition: 'CO', heroHand: '66', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'All pairs open from CO' },
      { id: 'rfi-7', situation: '6-max 100bb, Folds to you', heroPosition: 'BTN', heroHand: 'J7s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'J7s is a standard BTN open' },
      { id: 'rfi-8', situation: '6-max 100bb, Folds to you', heroPosition: 'SB', heroHand: 'A6s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'A6s opens from SB vs BB' },
      { id: 'rfi-9', situation: '6-max 100bb, Folds to you', heroPosition: 'UTG', heroHand: 'KJo', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'raise', explanation: 'KJo is borderline UTG, standard open' },
      { id: 'rfi-10', situation: '6-max 100bb, Folds to you', heroPosition: 'MP', heroHand: 'T8s', villainAction: 'Folds to Hero', options: ['fold', 'raise'], correctAction: 'fold', explanation: 'T8s is below the MP open threshold' },
    ],
  },
  {
    id: 'builtin-3bet-defense',
    name: '3-Bet or Fold vs Open',
    description: 'Reacting to an open raise',
    type: 'action',
    createdAt: 0,
    questions: [
      { id: '3b-1', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'BTN', heroHand: 'AQo', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'AQo is a standard 3-bet vs UTG open in position' },
      { id: '3b-2', situation: '6-max 100bb, CO opens 2.5bb', heroPosition: 'BTN', heroHand: 'JTs', villainAction: 'CO open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'call', explanation: 'JTs has good playability, call in position' },
      { id: '3b-3', situation: '6-max 100bb, BTN opens 2.5bb', heroPosition: 'BB', heroHand: 'A5s', villainAction: 'BTN open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'A5s is a good 3-bet bluff from BB vs BTN' },
      { id: '3b-4', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'CO', heroHand: '77', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'call', explanation: '77 calls for set value vs a tight UTG range' },
      { id: '3b-5', situation: '6-max 100bb, MP opens 2.5bb', heroPosition: 'BTN', heroHand: 'KK', villainAction: 'MP open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'KK always 3-bets for value' },
      { id: '3b-6', situation: '6-max 100bb, CO opens 2.5bb', heroPosition: 'SB', heroHand: 'QJo', villainAction: 'CO open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'fold', explanation: 'QJo out of position without initiative, fold in SB' },
      { id: '3b-7', situation: '6-max 100bb, BTN opens 2.5bb', heroPosition: 'SB', heroHand: 'TT', villainAction: 'BTN open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'TT is a value 3-bet vs BTN open' },
      { id: '3b-8', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'BB', heroHand: 'K8s', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'call', explanation: 'K8s is too weak to 3-bet vs UTG but good price in BB' },
      { id: '3b-9', situation: '6-max 100bb, CO opens 2.5bb', heroPosition: 'BTN', heroHand: 'A4s', villainAction: 'CO open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: '3bet', explanation: 'A4s is a good 3-bet in position vs CO' },
      { id: '3b-10', situation: '6-max 100bb, UTG opens 2.5bb', heroPosition: 'MP', heroHand: 'J9s', villainAction: 'UTG open 2.5bb', options: ['fold', 'call', '3bet'], correctAction: 'fold', explanation: 'J9s cannot profitably call or 3-bet vs UTG from MP' },
    ],
  },
  {
    id: 'builtin-push-fold',
    name: 'Push or Fold (10-15bb)',
    description: 'Push/fold decisions in short stack tournaments',
    type: 'action',
    createdAt: 0,
    questions: [
      { id: 'pf-1', situation: 'Tournament, 12bb effective', heroPosition: 'BTN', heroHand: 'A7o', villainAction: 'Folds to Hero', stackBB: 12, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'A7o is a standard BTN push at 12bb' },
      { id: 'pf-2', situation: 'Tournament, 10bb effective', heroPosition: 'SB', heroHand: 'K5s', villainAction: 'Folds to Hero', stackBB: 10, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'K5s pushes SB vs BB at 10bb' },
      { id: 'pf-3', situation: 'Tournament, 15bb effective', heroPosition: 'UTG', heroHand: 'J8s', villainAction: 'Folds to Hero', stackBB: 15, options: ['fold', 'allin'], correctAction: 'fold', explanation: 'J8s is too weak to push UTG at 15bb' },
      { id: 'pf-4', situation: 'Tournament, 10bb effective', heroPosition: 'CO', heroHand: '33', villainAction: 'Folds to Hero', stackBB: 10, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'Any pair is a push from CO at 10bb' },
      { id: 'pf-5', situation: 'Tournament, 12bb, BTN pushes', heroPosition: 'BB', heroHand: 'A9o', villainAction: 'BTN push all-in', stackBB: 12, options: ['fold', 'call'], correctAction: 'call', explanation: 'A9o calls vs BTN push at 12bb' },
      { id: 'pf-6', situation: 'Tournament, 15bb, CO pushes', heroPosition: 'BTN', heroHand: 'KJo', villainAction: 'CO push all-in', stackBB: 15, options: ['fold', 'call'], correctAction: 'call', explanation: 'KJo calls vs CO push at 15bb with good odds' },
      { id: 'pf-7', situation: 'Tournament, 10bb, SB pushes', heroPosition: 'BB', heroHand: 'Q7o', villainAction: 'SB push all-in', stackBB: 10, options: ['fold', 'call'], correctAction: 'call', explanation: 'Q7o calls vs SB push at 10bb (wide range)' },
      { id: 'pf-8', situation: 'Tournament, 15bb effective', heroPosition: 'BTN', heroHand: 'T9s', villainAction: 'Folds to Hero', stackBB: 15, options: ['fold', 'allin'], correctAction: 'allin', explanation: 'T9s is a standard BTN push at 15bb' },
      { id: 'pf-9', situation: 'Tournament, 10bb, UTG pushes', heroPosition: 'BB', heroHand: 'A3o', villainAction: 'UTG push all-in', stackBB: 10, options: ['fold', 'call'], correctAction: 'fold', explanation: 'A3o folds vs UTG push — range too tight' },
      { id: 'pf-10', situation: 'Tournament, 12bb effective', heroPosition: 'SB', heroHand: '55', villainAction: 'Folds to Hero', stackBB: 12, options: ['fold', 'allin'], correctAction: 'allin', explanation: '55 pushes SB at 12bb without hesitation' },
    ],
  },
];
