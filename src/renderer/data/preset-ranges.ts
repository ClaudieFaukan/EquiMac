export interface PresetCategory {
  name: string;
  presets: PresetRange[];
}

export interface PresetRange {
  name: string;
  notation: string;
}

export const PRESET_RANGES: PresetCategory[] = [
  {
    name: '6-max Cash (100bb) — RFI',
    presets: [
      { name: 'UTG Open', notation: '77+, ATs+, KQs, AJo+, KQo' },
      { name: 'MP Open', notation: '66+, A9s+, KJs+, QJs, JTs, ATo+, KQo' },
      { name: 'CO Open', notation: '55+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, 76s, A9o+, KTo+, QJo' },
      { name: 'BTN Open', notation: '33+, A2s+, K5s+, Q7s+, J7s+, T7s+, 97s+, 86s+, 75s+, 65s, 54s, A7o+, K9o+, Q9o+, J9o+, T9o' },
      { name: 'SB Open', notation: '44+, A2s+, K7s+, Q8s+, J8s+, T8s+, 97s+, 87s, 76s, 65s, A8o+, KTo+, QTo+, JTo' },
    ],
  },
  {
    name: '6-max Cash (100bb) — 3-bet',
    presets: [
      { name: 'vs UTG', notation: 'QQ+, AKs, AKo' },
      { name: 'vs MP', notation: 'JJ+, AQs+, AKo' },
      { name: 'vs CO', notation: 'TT+, AJs+, KQs, AQo+' },
      { name: 'vs BTN', notation: '99+, ATs+, KJs+, QJs, AJo+, KQo' },
      { name: 'vs SB (from BB)', notation: '88+, A9s+, KTs+, QJs, JTs, ATo+, KQo' },
    ],
  },
  {
    name: '6-max Cash (100bb) — Call',
    presets: [
      { name: 'BB vs UTG Open', notation: '66-22, ATs-A2s, KJs-K9s, QTs-Q9s, JTs-J9s, T9s, 98s, 87s, 76s, 65s, AJo-ATo, KQo-KJo' },
      { name: 'BB vs BTN Open', notation: '44-22, A9s-A2s, K8s-K2s, Q8s-Q2s, J7s+, T7s+, 97s+, 86s+, 75s+, 64s+, 53s+, 43s, A9o-A2o, K9o-K7o, Q9o+, J9o+, T9o' },
      { name: 'IP vs 3-bet (call)', notation: 'JJ-99, AQs-ATs, KQs-KJs, QJs, JTs, AQo' },
    ],
  },
  {
    name: 'Full Ring (9-max) — RFI',
    presets: [
      { name: 'UTG Open', notation: 'TT+, AQs+, AKo' },
      { name: 'MP Open', notation: '88+, AJs+, KQs, AQo+' },
      { name: 'CO Open', notation: '66+, A9s+, KTs+, QTs+, JTs, ATo+, KJo+' },
      { name: 'BTN Open', notation: '44+, A2s+, K8s+, Q9s+, J9s+, T8s+, 98s, 87s, 76s, A8o+, KTo+, QTo+, JTo' },
      { name: 'SB Open', notation: '55+, A2s+, K9s+, Q9s+, J9s+, T9s, 98s, A9o+, KTo+, QJo' },
    ],
  },
  {
    name: 'Tournament — Push/Fold',
    presets: [
      { name: 'BTN Push 15bb', notation: '22+, A2s+, K4s+, Q7s+, J8s+, T8s+, 97s+, 87s, 76s, A2o+, K8o+, Q9o+, JTo' },
      { name: 'BTN Push 10bb', notation: '22+, A2s+, K2s+, Q5s+, J7s+, T7s+, 97s+, 86s+, 76s, 65s, A2o+, K5o+, Q8o+, J9o+, T9o' },
      { name: 'SB Push 15bb', notation: '22+, A2s+, K7s+, Q9s+, J9s+, T9s, A2o+, K9o+, QTo+, JTo' },
      { name: 'SB Push 10bb', notation: '22+, A2s+, K2s+, Q6s+, J8s+, T8s+, 97s+, 87s, 76s, A2o+, K7o+, Q9o+, JTo' },
      { name: 'BB Call vs BTN 15bb', notation: '55+, A7s+, KTs+, QTs+, JTs, A9o+, KQo' },
      { name: 'BB Call vs BTN 10bb', notation: '33+, A4s+, K9s+, QTs+, JTs, A7o+, KTo+, QJo' },
      { name: 'BB Call vs SB 15bb', notation: '44+, A5s+, KTs+, QJs, JTs, A8o+, KQo' },
      { name: 'BB Call vs SB 10bb', notation: '33+, A3s+, K8s+, Q9s+, J9s+, T9s, A7o+, KTo+, QJo' },
    ],
  },
  {
    name: 'Tournament — Medium stacks',
    presets: [
      { name: 'CO Open 30bb', notation: '55+, A7s+, K9s+, Q9s+, J9s+, T9s, 98s, 87s, A9o+, KTo+, QJo' },
      { name: 'BTN Open 30bb', notation: '33+, A2s+, K6s+, Q8s+, J8s+, T8s+, 97s+, 86s+, 76s, 65s, 54s, A7o+, K9o+, Q9o+, J9o+, T9o' },
      { name: 'CO Open 20bb', notation: '66+, A8s+, KTs+, QTs+, JTs, ATo+, KQo' },
      { name: 'BTN Open 20bb', notation: '44+, A2s+, K7s+, Q9s+, J9s+, T8s+, 98s, 87s, 76s, A8o+, KTo+, QTo+, JTo' },
    ],
  },
];
