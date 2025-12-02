export interface ConceptNode {
  id: string;
  group: number;
  description: string;
}

export interface ConceptLink {
  source: string;
  target: string;
  value: number;
}

export interface ConceptGraphData {
  nodes: ConceptNode[];
  links: ConceptLink[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ConceptData {
  topic: string;
  summary: string;
  beginnerExplanation: string;
  advancedExplanation: string;
  keyTakeaways: string[];
  realWorldAnalogy: string;
}

export enum ViewState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  DASHBOARD = 'DASHBOARD',
  ERROR = 'ERROR'
}

export type DifficultyLevel = 'beginner' | 'advanced';