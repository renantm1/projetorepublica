export type Office =
  'Vereador' | 'Deputado estadual' | 'Deputado federal' | 'Senador' | 'Governador' | 'Presidente';
export type Difficulty = 'Aprendiz' | 'Estrategista' | 'Veterano';
export type Attribute =
  | 'charisma'
  | 'speech'
  | 'negotiation'
  | 'economics'
  | 'politics'
  | 'popularity'
  | 'integrity'
  | 'influence';
export interface Profile {
  firstName: string;
  lastName: string;
  age: number;
  state: string;
  party: string;
  ideology: number;
  economic: number;
  social: number;
  background: string;
  attributes: Record<Attribute, number>;
  difficulty: Difficulty;
  mode: 'presidential' | 'career';
  office: Office;
}
export interface Metrics {
  gdp: number;
  growth: number;
  inflation: number;
  selic: number;
  unemployment: number;
  debt: number;
  balance: number;
  fdi: number;
  exchange: number;
  income: number;
  poverty: number;
  inequality: number;
  security: number;
  education: number;
  health: number;
  infrastructure: number;
  trust: number;
  approval: number;
  stability: number;
  governors: number;
  pressure: number;
}
export type MetricKey = keyof Metrics;
export interface Party {
  id: string;
  name: string;
  ideology: number;
  economic: number;
  seats: number;
  senate: number;
  color: string;
  leader: string;
}
export interface Region {
  uf: string;
  name: string;
  region: string;
  population: number;
  electorate: number;
  income: number;
  ideology: number;
  economic: number;
  development: number;
  label: [number, number];
}
export interface HistoryEntry {
  id: string;
  turn: number;
  type: 'economy' | 'event' | 'congress' | 'election' | 'government';
  title: string;
  detail: string;
}
export type Effects = Partial<Metrics> & { capital?: number; momentum?: number; funds?: number };
export interface EventChoice {
  label: string;
  detail: string;
  effects: Effects;
  delayed?: Effects;
  delay?: number;
}
export interface PoliticalEvent {
  id: string;
  title: string;
  category: string;
  text: string;
  choices: EventChoice[];
}
export interface Policy {
  id: string;
  name: string;
  area: string;
  description: string;
  cost: number;
  capital: number;
  ideology: number;
  effects: Partial<Metrics>;
  lag: number;
}
export interface Bill {
  policyId: string;
  level: number;
  amendment: boolean;
  status: 'debate' | 'senate' | 'veto' | 'approved' | 'rejected' | 'vetoed';
  deputies?: number;
  senators?: number;
}
export interface Candidate {
  id: string;
  name: string;
  party: string;
  ideology: number;
  economic: number;
  popularity: number;
  ambition: number;
  negotiation: number;
  strategy: string;
}
export interface ElectionResult {
  id: string;
  name: string;
  party: string;
  share: number;
}
export interface Elections {
  funds: number;
  momentum: number;
  exposure: number;
  actionsThisTurn: number;
  rivals: Candidate[];
  phase: 'campaign' | 'runoff' | 'complete';
  firstRound: ElectionResult[];
  runoff: ElectionResult[];
  won: boolean | null;
  resultsByState: Record<string, number>;
}
export interface Game {
  version: 1;
  seed: number;
  profile: Profile;
  turn: number;
  metrics: Metrics;
  capital: number;
  actions: number;
  relations: Record<string, number>;
  coalition: string[];
  policies: Record<string, number>;
  activePolicies: Record<string, number>;
  implementations: { policyId: string; level: number; due: number }[];
  bill: Bill | null;
  groups: Record<string, number>;
  eventId: string | null;
  seenEvents: string[];
  delayed: { due: number; effects: Effects; source: string }[];
  history: HistoryEntry[];
  series: { turn: number; approval: number; growth: number; inflation: number; debt: number }[];
  elections: Elections;
  finished: boolean;
}
export type GameAction =
  | { type: 'advance' }
  | { type: 'decide'; choice: number }
  | { type: 'propose'; policy: string; level: number }
  | { type: 'amend' }
  | { type: 'negotiate'; party: string; approach: 'agenda' | 'dialogue' | 'budget' }
  | { type: 'vote' }
  | { type: 'veto'; veto: boolean }
  | {
      type: 'campaign';
      strategy: 'debate' | 'advertising' | 'visit' | 'interview' | 'fundraising';
      uf?: string;
    }
  | { type: 'diplomacy'; approach: 'trade' | 'climate' | 'regional' }
  | { type: 'runoff' };
